// src/ai/gateway/serverProviders.ts
// Server-side provider implementations for Jev and Gemini.
// Isolates provider credentials on the server side with non-blocking fallbacks and safety firewall enforcement.

import type {
  AiContext,
  AiEnvelope,
  JevRecommendation,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
  BoundedEventType,
} from '../types.js';
import { validateJevEnvelope, validateGeminiEnvelope } from '../safetyFirewall.js';
import { generateDeterministicJevFallback } from '../jev/jevAdapter.js';
import { generateDeterministicGeminiFallback } from '../gemini/geminiAdapter.js';
import {
  JEV_TIMEOUT_MS,
  JEV_CONFIDENCE_THRESHOLD,
  JEV_DEFAULT_MODEL,
  JEV_DEFAULT_ENDPOINT,
  JEV_EXPIRATION_MS,
} from '../jev/jevPolicy.js';
import {
  ALLOWED_BOUNDED_EVENTS,
  ALLOWED_NPC_INTENTS,
  ALLOWED_DIFFICULTY_PRESSURES,
} from '../safetyFirewall.js';
import { GEMINI_TIMEOUT_MS, GEMINI_CONFIDENCE_THRESHOLD, GEMINI_DEFAULT_MODEL } from '../gemini/geminiPolicy.js';
import type { GatewayServerEnv } from './gatewayTypes.js';

function getServerEnv(env?: GatewayServerEnv): GatewayServerEnv {
  if (env) return env;
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    const proc = (globalThis as { process?: { env?: GatewayServerEnv } }).process;
    return proc?.env || {};
  }
  return {};
}

function deriveJevTacticalAdvisory(boundedEvent: BoundedEventType): string {
  switch (boundedEvent) {
    case 'AFTERSHOCK_PRESSURE':
      return 'Secondary gas line rupture reported nearby. Exercise extreme vigilance.';
    case 'SMOKE_POCKET':
      return 'Toxic smoke pocket detected along exit stairwell. Keep low to ground.';
    case 'WATER_SURGE':
      return 'Submerged electrical line hazard detected downstream. Halt progression.';
    case 'DOWNED_LINE':
      return 'High voltage electrical hazard detected. Keep clear of standing water.';
    case 'PANIC_CROWD':
      return 'Group composure destabilizing. Maintain voice contact and clear spacing.';
    case 'ROUTE_CONGESTION':
      return 'Corridor congestion reported. Follow marked emergency exits.';
    case 'STRUCTURAL_CREAK':
      return 'Local environmental integrity degraded. Verify pathway before moving.';
    case 'COMMUNICATION_STATIC':
      return 'Radio signal degradation reported. Maintain line of sight with squad.';
    case 'NONE':
    default:
      return 'Standard NDMA tactical corridor. Proceed with alert composure.';
  }
}

/**
 * Server-side Jev Decision Provider.
 * Connects to Vercel AI Gateway using typesafe-ai/jev model and AI_GATEWAY_API_KEY.
 * Falls back deterministically if unconfigured, error, or rejected by safety firewall.
 */
export class ServerJevProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(env?: GatewayServerEnv) {
    const serverEnv = getServerEnv(env);
    this.apiKey = (serverEnv.AI_GATEWAY_API_KEY || serverEnv.JEV_API_KEY)?.trim();
    this.apiUrl = (serverEnv.AI_GATEWAY_URL || serverEnv.JEV_API_URL)?.trim() || JEV_DEFAULT_ENDPOINT;
    this.model = JEV_DEFAULT_MODEL;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  public getModel(): string {
    return this.model;
  }

