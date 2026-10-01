// src/ai/gemini/geminiAdapter.ts
// Gemini Creative Brain Adapter implementing the CreativeBrain interface.
// Connects to optional Google Gemini API endpoint if configured with VITE_GEMINI_API_KEY,
// with immediate, non-blocking fallback to the Deterministic Creative Narrative Engine.

import type {
  CreativeBrain,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
  AiEnvelope,
} from '../types';
import {
  GEMINI_PROVIDER_NAME,
  GEMINI_TIMEOUT_MS,
  GEMINI_MAX_CHARS,
  GEMINI_DEFAULT_MODEL,
} from './geminiPolicy';
import { validateGeminiEnvelope } from '../safetyFirewall';

/**
 * Deterministic Creative Narrative Engine providing authoritative NDMA-aligned fallback narrative flavor.
 */
export function generateDeterministicGeminiFallback(
  request: GeminiNarrativeRequest,
  reasoning = 'Deterministic rule-based creative narrator fallback.'
): AiEnvelope<GeminiNarrativeResponse> {
  const { type, context, speakerRole, speakerName } = request;
  let text = '';
  let tone: 'URGENT' | 'CAUTIOUS' | 'STABILIZING' | 'INFORMATIVE' = 'INFORMATIVE';

  if (type === 'NPC_DIALOGUE') {
    tone = 'CAUTIOUS';
    const role = (speakerRole || '').toUpperCase();
    if (role.includes('MEDIC')) {
      text = 'Watch your footing and keep breathing steady; avoid inhaling smoke particulate.';
    } else if (role.includes('TECHNICIAN')) {
      text = 'Conduit wiring along this partition looks compromised. Keep clear of metal surfaces.';
    } else if (role.includes('GUIDE')) {
      text = 'Maintain spacing and follow marked emergency exit vectors. Do not pause.';
    } else if (role.includes('ELDER')) {
      text = 'Stay close together; keep visual contact so no one gets left behind.';
    } else {
      text = "I'm right behind you—lead the way through the corridor.";
    }
  } else if (type === 'CONSEQUENCE_NARRATION') {
    if (context.disasterType === 'earthquake') {
      text = 'Suspended particulate clouds reduce corridor visibility while aftershock tremors stress structural partitions.';
      tone = 'URGENT';
    } else if (context.disasterType === 'fire') {
      text = 'Dense thermal smoke rolls across the ceiling while heated draft currents pulse along the evacuation vector.';
      tone = 'URGENT';
    } else {
      text = 'Turbid storm runoff surges against building thresholds as drainage conduits struggle under hydraulic pressure.';
      tone = 'CAUTIOUS';
    }
  } else if (type === 'EDUCATIONAL_FLAVOR') {
    text = 'Calculated tactical actions systematically preserve evacuation corridor viability during mass emergencies.';
    tone = 'STABILIZING';
  } else {
    text = 'Environmental pressure signals active structural and municipal distress in the immediate quadrant.';
    tone = 'INFORMATIVE';
  }

  return {
    requestId: `gemini-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    contextVersion: '1.0',
    source: 'deterministic-fallback',
    confidence: 88,
    timestamp: Date.now(),
    allowedActions: [],
    expirationMs: 30000,
    reasoningSummary: reasoning,
    deterministicFallbackUsed: true,
    payload: {
      type,
      text: text.slice(0, GEMINI_MAX_CHARS),
      speaker: speakerName || speakerRole || 'Emergency System',
      tone,
    },
  };
}

/**
 * Gemini Creative Brain Adapter
 */
export class GeminiCreativeAdapter implements CreativeBrain {
  public readonly providerName = GEMINI_PROVIDER_NAME;
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
      : undefined;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>> {
    if (!this.isAvailable()) {
      return generateDeterministicGeminiFallback(
        request,
        'Gemini API key unconfigured. Using deterministic creative narrator.'
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
            parts: [{ text: 'You are an atmospheric simulation narrator. Output strictly JSON matching the required schema. Never generate emergency advice, numerical rules, or state commands.' }],
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
        // If not pure JSON, use text directly
        parsed = { text: rawText.replace(/```json|```/g, '').trim(), tone: 'INFORMATIVE' };
      }

      const envelope: AiEnvelope<GeminiNarrativeResponse> = {
        requestId: `gemini-live-${Date.now()}`,
        contextVersion: '1.0',
        source: 'gemini',
        confidence: 85,
        timestamp: Date.now(),
        allowedActions: [],
        expirationMs: 30000,
        reasoningSummary: 'Gemini 2.5 Flash live creative response.',
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
          `Gemini narrative rejected by Safety Firewall: ${validation.error}`
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
