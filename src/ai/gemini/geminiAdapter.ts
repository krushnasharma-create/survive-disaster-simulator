// src/ai/gemini/geminiAdapter.ts
// Gemini Creative Brain Adapter implementing the CreativeBrain interface.
// Connects via the Secure Live AI Gateway (/api/ai) with server-side credential isolation,
// with immediate, non-blocking fallback to the Deterministic Creative Narrative Engine.

import type {
  CreativeBrain,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
  AiEnvelope,
} from '../types';
import {
  GEMINI_PROVIDER_NAME,
  GEMINI_MAX_CHARS,
  GEMINI_CONFIDENCE_THRESHOLD,
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

import { gatewayClient } from '../gateway/gatewayClient';

/**
 * Gemini Creative Brain Adapter
 * Communicates with the Secure Live AI Gateway (/api/ai),
 * with immediate, zero-latency fallback to the Deterministic Creative Narrator.
 */
export class GeminiCreativeAdapter implements CreativeBrain {
  public readonly providerName = GEMINI_PROVIDER_NAME;
  private isLiveConnected = false;

  public isAvailable(): boolean {
    return this.isLiveConnected;
  }

  public setLiveConnected(connected: boolean): void {
    this.isLiveConnected = connected;
  }

  public async narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>> {
    // 1. Try requesting narrative through the server-side gateway boundary
    try {
      const gatewayEnvelope = await gatewayClient.narrate(request);
      if (gatewayEnvelope) {
        // Enforce safety firewall on gateway output
        const validation = validateGeminiEnvelope(gatewayEnvelope);
        if (validation.valid && validation.envelope && validation.envelope.confidence >= GEMINI_CONFIDENCE_THRESHOLD) {
          if (!validation.envelope.deterministicFallbackUsed) {
            this.isLiveConnected = true;
          }
          return validation.envelope;
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }

    // 2. Unbreakable deterministic fallback
    return generateDeterministicGeminiFallback(
      request,
      'Live Gemini gateway unconfigured or in fallback mode. Using deterministic narrator.'
    );
  }
}
