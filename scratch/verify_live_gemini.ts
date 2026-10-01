// scratch/verify_live_gemini.ts
// Secure verification script for live Gemini provider via the /api/ai gateway.
// SECURITY RULE: Never print or reveal GEMINI_API_KEY.

import fs from 'fs';
import path from 'path';
import { handleGatewayRequest } from '../src/ai/gateway/gatewayCore';
import { POST } from '../api/ai';
import { validateGeminiEnvelope } from '../src/ai/safetyFirewall';
import type { AiContext, GeminiNarrativeRequest } from '../src/ai/types';
import type { GatewayServerEnv } from '../src/ai/gateway/gatewayTypes';

function safeLoadEnvLocal(): GatewayServerEnv {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found at:', envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env: GatewayServerEnv = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === 'GEMINI_API_KEY') {
      env.GEMINI_API_KEY = val;
    } else if (key === 'GEMINI_MODEL') {
      env.GEMINI_MODEL = val;
    }
  }

  return env;
}

const mockContext: AiContext = {
  disasterType: 'earthquake',
  scenarioId: 'earthquake',
  nodeId: 'eq-d1-shake',
  situationTitle: 'Living room tremor and vibrating light fixtures',
  panicBand: 'ELEVATED',
  panicLevel: 42,
  hazardBand: 'MODERATE_HAZARD',
  hazardLevel: 35,
  convergenceBand: 'MODERATE_RISK',
  environmentStatus: 'AIRBORNE_DUST_SUSPENDED',
  difficultyLevel: 2,
  squadSummary: {
    cohesion: 80,
    activeCount: 3,
    distressedCount: 0,
    roles: ['Paramedic Priya', 'Structural Eng. Ravi'],
  },
  citySummary: {
    macroStatus: 'OPERATIONAL',
    emergencyAccess: 85,
    utilityStability: 80,
  },
  chainStatus: {
    severity: 'INACTIVE',
  },
  recentDecisions: [],
};

