// src/ai/gateway/gatewayTypes.ts
// Strict server-side AI Gateway contracts and types.
// Enforces payload boundaries, secret isolation, and safety-critical immutability.

import type {
  AiContext,
  AiEnvelope,
  JevRecommendation,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
} from '../types.js';

/** Maximum allowed gateway payload size in bytes (16 KB) */
export const MAX_GATEWAY_PAYLOAD_BYTES = 16384;

/** Maximum allowed length for any individual string field */
export const MAX_GATEWAY_STRING_LENGTH = 1000;

/** Supported actions on the secure AI gateway */
export type GatewayAction = 'recommend' | 'narrate' | 'status';

/** Gateway request for Layer 2: Jev tactical recommendation */
export interface GatewayRecommendRequest {
  action: 'recommend';
  context: AiContext;
}

/** Gateway request for Layer 1: Gemini creative narration */
export interface GatewayNarrateRequest {
  action: 'narrate';
  request: GeminiNarrativeRequest;
}

/** Gateway request for provider status check */
export interface GatewayStatusRequest {
  action: 'status';
}

/** Union of all valid gateway request payloads */
export type GatewayRequest =
  | GatewayRecommendRequest
  | GatewayNarrateRequest
  | GatewayStatusRequest;

/** Provider operational mode descriptor */
export interface GatewayProviderStatus {
  configured: boolean;
  mode: 'LIVE' | 'FALLBACK';
  providerName: string;
}

/** Gateway health & status response */
export interface GatewayStatusResponse {
  status: 'ok';
  gateway: 'ACTIVE';
  version: '1.0';
  timestamp: number;
  providers: {
    jev: GatewayProviderStatus;
    gemini: GatewayProviderStatus;
  };
  safetyFirewallEnforced: true;
}

/** Gateway response envelope union */
export type GatewayResponse =
  | AiEnvelope<JevRecommendation>
  | AiEnvelope<GeminiNarrativeResponse>
  | GatewayStatusResponse;

/** Gateway validation result */
export interface GatewayValidationResult {
  valid: boolean;
  error?: string;
  sanitizedPayload?: GatewayRequest;
}

/** Server environment interface for dependency injection & testing */
export interface GatewayServerEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  JEV_API_URL?: string;
  JEV_API_KEY?: string;
}
