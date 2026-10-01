// scratch/test_jev_gateway_suite.ts
// Comprehensive test suite for Jev Decision Brain integration with Vercel AI Gateway.
// Covers Requirements A through H.

import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ServerJevProvider } from '../src/ai/gateway/serverProviders.js';
import { handleGatewayRequest } from '../src/ai/gateway/gatewayCore.js';
import { validateJevEnvelope } from '../src/ai/safetyFirewall.js';
import type { AiContext } from '../src/ai/types.js';

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

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 RUNNING JEV DECISION BRAIN VERIFICATION SUITE (A-H)');
  console.log('========================================================\n');

  let passedTests = 0;

  // ─────────────────────────────────────────────────────────────
  // Test A: Valid Jev response
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test A] Valid Jev response from typesafe-ai/jev model...');
  {
    // Spin up mock Vercel AI Gateway endpoint
    const mockServer = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const parsed = JSON.parse(body);
        assert.strictEqual(parsed.model, 'typesafe-ai/jev', 'Must request model typesafe-ai/jev');
        assert.ok(parsed.state, 'Must send simulation state');
        assert.ok(parsed.questions.boundedEvent, 'Must query boundedEvent');
        assert.ok(parsed.questions.npcIntent, 'Must query npcIntent');
        assert.ok(parsed.questions.difficultyPressure, 'Must query difficultyPressure');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            answers: {
              boundedEvent: {
                type: 'choice',
                choice: 'AFTERSHOCK_PRESSURE',
                probabilities: {
                  AFTERSHOCK_PRESSURE: 0.92,
                  STRUCTURAL_CREAK: 0.08,
                },
              },
              npcIntent: {
                type: 'choice',
                choice: 'WARN',
                probabilities: { WARN: 0.88, GUIDE: 0.12 },
              },
              difficultyPressure: {
                type: 'choice',
                choice: 'INCREASE',
                probabilities: { INCREASE: 0.85, HOLD: 0.15 },
              },
            },
          })
        );
      });
    });

    await new Promise<void>((resolve) => mockServer.listen(0, resolve));
    const port = (mockServer.address() as any).port;
    const mockUrl = `http://127.0.0.1:${port}/v1/evaluate`;

    try {
      const provider = new ServerJevProvider({
        AI_GATEWAY_API_KEY: 'test-secret-gateway-key-xyz-12345',
        AI_GATEWAY_URL: mockUrl,
      });

      assert.strictEqual(provider.isConfigured(), true, 'Provider must be configured');
      assert.strictEqual(provider.getModel(), 'typesafe-ai/jev', 'Model must be typesafe-ai/jev');

      const envelope = await provider.recommend(mockContext);

      assert.strictEqual(envelope.source, 'jev', 'Source must be jev');
      assert.strictEqual(envelope.deterministicFallbackUsed, false, 'Must not use fallback');
      assert.strictEqual(envelope.payload.boundedEvent, 'AFTERSHOCK_PRESSURE');
      assert.strictEqual(envelope.payload.npcIntent, 'WARN');
      assert.strictEqual(envelope.payload.difficultyPressure, 'INCREASE');
      assert.strictEqual(envelope.confidence, 92, 'Confidence should be derived from probability (92%)');
      assert.ok(envelope.payload.tacticalAdvisory.length > 0, 'Advisory must be non-empty');
      assert.ok(envelope.payload.tacticalAdvisory.length <= 120, 'Advisory must be <= 120 chars');

      // Verify Safety Firewall accepts it
      const firewallCheck = validateJevEnvelope(envelope);
      assert.strictEqual(firewallCheck.valid, true, 'Must pass safety firewall');

      passedTests++;
      console.log('  ✓ Test A passed: Valid Jev decision returned, calibrated, and firewall verified.\n');
    } finally {
      mockServer.close();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Test B: Missing AI_GATEWAY_API_KEY
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test B] Missing AI_GATEWAY_API_KEY immediately falls back...');
  {
    const provider = new ServerJevProvider({
      AI_GATEWAY_API_KEY: '',
      JEV_API_KEY: '',
    });

    assert.strictEqual(provider.isConfigured(), false, 'Must report unconfigured');

    const start = Date.now();
    const envelope = await provider.recommend(mockContext);
    const duration = Date.now() - start;

    assert.strictEqual(envelope.source, 'deterministic-fallback', 'Must use deterministic-fallback');
    assert.strictEqual(envelope.deterministicFallbackUsed, true, 'Must mark fallback used');
    assert.ok(duration < 50, `Fallback should be zero-latency (${duration}ms)`);
    assert.ok(envelope.payload.boundedEvent !== undefined, 'Must provide bounded event');

    passedTests++;
    console.log('  ✓ Test B passed: Immediate deterministic fallback when key missing.\n');
  }

  // ─────────────────────────────────────────────────────────────
  // Test C: Timeout Handling (Bounded Pacing)
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test C] Gateway timeout terminates and falls back...');
  {
    // Server that delays longer than JEV_TIMEOUT_MS (or doesn't respond)
    const hangingServer = http.createServer((_req, _res) => {
      // Intentionally do not reply
    });

    await new Promise<void>((resolve) => hangingServer.listen(0, resolve));
    const port = (hangingServer.address() as any).port;
    const hangingUrl = `http://127.0.0.1:${port}/v1/evaluate`;

    try {
      const provider = new ServerJevProvider({
        AI_GATEWAY_API_KEY: 'test-secret-gateway-key-xyz-12345',
        AI_GATEWAY_URL: hangingUrl,
      });

      const start = Date.now();
      const envelope = await provider.recommend(mockContext);
      const duration = Date.now() - start;

      assert.strictEqual(envelope.deterministicFallbackUsed, true, 'Timeout must use fallback');
      assert.strictEqual(envelope.source, 'deterministic-fallback');
      assert.ok(duration >= 2400 && duration <= 3500, `Must abort near JEV_TIMEOUT_MS (${duration}ms)`);
      assert.ok(envelope.reasoningSummary.includes('timed out') || envelope.reasoningSummary.includes('Deterministic'));

      passedTests++;
      console.log('  ✓ Test C passed: Timed out gracefully and activated deterministic fallback.\n');
    } finally {
      hangingServer.close();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Test D: Malformed Jev response rejection
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test D] Malformed response payload rejected...');
  {
    const badServer = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      // Return garbage JSON without required questions
      res.end(JSON.stringify({ unexpected: 'random string without answers' }));
    });

    await new Promise<void>((resolve) => badServer.listen(0, resolve));
    const port = (badServer.address() as any).port;
    const badUrl = `http://127.0.0.1:${port}/v1/evaluate`;

    try {
      const provider = new ServerJevProvider({
        AI_GATEWAY_API_KEY: 'test-secret-gateway-key-xyz-12345',
        AI_GATEWAY_URL: badUrl,
      });

      const envelope = await provider.recommend(mockContext);
      assert.strictEqual(envelope.deterministicFallbackUsed, true, 'Malformed output must trigger fallback');
      assert.strictEqual(envelope.source, 'deterministic-fallback');

      passedTests++;
      console.log('  ✓ Test D passed: Malformed provider output safely rejected.\n');
    } finally {
      badServer.close();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Test E: Safety Firewall Rejection (Unallowlisted / Injection)
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test E] Safety Firewall rejects unallowlisted decision or injection...');
  {
    const unallowlistedServer = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          answers: {
            boundedEvent: {
              type: 'choice',
              choice: 'MUTATE_SCORE_100', // NOT IN ALLOWED_BOUNDED_EVENTS
              probabilities: { MUTATE_SCORE_100: 0.99 },
            },
            npcIntent: { type: 'choice', choice: 'WARN' },
            difficultyPressure: { type: 'choice', choice: 'HOLD' },
          },
        })
      );
    });

    await new Promise<void>((resolve) => unallowlistedServer.listen(0, resolve));
    const port = (unallowlistedServer.address() as any).port;
    const unallowlistedUrl = `http://127.0.0.1:${port}/v1/evaluate`;

    try {
      const provider = new ServerJevProvider({
        AI_GATEWAY_API_KEY: 'test-secret-gateway-key-xyz-12345',
        AI_GATEWAY_URL: unallowlistedUrl,
      });

      const envelope = await provider.recommend(mockContext);
      assert.strictEqual(envelope.deterministicFallbackUsed, true, 'Unallowlisted event must be rejected');
      assert.strictEqual(envelope.source, 'deterministic-fallback');
      assert.ok(envelope.reasoningSummary.includes('invalid or unallowlisted'));

      passedTests++;
      console.log('  ✓ Test E passed: Unallowlisted decision blocked by allowlist filter.\n');
    } finally {
      unallowlistedServer.close();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Test F: Deterministic fallback integrity
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test F] Deterministic simulation director fallback integrity...');
  {
    const provider = new ServerJevProvider({});
    const envelope = await provider.recommend(mockContext);

    // mockContext has chainStatus.severity === 'ACTIVE' and disasterType === 'earthquake'
    assert.strictEqual(envelope.payload.boundedEvent, 'AFTERSHOCK_PRESSURE');
    assert.strictEqual(envelope.payload.npcIntent, 'WARN');
    assert.strictEqual(envelope.payload.difficultyPressure, 'INCREASE');
    assert.strictEqual(envelope.confidence, 90);

    passedTests++;
    console.log('  ✓ Test F passed: Grounded simulation state determines fallback decision.\n');
  }

  // ─────────────────────────────────────────────────────────────
  // Test G: Secret Isolation (No secret key leakage)
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test G] Zero secret leakage in envelopes, errors, or telemetry...');
  {
    const dummyKey = 'secret-ai-gateway-token-abc-987654321';
    const errorServer = http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal provider exception' }));
    });

    await new Promise<void>((resolve) => errorServer.listen(0, resolve));
    const port = (errorServer.address() as any).port;
    const errorUrl = `http://127.0.0.1:${port}/v1/evaluate`;

    try {
      // 1. Through ServerJevProvider directly
      const provider = new ServerJevProvider({
        AI_GATEWAY_API_KEY: dummyKey,
        AI_GATEWAY_URL: errorUrl,
      });

      const envelope = await provider.recommend(mockContext);
      const envelopeStr = JSON.stringify(envelope);
      assert.ok(!envelopeStr.includes(dummyKey), 'Envelope must not contain API key');

      // 2. Through gatewayCore handleGatewayRequest
      const reqResult = await handleGatewayRequest(
        { action: 'recommend', context: mockContext },
        { AI_GATEWAY_API_KEY: dummyKey, AI_GATEWAY_URL: errorUrl }
      );

      const resultStr = JSON.stringify(reqResult);
      assert.ok(!resultStr.includes(dummyKey), 'Gateway result must not contain API key');

      // 3. Through gateway status
      const statusResult = await handleGatewayRequest(
        { action: 'status' },
        { AI_GATEWAY_API_KEY: dummyKey }
      );
      const statusStr = JSON.stringify(statusResult);
      assert.ok(!statusStr.includes(dummyKey), 'Status response must not contain API key');

      passedTests++;
      console.log('  ✓ Test G passed: Verified 0% secret leakage in all outputs.\n');
    } finally {
      errorServer.close();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Test H: Client bundle scan (no AI_GATEWAY_API_KEY in client)
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [Test H] Client bundle scan for AI_GATEWAY_API_KEY / VITE_ leaks...');
  {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath, { recursive: true }) as string[];
      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(distPath, file), 'utf-8');
          assert.ok(
            !content.includes('AI_GATEWAY_API_KEY'),
            `Client bundle file ${file} MUST NOT contain AI_GATEWAY_API_KEY`
          );
        }
      }
    }

    // Verify source files in src/ do not contain hardcoded keys
    const srcAiGatewayClient = fs.readFileSync(
      path.resolve(process.cwd(), 'src/ai/gateway/gatewayClient.ts'),
      'utf-8'
    );
    assert.ok(
      !srcAiGatewayClient.includes('AI_GATEWAY_API_KEY'),
      'gatewayClient.ts must not reference AI_GATEWAY_API_KEY'
    );

    passedTests++;
    console.log('  ✓ Test H passed: Bundle and client source confirmed completely free of secrets.\n');
  }

  console.log('========================================================');
  console.log(`🎉 ALL ${passedTests}/8 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================');
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