async function verifyLiveGemini(): Promise<void> {
  console.log('🔒 Starting Live Gemini Gateway Verification...\n');
  const env = safeLoadEnvLocal();

  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
    console.error('❌ GEMINI_API_KEY is empty in .env.local');
    process.exit(1);
  }
  console.log('✓ Found GEMINI_API_KEY in .env.local (length: ' + env.GEMINI_API_KEY.length + ' chars, key masked)');

  // 1. Verify Gateway Status
  console.log('\n--- Test 1: Gateway Status Check ---');
  const statusRes = await handleGatewayRequest({ action: 'status' }, env);
  if (statusRes.statusCode !== 200) {
    console.error('❌ Status check failed with code:', statusRes.statusCode);
    process.exit(1);
  }
  const statusBody = statusRes.body as any;
  console.log('Gateway status:', statusBody.status);
  console.log('Gemini configured:', statusBody.providers?.gemini?.configured);
  console.log('Gemini mode:', statusBody.providers?.gemini?.mode);
  console.log('Gemini providerName:', statusBody.providers?.gemini?.providerName);

  if (statusBody.providers?.gemini?.mode !== 'LIVE') {
    console.error('❌ Expected Gemini mode to be LIVE, got:', statusBody.providers?.gemini?.mode);
    process.exit(1);
  }

  // 2. Test Live English Request through Gateway
  console.log('\n--- Test 2: Live English Creative Narrative Request ---');
  const enReq: GeminiNarrativeRequest = {
    type: 'ENVIRONMENTAL_ATMOSPHERE',
    context: mockContext,
    language: 'en',
  };

  const enStart = Date.now();
  const enGatewayRes = await handleGatewayRequest(
    { action: 'narrate', request: enReq },
    env
  );
  const enElapsed = Date.now() - enStart;

  if (enGatewayRes.statusCode !== 200) {
    console.error('❌ English request failed with status:', enGatewayRes.statusCode, enGatewayRes.body);
    process.exit(1);
  }

  const enEnvelope = enGatewayRes.body as any;
  console.log('Latency:', enElapsed + 'ms');
  console.log('Source:', enEnvelope.source);
  console.log('Fallback used:', enEnvelope.deterministicFallbackUsed);
  console.log('Tone:', enEnvelope.payload?.tone);
  console.log('English Narrative Text:', JSON.stringify(enEnvelope.payload?.text));

  const enFirewall = validateGeminiEnvelope(enEnvelope);
  console.log('Firewall Valid:', enFirewall.valid);
  if (!enFirewall.valid) {
    console.error('❌ English envelope failed firewall validation:', enFirewall.error);
    process.exit(1);
  }

  if (enEnvelope.deterministicFallbackUsed || enEnvelope.source !== 'gemini') {
    console.error('❌ English request fell back instead of using live Gemini!');
    process.exit(1);
  }

  // 3. Test Live Roman Hinglish Request through Gateway
  console.log('\n--- Test 3: Live Roman Hinglish Creative Narrative Request ---');
  const hinglishReq: GeminiNarrativeRequest = {
    type: 'ENVIRONMENTAL_ATMOSPHERE',
    context: mockContext,
    language: 'hinglish',
  };

  const hinglishStart = Date.now();
  const hinglishGatewayRes = await handleGatewayRequest(
    { action: 'narrate', request: hinglishReq },
    env
  );
  const hinglishElapsed = Date.now() - hinglishStart;

  if (hinglishGatewayRes.statusCode !== 200) {
    console.error('❌ Hinglish request failed with status:', hinglishGatewayRes.statusCode, hinglishGatewayRes.body);
    process.exit(1);
  }

  const hinglishEnvelope = hinglishGatewayRes.body as any;
  console.log('Latency:', hinglishElapsed + 'ms');
  console.log('Source:', hinglishEnvelope.source);
  console.log('Fallback used:', hinglishEnvelope.deterministicFallbackUsed);
  console.log('Tone:', hinglishEnvelope.payload?.tone);
  console.log('Hinglish Narrative Text:', JSON.stringify(hinglishEnvelope.payload?.text));

  const hinglishFirewall = validateGeminiEnvelope(hinglishEnvelope);
  console.log('Firewall Valid:', hinglishFirewall.valid);
  if (!hinglishFirewall.valid) {
    console.error('❌ Hinglish envelope failed firewall validation:', hinglishFirewall.error);
    process.exit(1);
  }

  if (hinglishEnvelope.deterministicFallbackUsed || hinglishEnvelope.source !== 'gemini') {
    console.error('❌ Hinglish request fell back instead of using live Gemini!');
    process.exit(1);
  }

  // Verify Roman Hinglish contains NO Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(hinglishEnvelope.payload.text);
  console.log('Contains Devanagari Script (must be false):', hasDevanagari);
  if (hasDevanagari) {
    console.error('❌ Hinglish response contains Devanagari script; Roman Hinglish strictly required.');
    process.exit(1);
  }

  // 4. Test Web Standard POST handler in api/ai.ts
  console.log('\n--- Test 4: Web Standard POST handler (/api/ai) ---');
  // Temporarily set process.env.GEMINI_API_KEY during this in-memory test
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  try {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

    const webReq = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'narrate', request: enReq }),
    });

    const webRes = await POST(webReq);
    console.log('POST status:', webRes.status);
    const webJson = await webRes.json();
    console.log('POST response source:', webJson.source);
    console.log('POST fallback used:', webJson.deterministicFallbackUsed);

    if (webRes.status !== 200 || webJson.source !== 'gemini') {
      console.error('❌ api/ai.ts POST handler failed live check');
      process.exit(1);
    }
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
    process.env.GEMINI_MODEL = originalModel;
  }

  // 5. Test Deterministic Fallback on Unconfigured Provider
  console.log('\n--- Test 5: Fallback Validation (Unconfigured / Missing Key) ---');
  const fallbackRes = await handleGatewayRequest(
    { action: 'narrate', request: enReq },
    {} // empty env
  );
  const fallbackEnvelope = fallbackRes.body as any;
  console.log('Fallback source:', fallbackEnvelope.source);
  console.log('Fallback used:', fallbackEnvelope.deterministicFallbackUsed);
  if (
    fallbackEnvelope.source !== 'deterministic-fallback' ||
    !fallbackEnvelope.deterministicFallbackUsed
  ) {
    console.error('❌ Unconfigured provider failed to fall back deterministically');
    process.exit(1);
  }

  // 6. Secret Exposure Check
  console.log('\n--- Test 6: Secret Exposure Scan ---');
  const secretKey = env.GEMINI_API_KEY;
  const enStr = JSON.stringify(enEnvelope);
  const hinglishStr = JSON.stringify(hinglishEnvelope);
  const fallbackStr = JSON.stringify(fallbackEnvelope);

  if (enStr.includes(secretKey) || hinglishStr.includes(secretKey) || fallbackStr.includes(secretKey)) {
    console.error('❌ CRITICAL LEAK: API key detected in response body!');
    process.exit(1);
  }
  console.log('✓ No secret key leaked in responses.');

  console.log('\n========================================');
  console.log('🎉 ALL LIVE GEMINI VERIFICATIONS PASSED!');
  console.log('========================================');
}

verifyLiveGemini().catch((err) => {
  console.error('❌ Fatal error in live Gemini verification:', err instanceof Error ? err.message : err);
  process.exit(1);
});
