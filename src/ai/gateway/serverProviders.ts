// src/ai/gateway/serverProviders.ts
// Server-side provider implementations for Jev and Gemini.
// Isolates provider credentials on the server side with non-blocking fallbacks and safety firewall enforcement.

import type {
  AiContext,
  AiEnvelope,
  JevRecommendation,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
} from '../types';
import { validateJevEnvelope, validateGeminiEnvelope } from '../safetyFirewall';
import { generateDeterministicJevFallback } from '../jev/jevAdapter';
import { generateDeterministicGeminiFallback } from '../gemini/geminiAdapter';
import { JEV_TIMEOUT_MS, JEV_CONFIDENCE_THRESHOLD } from '../jev/jevPolicy';
import { GEMINI_TIMEOUT_MS, GEMINI_CONFIDENCE_THRESHOLD, GEMINI_DEFAULT_MODEL } from '../gemini/geminiPolicy';
import type { GatewayServerEnv } from './gatewayTypes';

function getServerEnv(env?: GatewayServerEnv): GatewayServerEnv {
  if (env) return env;
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    const proc = (globalThis as { process?: { env?: GatewayServerEnv } }).process;
    return proc?.env || {};
  }
  return {};
}

/**
 * Server-side Jev Decision Provider.
 * Checks server environment variables (JEV_API_URL, JEV_API_KEY).
 * Falls back deterministically if unconfigured or rejected by safety firewall.
 */
export class ServerJevProvider {
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(env?: GatewayServerEnv) {
    const serverEnv = getServerEnv(env);
    this.apiUrl = serverEnv.JEV_API_URL;
    this.apiKey = serverEnv.JEV_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiUrl.trim().length > 0);
  }

  public async recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation>> {
    // If JEV_API_URL is absent: immediately return deterministic fallback without latency
    if (!this.isConfigured()) {
      return generateDeterministicJevFallback(
        context,
        'Jev API endpoint unconfigured on server. Using deterministic director.'
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), JEV_TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (this.apiKey && this.apiKey.trim().length > 0) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          version: '1.0',
          requestId: `jev-srv-${Date.now()}`,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return generateDeterministicJevFallback(
          context,
          `Jev provider returned HTTP ${response.status}. Fallback activated.`
        );
      }

      const rawJson = await response.json();

      // Enforce strict safety firewall
      const validation = validateJevEnvelope(rawJson);
      if (!validation.valid || !validation.envelope) {
        return generateDeterministicJevFallback(
          context,
          `Jev output rejected by Safety Firewall: ${validation.error || 'Schema validation failure'}`
        );
      }

      if (validation.envelope.confidence < JEV_CONFIDENCE_THRESHOLD) {
        return generateDeterministicJevFallback(
          context,
          `Jev confidence ${validation.envelope.confidence}% below required threshold (${JEV_CONFIDENCE_THRESHOLD}%).`
        );
      }

      return validation.envelope;
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const reason = isTimeout
        ? `Jev request timed out after ${JEV_TIMEOUT_MS}ms.`
        : `Jev network error: ${err instanceof Error ? err.message : 'Unknown'}`;

      return generateDeterministicJevFallback(context, `${reason} Deterministic fallback activated.`);
    }
  }
}

import { GoogleGenAI, Type } from '@google/genai';

/**
 * Server-side Gemini Creative Provider.
 * Connects to the real Google Gemini API via official @google/genai SDK.
 * Checks server environment variables (GEMINI_API_KEY, GEMINI_MODEL).
 * Completely server-isolated with bounded timeout, untrusted output validation, and safety firewall.
 * Falls back deterministically if unconfigured or rejected by safety firewall.
 */
export class ServerGeminiProvider {
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private aiClient: GoogleGenAI | null = null;

