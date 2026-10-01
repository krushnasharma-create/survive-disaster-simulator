// src/ai/gateway/contextValidator.ts
// Inbound payload validation and schema enforcement for the Secure AI Gateway.
// Rejects oversized requests, unauthorized fields, script injection, and state mutation attempts.

import type { AiContext, GeminiNarrativeRequest } from '../types.js';
import { containsForbiddenPatterns } from '../safetyFirewall.js';
import {
  MAX_GATEWAY_PAYLOAD_BYTES,
  MAX_GATEWAY_STRING_LENGTH,
  type GatewayRequest,
  type GatewayValidationResult,
} from './gatewayTypes.js';

const DISALLOWED_KEYS = [
  'apikey',
  'api_key',
  'secret',
  'password',
  'token',
  'service_role',
  'servicerole',
  'auth',
  'jwt',
  'bearer',
  'email',
  'ssn',
  'phone',
  'session',
];

const VALID_DISASTER_TYPES = ['earthquake', 'fire', 'flood'] as const;
const VALID_NARRATIVE_TYPES = [
  'NPC_DIALOGUE',
  'CONSEQUENCE_NARRATION',
  'ENVIRONMENTAL_ATMOSPHERE',
  'EDUCATIONAL_FLAVOR',
] as const;

/**
 * Checks recursively if an object contains disallowed sensitive keys or excessive depth.
 */
function scanDisallowedKeys(obj: unknown, depth = 0): string | null {
  if (depth > 6) return 'Exceeded maximum object nesting depth';
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const err = scanDisallowedKeys(item, depth + 1);
      if (err) return err;
    }
    return null;
  }

  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (DISALLOWED_KEYS.some((dk) => lowerKey.includes(dk))) {
      return `Payload contains unauthorized or sensitive field: "${key}"`;
    }
    if (typeof val === 'string') {
      if (val.length > MAX_GATEWAY_STRING_LENGTH) {
        return `String field "${key}" exceeds maximum allowed length (${MAX_GATEWAY_STRING_LENGTH})`;
      }
      if (containsForbiddenPatterns(val)) {
        return `String field "${key}" contains forbidden script or state mutation pattern`;
      }
    } else if (typeof val === 'object' && val !== null) {
      const err = scanDisallowedKeys(val, depth + 1);
      if (err) return err;
    }
  }

  return null;
}

/**
 * Validates a sanitized AiContext object against the strict simulation schema.
 */
export function validateAiContext(context: unknown): { valid: boolean; error?: string } {
  if (!context || typeof context !== 'object') {
    return { valid: false, error: 'Context must be a non-null object' };
  }

  const c = context as Partial<AiContext>;

  if (!c.disasterType || !VALID_DISASTER_TYPES.includes(c.disasterType as any)) {
    return { valid: false, error: `Invalid or missing disasterType: "${c.disasterType}"` };
  }

  if (typeof c.scenarioId !== 'string' || c.scenarioId.length === 0) {
    return { valid: false, error: 'scenarioId must be a non-empty string' };
  }

  if (typeof c.nodeId !== 'string' || c.nodeId.length === 0) {
    return { valid: false, error: 'nodeId must be a non-empty string' };
  }

  if (typeof c.situationTitle !== 'string') {
    return { valid: false, error: 'situationTitle must be a string' };
  }

  if (typeof c.panicLevel !== 'number' || c.panicLevel < 0 || c.panicLevel > 100 || Number.isNaN(c.panicLevel)) {
    return { valid: false, error: 'panicLevel must be a valid number between 0 and 100' };
  }

  if (typeof c.hazardLevel !== 'number' || c.hazardLevel < 0 || c.hazardLevel > 100 || Number.isNaN(c.hazardLevel)) {
    return { valid: false, error: 'hazardLevel must be a valid number between 0 and 100' };
  }

  if (c.recentDecisions && !Array.isArray(c.recentDecisions)) {
    return { valid: false, error: 'recentDecisions must be an array' };
  }

  return { valid: true };
}

/**
 * Validates a GeminiNarrativeRequest object.
 */
export function validateNarrativeRequest(req: unknown): { valid: boolean; error?: string } {
  if (!req || typeof req !== 'object') {
    return { valid: false, error: 'Narrative request must be a non-null object' };
  }

  const r = req as Partial<GeminiNarrativeRequest>;

  if (!r.type || !VALID_NARRATIVE_TYPES.includes(r.type as any)) {
    return { valid: false, error: `Invalid or missing narrative request type: "${r.type}"` };
  }

  return validateAiContext(r.context);
}

/**
 * Validates an entire inbound gateway request payload.
 */
export function validateGatewayPayload(rawBody: unknown): GatewayValidationResult {
  if (!rawBody) {
    return { valid: false, error: 'Empty gateway payload' };
  }

  // Size limit check on JSON serialization if string or object
  const serialized = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
  if (serialized.length > MAX_GATEWAY_PAYLOAD_BYTES) {
    return {
      valid: false,
      error: `Gateway payload size (${serialized.length} bytes) exceeds maximum limit (${MAX_GATEWAY_PAYLOAD_BYTES} bytes)`,
    };
  }

  let parsed: unknown = rawBody;
  if (typeof rawBody === 'string') {
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return { valid: false, error: 'Malformed JSON payload' };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Gateway payload must be a JSON object' };
  }

  // Check for disallowed/sensitive fields
  const disallowedError = scanDisallowedKeys(parsed);
  if (disallowedError) {
    return { valid: false, error: disallowedError };
  }

  const req = parsed as Partial<GatewayRequest>;

  if (!req.action) {
    return { valid: false, error: 'Missing required "action" field' };
  }

  if (req.action === 'status') {
    return { valid: true, sanitizedPayload: { action: 'status' } };
  }

  if (req.action === 'recommend') {
    const contextValidation = validateAiContext(req.context);
    if (!contextValidation.valid) {
      return { valid: false, error: contextValidation.error };
    }
    return { valid: true, sanitizedPayload: parsed as GatewayRequest };
  }

  if (req.action === 'narrate') {
    const narrativeValidation = validateNarrativeRequest(req.request);
    if (!narrativeValidation.valid) {
      return { valid: false, error: narrativeValidation.error };
    }
    return { valid: true, sanitizedPayload: parsed as GatewayRequest };
  }

  return { valid: false, error: `Unsupported gateway action: "${(req as any).action}"` };
}
