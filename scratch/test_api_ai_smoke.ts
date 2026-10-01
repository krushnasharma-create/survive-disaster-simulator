// scratch/test_api_ai_smoke.ts
// Focused server-side smoke test for /api/ai under Node16/NodeNext semantics.
// Validates:
// 1. Module import resolution under Node16/NodeNext
// 2. Web Standard GET handler (status)
// 3. Web Standard POST handler (narrate request + fallback)
// 4. Invalid payload handling (schema safety)
// 5. Invariance & Safety Firewall compliance

import { execSync } from 'child_process';
import { GET, POST } from '../api/ai.js';
import type { AiContext, GeminiNarrativeRequest } from '../src/ai/types.js';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

const mockContext: AiContext = {
  disasterType: 'earthquake',
  scenarioId: 'earthquake',
  nodeId: 'eq-d1-shake',
  situationTitle: 'Office building swaying tremor',
  panicBand: 'ELEVATED',
  panicLevel: 40,
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

async function runSmokeTests(): Promise<void> {
  console.log('🧪 Starting /api/ai Node16/NodeNext Server Smoke Test...\n');

  // 1. Static Typecheck under NodeNext
  console.log('▶ [1] Verifying Node16/NodeNext TypeScript resolution on api/ai.ts...');
  try {
    execSync(
      'npx tsc api/ai.ts --noEmit --module nodenext --moduleResolution nodenext --target es2023 --skipLibCheck --ignoreConfig --types node',
      { stdio: 'pipe' }
    );
    console.log('  ✓ api/ai.ts and all transitive imports compile cleanly with 0 TS2835 errors.');
  } catch (err: any) {
    console.error('  ❌ Typecheck failed:', err.stdout?.toString() || err.message);
    process.exit(1);
  }

  // 2. Web Standard GET handler
  console.log('▶ [2] Testing Web Standard GET() status handler...');
  const getRes = await GET();
  assert(getRes.status === 200, `GET /api/ai status should be 200, got ${getRes.status}`);
  const getBody = (await getRes.json()) as any;
  assert(getBody.status === 'ok', 'Status response status must be "ok"');
  assert(getBody.gateway === 'ACTIVE', 'Gateway status must be "ACTIVE"');
  assert(getBody.safetyFirewallEnforced === true, 'Safety firewall must be enforced');
  console.log('  ✓ GET() returned valid status response.');

  // 3. Web Standard POST handler (Deterministic fallback mode when unconfigured)
  console.log('▶ [3] Testing Web Standard POST() with narrative request...');
  const narrativeReq: GeminiNarrativeRequest = {
    type: 'ENVIRONMENTAL_ATMOSPHERE',
    context: mockContext,
    language: 'en',
  };

  const postHttpReq = new Request('http://localhost:3000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'narrate', request: narrativeReq }),
  });

  const postRes = await POST(postHttpReq);
  assert(postRes.status === 200, `POST /api/ai status should be 200, got ${postRes.status}`);
  const postBody = (await postRes.json()) as any;
  assert(typeof postBody.payload?.text === 'string', 'POST returned narrative text');
  assert(postBody.payload?.text.length > 0, 'POST narrative text is non-empty');
  assert(['URGENT', 'CAUTIOUS', 'STABILIZING', 'INFORMATIVE'].includes(postBody.payload?.tone), 'Valid tone returned');
  console.log(`  ✓ POST() returned valid envelope: "${postBody.payload?.text}"`);

  // 4. Web Standard POST handler with invalid payload
  console.log('▶ [4] Testing Web Standard POST() with invalid payload (schema rejection)...');
  const invalidHttpReq = new Request('http://localhost:3000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unknown_action', foo: 'bar' }),
  });

  const invalidRes = await POST(invalidHttpReq);
  assert(invalidRes.status === 400, `Expected status 400 for invalid action, got ${invalidRes.status}`);
  console.log('  ✓ Schema rejection returned expected 400 status.');

  // 5. Node-style default handler fallback
  console.log('▶ [5] Testing Node-style default handler fallback...');
  const handlerModule = await import('../api/ai.js');
  const handler = handlerModule.default;
  assert(typeof handler === 'function', 'Default export handler must be a function');

  let mockResStatus = 0;
  let mockResBody: any = null;
  const mockReq = { method: 'GET' };
  const mockRes = {
    setHeader: () => {},
    status: (code: number) => {
      mockResStatus = code;
      return {
        json: (data: any) => {
          mockResBody = data;
        },
      };
    },
  };

  await handler(mockReq, mockRes);
  assert(mockResStatus === 200, `Handler status should be 200, got ${mockResStatus}`);
  assert(mockResBody?.status === 'ok', 'Handler body should have status: ok');
  console.log('  ✓ Default Node handler functioned correctly.');

  console.log('\n🎉 ALL /api/ai SERVER SMOKE TESTS PASSED!');
}

runSmokeTests().catch((err) => {
  console.error('Fatal smoke test error:', err);
  process.exit(1);
});