  constructor(env?: GatewayServerEnv) {
    const serverEnv = getServerEnv(env);
    this.apiKey = serverEnv.GEMINI_API_KEY?.trim();
    this.model = serverEnv.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;

    if (this.apiKey && this.apiKey.length > 0) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch {
        this.aiClient = null;
      }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0 && this.aiClient);
  }

  public getModel(): string {
    return this.model;
  }

  public async narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>> {
    // If GEMINI_API_KEY is absent or client failed to initialize: immediately return deterministic fallback without latency
    if (!this.isConfigured() || !this.aiClient) {
      return generateDeterministicGeminiFallback(
        request,
        'Gemini API key unconfigured on server. Using deterministic creative narrator.'
      );
    }

    try {
      const isHinglish = request.language === 'hinglish';

      const languageInstruction = isHinglish
        ? 'MANDATORY LANGUAGE RULE: Output MUST be in natural, realistic Roman Hinglish (Hindi written using the English/Latin alphabet, e.g., "Dhuaan tezi se stairwell mein badh raha hai. Hosh sambhalo aur neeche jhuko."). NEVER output Devanagari script.'
        : 'MANDATORY LANGUAGE RULE: Output MUST be in clear, atmospheric, serious English.';

      const systemInstruction = [
        'You are the narrative atmosphere layer for SURVIVE, a realistic emergency-response simulation.',
        'Your SOLE responsibility is to describe sensory conditions, environmental tension, companion reactions, or brief dialogue.',
        'You do NOT determine safety outcomes, scores, numerical hazard levels, or player survival.',
        'You NEVER provide authoritative safety instructions, procedures, or medical advice.',
        'You NEVER tell the player that an action is guaranteed safe or unsafe.',
        'The deterministic simulation engine is the sole authority for safety truth.',
        'Output strictly JSON matching the required schema: {"text": "...", "tone": "..."}.',
        'Maximum 2 concise sentences (under 220 characters total).',
        languageInstruction,
      ].join('\n');

      const promptLines = [
        `Disaster: ${request.context.disasterType}`,
        `Scene Context: ${request.context.situationTitle}`,
        `Hazard State: ${request.context.hazardBand} (${request.context.hazardLevel}%)`,
        `Stress Level: ${request.context.panicBand} (${request.context.panicLevel}/100)`,
        `Environment: ${request.context.environmentStatus}`,
        `Request Type: ${request.type}`,
        `Speaker: ${request.speakerName || request.speakerRole || 'Narrator'}`,
        `Target Language: ${isHinglish ? 'Roman Hinglish' : 'English'}`,
      ];

      if (request.type === 'NPC_DIALOGUE') {
        promptLines.push(`Speaker Role: ${request.speakerRole || 'Companion'}`);
        promptLines.push('Goal: Write a brief, realistic dialogue line showing companion reaction to current scene.');
      } else if (request.type === 'CONSEQUENCE_NARRATION') {
        promptLines.push('Goal: Write a sensory description of the immediate physical consequence in the environment.');
      } else if (request.type === 'EDUCATIONAL_FLAVOR') {
        promptLines.push('Goal: Write a brief operational perspective on the unfolding situation.');
      } else {
        promptLines.push('Goal: Write an atmospheric description of sensory pressure (sounds, heat, water, dust).');
      }

      const promptText = promptLines.join('\n');

      // Bounded timeout race: resolves in <= GEMINI_TIMEOUT_MS (2500ms)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), GEMINI_TIMEOUT_MS);
      });

      const generatePromise = this.aiClient.models.generateContent({
        model: this.model,
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'Concise narrative description or dialogue line (max 2 sentences, under 220 chars)',
              },
              tone: {
                type: Type.STRING,
                enum: ['URGENT', 'CAUTIOUS', 'STABILIZING', 'INFORMATIVE'],
              },
            },
            required: ['text', 'tone'],
          },
          temperature: 0.4,
          maxOutputTokens: 140,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text?.trim();

      if (!rawText) {
        return generateDeterministicGeminiFallback(
          request,
          'Empty response received from Gemini provider. Fallback activated.'
        );
      }

      let parsed: { text?: string; tone?: string };
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = { text: cleaned, tone: 'INFORMATIVE' };
        }
      }

      const narrativeText = typeof parsed.text === 'string' ? parsed.text.trim() : '';
      if (!narrativeText) {
        return generateDeterministicGeminiFallback(
          request,
          'Malformed or empty narrative text from Gemini. Fallback activated.'
        );
      }

      const envelope: AiEnvelope<GeminiNarrativeResponse> = {
        requestId: `gemini-srv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        contextVersion: '1.0',
        source: 'gemini',
        confidence: 88,
        timestamp: Date.now(),
        allowedActions: [],
        expirationMs: 30000,
        reasoningSummary: `Gemini live creative response via server gateway (${this.model}).`,
        deterministicFallbackUsed: false,
        payload: {
          type: request.type,
          text: narrativeText,
          speaker: request.speakerName,
          tone: (parsed.tone as any) || 'INFORMATIVE',
        },
      };

      // Enforce strict Safety Firewall boundary
      const validation = validateGeminiEnvelope(envelope);
      if (!validation.valid || !validation.envelope) {
        return generateDeterministicGeminiFallback(
          request,
          `Gemini output rejected by Safety Firewall: ${validation.error || 'Schema validation failure'}`
        );
      }

      if (validation.envelope.confidence < GEMINI_CONFIDENCE_THRESHOLD) {
        return generateDeterministicGeminiFallback(
          request,
          `Gemini confidence ${validation.envelope.confidence}% below required threshold (${GEMINI_CONFIDENCE_THRESHOLD}%).`
        );
      }

      return validation.envelope;
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && (err.message === 'GEMINI_TIMEOUT' || err.name === 'AbortError');
      const reason = isTimeout
        ? `Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms.`
        : 'Gemini provider encountered an error. Deterministic fallback activated.';

      return generateDeterministicGeminiFallback(request, reason);
    }
  }
}
