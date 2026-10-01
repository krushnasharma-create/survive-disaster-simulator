// scratch/verify_live_jev.ts
// Live Vercel AI Gateway typesafe-ai/jev verification script.
// NEVER prints, logs, or reveals the API key.

import fs from 'node:fs';
import path from 'node:path';
import { handleGatewayRequest } from '../src/ai/gateway/gatewayCore.js';
import type { AiContext } from '../src/ai/types.js';

function safeLoadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...vals] = trimmed.split('=');
    env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const mockContext: AiContext = {
  disasterType: 'earthquake',
  scenarioId: 'seismic_01',
  nodeId: 'node_seismic_init',
  situationTitle: 'Initial Tremor',
  panicBand: 'ELEVATED',
  panicLevel: 55,
  hazardBand: 'HIGH',
  hazardLevel: 70,
  convergenceBand: 'BALANCED',
  environmentStatus: 'STRUCTURAL_TREMOR',
  difficultyLevel: 2,
  squadSummary: {
    cohesion: 70,
    activeCount: 3,
    distressedCount: 1,
    roles: ['Medic', 'Technician', 'Guide'],
  },
  citySummary: {
    macroStatus: 'EMERGENCY_MOBILIZED',
    emergencyAccess: 55,
    utilityStability: 60,
  },
  chainStatus: {
    severity: 'ACTIVE',
    chainTitle: 'Gas Line Rupture Risk',
  },
  recentDecisions: [
    { nodeId: 'node_0', choiceLabel: 'Drop, Cover, Hold On', isCorrect: true },
  ],
};

async function verifyLiveJev() {
  console.log('🔒 Starting Live Jev Gateway Verification...\n');

  const env = safeLoadEnv();
  const hasKey = Boolean(env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_API_KEY.length > 0);
  console.log(`✓ AI_GATEWAY_API_KEY configured in .env.local: ${hasKey} (key masked)`);

  // 1. Gateway Status Check
  console.log('\n--- Test 1: Gateway Status Check ---');
  const statusRes = await handleGatewayRequest({ action: 'status' }, env);
  console.log('Gateway status code:', statusRes.statusCode);
  const statusBody = statusRes.body as any;
  console.log('Jev provider configured:', statusBody.providers.jev.configured);
  console.log('Jev provider mode:', statusBody.providers.jev.mode);
  console.log('Jev provider name:', statusBody.providers.jev.providerName);
  console.log('Gemini provider configured:', statusBody.providers.gemini.configured);
  console.log('Gemini provider mode:', statusBody.providers.gemini.mode);

  // 2. Single Bounded Jev Recommendation Request
  console.log('\n--- Test 2: Bounded Jev Decision Request via Gateway ---');
  const startTime = Date.now();
  const result = await handleGatewayRequest({ action: 'recommend', context: mockContext }, env);
  const latency = Date.now() - startTime;

  console.log(`Gateway Response StatusCode: ${result.statusCode}`);
  console.log(`Gateway Response Latency: ${latency}ms`);

  const body = result.body as any;
  console.log('Response Source:', body.source);
  console.log('Deterministic Fallback Used:', body.deterministicFallbackUsed);
  console.log('Confidence:', body.confidence);
  console.log('Reasoning Summary:', body.reasoningSummary);
  console.log('Payload Type:', body.payload?.type);
  console.log('Bounded Event:', body.payload?.boundedEvent);
  console.log('NPC Intent:', body.payload?.npcIntent);
  console.log('Difficulty Pressure:', body.payload?.difficultyPressure);
  console.log('Tactical Advisory:', body.payload?.tacticalAdvisory);

  // 3. Secret Leakage Scan
  console.log('\n--- Test 3: Secret Leakage Scan ---');
  const serialized = JSON.stringify(result);
  const leaked = env.AI_GATEWAY_API_KEY ? serialized.includes(env.AI_GATEWAY_API_KEY) : false;
  console.log('Secret key in response body:', leaked ? 'LEAK DETECTED!' : 'None (SAFE)');
  if (leaked) {
    throw new Error('FATAL: API KEY LEAK DETECTED IN RESPONSE BODY');
  }

  console.log('\n========================================');
  console.log('LIVE JEV VERIFICATION COMPLETE');
  console.log('========================================');
}

verifyLiveJev().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
