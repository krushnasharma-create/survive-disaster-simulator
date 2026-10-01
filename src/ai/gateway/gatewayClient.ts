// src/ai/gateway/gatewayClient.ts
// Minimal browser client for the Secure AI Gateway.
// Dispatches sanitized simulation context to /api/ai with strict timeout controls.
// Completely resilient: if the server endpoint is unreachable or offline, returns null
// so client adapters can immediately engage deterministic fallback without stutter.

import type {
  AiContext,
  AiEnvelope,
  JevRecommendation,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
} from '../types';
import type {
  GatewayRecommendRequest,
  GatewayNarrateRequest,
  GatewayStatusRequest,
  GatewayStatusResponse,
} from './gatewayTypes';

const GATEWAY_ENDPOINT = '/api/ai';
const CLIENT_TIMEOUT_MS = 2800;

class GatewayClient {
  private endpoint = GATEWAY_ENDPOINT;

  public setEndpoint(url: string): void {
    this.endpoint = url;
  }

  /**
   * Check gateway connectivity and server provider status.
   */
  public async getStatus(): Promise<GatewayStatusResponse | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      const payload: GatewayStatusRequest = { action: 'status' };
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return null;

      const data = await res.json();
      if (data && data.status === 'ok') {
        return data as GatewayStatusResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Request Layer 2 Jev tactical recommendation via secure gateway.
   * Returns null if gateway is unavailable, offline, or times out.
   */
  public async recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation> | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      const payload: GatewayRecommendRequest = {
        action: 'recommend',
        context,
      };

      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return null;

      const envelope = (await res.json()) as AiEnvelope<JevRecommendation>;
      if (envelope && envelope.payload && envelope.payload.type === 'DIRECTOR_RECOMMENDATION') {
        return envelope;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Request Layer 1 Gemini creative narrative via secure gateway.
   * Returns null if gateway is unavailable, offline, or times out.
   */
  public async narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse> | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      const payload: GatewayNarrateRequest = {
        action: 'narrate',
        request,
      };

      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return null;

      const envelope = (await res.json()) as AiEnvelope<GeminiNarrativeResponse>;
      if (envelope && envelope.payload && typeof envelope.payload.text === 'string') {
        return envelope;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const gatewayClient = new GatewayClient();
