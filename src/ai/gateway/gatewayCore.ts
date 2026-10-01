// src/ai/gateway/gatewayCore.ts
// Central execution core for the Secure AI Gateway.
// Validates inbound payloads, coordinates isolated server providers, enforces safety firewall,
// and ensures 100% resilient fallback behavior with zero unhandled exceptions.

import { validateGatewayPayload } from './contextValidator.js';
import { ServerJevProvider, ServerGeminiProvider } from './serverProviders.js';
import { generateDeterministicJevFallback } from '../jev/jevAdapter.js';
import { generateDeterministicGeminiFallback } from '../gemini/geminiAdapter.js';
import type {
  GatewayRequest,
  GatewayResponse,
  GatewayServerEnv,
  GatewayStatusResponse,
} from './gatewayTypes.js';

export interface GatewayExecutionResult {
  statusCode: number;
  body: GatewayResponse | { error: string; fallback: unknown };
}

/**
 * Executes a gateway request through the strict validation and provider pipeline.
 * Guaranteed to never throw or block indefinitely.
 */
export async function handleGatewayRequest(
  rawBody: unknown,
  env?: GatewayServerEnv
): Promise<GatewayExecutionResult> {
  try {
    // 1. Enforce payload schema, size limits, and sensitive key rejection
    const validation = validateGatewayPayload(rawBody);
    if (!validation.valid || !validation.sanitizedPayload) {
      // If recommend or narrate was attempted with invalid payload, provide deterministic safe fallback
      const req = rawBody as Partial<GatewayRequest> | undefined;
      if (req && req.action === 'recommend' && req.context) {
        return {
          statusCode: 400,
          body: {
            error: validation.error || 'Invalid gateway payload',
            fallback: generateDeterministicJevFallback(
              req.context,
              `Gateway validation rejected payload: ${validation.error}`
            ),
          },
        };
      }

      if (req && req.action === 'narrate' && req.request) {
        return {
          statusCode: 400,
          body: {
            error: validation.error || 'Invalid gateway payload',
            fallback: generateDeterministicGeminiFallback(
              req.request,
              `Gateway validation rejected payload: ${validation.error}`
            ),
          },
        };
      }

      return {
        statusCode: 400,
        body: {
          error: validation.error || 'Invalid gateway payload',
          fallback: null,
        },
      };
    }

    const payload = validation.sanitizedPayload;
    const jevProvider = new ServerJevProvider(env);
    const geminiProvider = new ServerGeminiProvider(env);

    // 2. Handle status action
    if (payload.action === 'status') {
      const statusResponse: GatewayStatusResponse = {
        status: 'ok',
        gateway: 'ACTIVE',
        version: '1.0',
        timestamp: Date.now(),
        providers: {
          jev: {
            configured: jevProvider.isConfigured(),
            mode: jevProvider.isConfigured() ? 'LIVE' : 'FALLBACK',
            providerName: 'Jev Decision Brain',
          },
          gemini: {
            configured: geminiProvider.isConfigured(),
            mode: geminiProvider.isConfigured() ? 'LIVE' : 'FALLBACK',
            providerName: `Gemini Creative Brain (${geminiProvider.getModel()})`,
          },
        },
        safetyFirewallEnforced: true,
      };

      return {
        statusCode: 200,
        body: statusResponse,
      };
    }

    // 3. Handle Layer 2: Jev tactical recommendation
    if (payload.action === 'recommend') {
      const envelope = await jevProvider.recommend(payload.context);
      return {
        statusCode: 200,
        body: envelope,
      };
    }

    // 4. Handle Layer 1: Gemini creative narration
    if (payload.action === 'narrate') {
      const envelope = await geminiProvider.narrate(payload.request);
      return {
        statusCode: 200,
        body: envelope,
      };
    }

    return {
      statusCode: 400,
      body: { error: 'Unknown gateway action', fallback: null },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal gateway exception';
    return {
      statusCode: 500,
      body: {
        error: errorMsg,
        fallback: null,
      },
    };
  }
}