  public async recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation>> {
    // If AI_GATEWAY_API_KEY / JEV_API_KEY is absent: immediately return deterministic fallback without latency
    if (!this.isConfigured()) {
      return generateDeterministicJevFallback(
        context,
        'AI_GATEWAY_API_KEY unconfigured on server. Using deterministic director.'
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), JEV_TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      };

      const payload = {
        model: this.model,
        state: {
          disasterType: context.disasterType,
          scenarioId: context.scenarioId,
          nodeId: context.nodeId,
          situationTitle: context.situationTitle,
          hazardLevel: context.hazardLevel,
          hazardBand: context.hazardBand,
          panicLevel: context.panicLevel,
          panicBand: context.panicBand,
          environmentStatus: context.environmentStatus,
          chainSeverity: context.chainStatus?.severity,
          emergencyAccess: context.citySummary?.emergencyAccess,
          squadCohesion: context.squadSummary?.cohesion,
        },
        questions: {
          boundedEvent: {
            type: 'choice',
            instructions: 'Select the immediate environmental director event based on the current hazard, panic, and disaster context.',
            criteria: {
              NONE: 'Normal conditions without immediate secondary environmental shock',
              ROUTE_CONGESTION: 'Evacuation corridor is congested or obstructed by debris/people',
              AFTERSHOCK_PRESSURE: 'Secondary tremors or structural shaking threatening stability',
              STRUCTURAL_CREAK: 'Audible structural groaning, falling dust, compromised walls',
              SMOKE_POCKET: 'Toxic smoke accumulating in enclosed space or stairway',
              WATER_SURGE: 'Rising water levels or rapid flash flooding in pathway',
              DOWNED_LINE: 'Severed electrical cables or exposed wiring danger',
              PANIC_CROWD: 'Evacuees experiencing acute panic or disorderly movement',
              COMMUNICATION_STATIC: 'Radio or phone network interference hindering coordination',
            },
          },
          npcIntent: {
            type: 'choice',
            instructions: 'Select the tactical companion/NPC squad intent for this moment.',
            criteria: {
              ASSIST: 'Directly aid player or companion with equipment or physical support',
              WARN: 'Alert squad to an imminent hazard or structural risk',
              HESITATE: 'Pause or express uncertainty due to sensory confusion',
              GUIDE: 'Direct attention toward the marked emergency exit vector',
              STABILIZE: 'Calm distressed individuals and restore group composure',
            },
          },
          difficultyPressure: {
            type: 'choice',
            instructions: 'Recommend pacing adjustment for the simulation scenario director.',
            criteria: {
              HOLD: 'Maintain current scenario pacing and timer constraints',
              INCREASE: 'Heighten environmental tension due to high player composure',
              STABILIZE: 'Maintain controlled pacing during moderate distress',
              RECOVER: 'Ease immediate environmental shock to allow player regrouping',
            },
          },
        },
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return generateDeterministicJevFallback(
          context,
          `Jev provider returned HTTP ${response.status}. Fallback activated.`
        );
      }

      const rawJson = (await response.json()) as any;

      // Support direct envelope response if a custom wrapper or mock proxy is used
      if (rawJson && typeof rawJson === 'object' && 'payload' in rawJson && rawJson.payload?.type === 'DIRECTOR_RECOMMENDATION') {
        const validation = validateJevEnvelope(rawJson);
        if (validation.valid && validation.envelope && validation.envelope.confidence >= JEV_CONFIDENCE_THRESHOLD) {
          return validation.envelope;
        }
      }

      // Parse Vercel AI Gateway typesafe-ai/jev evaluate response
      const answers = (rawJson && typeof rawJson === 'object' && 'answers' in rawJson && rawJson.answers && typeof rawJson.answers === 'object')
        ? rawJson.answers
        : rawJson;

      const rawEvent = answers?.boundedEvent?.choice;
      const rawIntent = answers?.npcIntent?.choice;
      const rawDifficulty = answers?.difficultyPressure?.choice;

      const boundedEvent = ALLOWED_BOUNDED_EVENTS.includes(rawEvent) ? rawEvent : null;
      const npcIntent = ALLOWED_NPC_INTENTS.includes(rawIntent) ? rawIntent : null;
      const difficultyPressure = ALLOWED_DIFFICULTY_PRESSURES.includes(rawDifficulty) ? rawDifficulty : null;

      if (!boundedEvent || !npcIntent || !difficultyPressure) {
        return generateDeterministicJevFallback(
          context,
          'Jev response contained invalid or unallowlisted choice values. Deterministic fallback activated.'
        );
      }

      const eventProb = answers?.boundedEvent?.probabilities?.[boundedEvent];
      const confidence = typeof eventProb === 'number' && !isNaN(eventProb)
        ? Math.min(100, Math.max(0, Math.round(eventProb * 100)))
        : 85;

      const tacticalAdvisory = deriveJevTacticalAdvisory(boundedEvent);

      const envelope: AiEnvelope<JevRecommendation> = {
        requestId: `jev-srv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        contextVersion: '1.0',
        source: 'jev',
        confidence,
        timestamp: Date.now(),
        allowedActions: [boundedEvent],
        expirationMs: JEV_EXPIRATION_MS,
        reasoningSummary: `Jev live decision recommendation via Vercel AI Gateway (${this.model}).`,
        deterministicFallbackUsed: false,
        payload: {
          type: 'DIRECTOR_RECOMMENDATION',
          boundedEvent,
          npcIntent,
          difficultyPressure,
          tacticalAdvisory,
        },
      };

      // Enforce strict Safety Firewall boundary
      const validation = validateJevEnvelope(envelope);
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
      const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message === 'AbortError');
      const reason = isTimeout
        ? `Jev request timed out after ${JEV_TIMEOUT_MS}ms.`
        : 'Jev provider encountered an error. Deterministic fallback activated.';

      return generateDeterministicJevFallback(context, reason);
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
