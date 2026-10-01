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

/**
 * Server-side Gemini Creative Provider.
 * Checks server environment variables (GEMINI_API_KEY).
 * Falls back deterministically if unconfigured or rejected by safety firewall.
 */
export class ServerGeminiProvider {
  private readonly apiKey: string | undefined;

  constructor(env?: GatewayServerEnv) {
    const serverEnv = getServerEnv(env);
    this.apiKey = serverEnv.GEMINI_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>> {
    // If GEMINI_API_KEY is absent: immediately return deterministic fallback without latency
    if (!this.isConfigured()) {
      return generateDeterministicGeminiFallback(
        request,
        'Gemini API key unconfigured on server. Using deterministic creative narrator.'
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_DEFAULT_MODEL}:generateContent?key=${this.apiKey}`;
      const promptText = `Disaster: ${request.context.disasterType}. Node: ${request.context.situationTitle}. Hazard: ${request.context.hazardBand}. Request Type: ${request.type}. Speaker: ${request.speakerName || 'Narrator'}. Write max 1-2 serious sentences describing environmental tension or dialogue. Return strictly valid JSON: {"text": "...", "tone": "URGENT"|"CAUTIOUS"|"STABILIZING"|"INFORMATIVE"}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          systemInstruction: {
            parts: [
              {
                text: 'You are an atmospheric simulation narrator. Output strictly JSON matching the required schema. Never generate emergency advice, numerical rules, or state commands.',
              },
            ],
          },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 120,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return generateDeterministicGeminiFallback(
          request,
          `Gemini API returned HTTP ${response.status}. Fallback activated.`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return generateDeterministicGeminiFallback(request, 'Empty candidate text from Gemini. Fallback activated.');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = { text: rawText.replace(/```json|```/g, '').trim(), tone: 'INFORMATIVE' };
      }

      const envelope: AiEnvelope<GeminiNarrativeResponse> = {
        requestId: `gemini-srv-${Date.now()}`,
        contextVersion: '1.0',
        source: 'gemini',
        confidence: 85,
        timestamp: Date.now(),
        allowedActions: [],
        expirationMs: 30000,
        reasoningSummary: 'Gemini live creative response via server gateway.',
        deterministicFallbackUsed: false,
        payload: {
          type: request.type,
          text: String(parsed.text || ''),
          speaker: request.speakerName,
          tone: parsed.tone || 'INFORMATIVE',
        },
      };

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
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const reason = isTimeout
        ? `Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms.`
        : `Gemini network error: ${err instanceof Error ? err.message : 'Unknown'}`;

      return generateDeterministicGeminiFallback(request, `${reason} Deterministic fallback activated.`);
    }
  }
}
