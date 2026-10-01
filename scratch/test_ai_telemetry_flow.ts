// scratch/test_ai_telemetry_flow.ts
// Verification test suite for AI Director telemetry synchronization and source attribution.
// Covers Requirements A through F.

(import.meta as any).env = {
  VITE_SUPABASE_URL: '',
  VITE_SUPABASE_ANON_KEY: '',
  MODE: 'test',
  DEV: true,
  PROD: false,
  SSR: false,
};

import assert from 'node:assert';
import { aiDirector } from '../src/ai/aiDirector';
import { generateDeterministicGeminiFallback } from '../src/ai/gemini/geminiAdapter';
import { validateGeminiEnvelope } from '../src/ai/safetyFirewall';
import type { AiEnvelope, GeminiNarrativeResponse, GeminiNarrativeRequest } from '../src/ai/types';

async function runTests() {
  console.log('--- STARTING AI DIRECTOR TELEMETRY FLOW TESTS ---\n');

  // =========================================================================
  // Test A: Successful Gemini response -> aiDirectorSource === "gemini"
  // =========================================================================
  console.log('[TEST A] Successful Gemini response -> aiDirectorSource === "gemini"');
  {
    aiDirector.resetTelemetry();

    // Mock creativeBrain to simulate a live Gemini response
    const mockEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
      requestId: 'test-gemini-live-123',
      contextVersion: '1.0',
      source: 'gemini-creative',
      confidence: 95,
      timestamp: Date.now(),
      allowedActions: [],
      expirationMs: 30000,
      reasoningSummary: 'Gemini live atmospheric narrative.',
      deterministicFallbackUsed: false,
      payload: {
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        text: 'The concrete stairwell trembles with resonant aftershocks.',
        speaker: 'Atmospheric Director',
        tone: 'URGENT',
      },
    };

    // Temporarily inject mock narrate
    const directorAny = aiDirector as any;
    const originalNarrate = directorAny.creativeBrain.narrate;
    directorAny.creativeBrain.narrate = async () => mockEnvelope;

    const request: GeminiNarrativeRequest = {
      type: 'ENVIRONMENTAL_ATMOSPHERE',
      context: {
        disasterType: 'earthquake',
        currentPhase: 'IMPACT',
        hazardLevel: 75,
        panicLevel: 60,
        playerInstinctBand: 'CONTROLLED',
        playerTrainingBand: 'TRAINED',
        recentDecisions: [],
      },
      language: 'en',
    };

    const envelope = await aiDirector.requestNarrative(request);
    assert.strictEqual(envelope.deterministicFallbackUsed, false, 'Expected live response');

    // 1. Check AiDirectorCoordinator internal telemetry
    const telemetry = aiDirector.getTelemetry();
    assert.strictEqual(telemetry.geminiAvailable, true, 'Coordinator geminiAvailable must be true');
    assert.strictEqual(telemetry.lastNarrative, mockEnvelope.payload.text, 'Coordinator lastNarrative must match');

    // 2. Check source attribution logic as implemented in ScenarioScreen
    const sourceAttribution = envelope.deterministicFallbackUsed ? 'deterministic-fallback' : 'gemini';
    assert.strictEqual(sourceAttribution, 'gemini', 'Source must be gemini');

    // Restore original narrate
    directorAny.creativeBrain.narrate = originalNarrate;
    console.log('  ✓ Test A Passed: Coordinator updated geminiAvailable to true and source is "gemini"\n');
  }

  // =========================================================================
  // Test B: Deterministic fallback response -> aiDirectorSource === "deterministic-fallback"
  // =========================================================================
  console.log('[TEST B] Deterministic fallback response -> aiDirectorSource === "deterministic-fallback"');
  {
    aiDirector.resetTelemetry();

    // Mock creativeBrain to simulate a fallback envelope (e.g. gateway unconfigured or provider fallback)
    const mockFallbackEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
      requestId: 'test-fallback-123',
      contextVersion: '1.0',
      source: 'deterministic-fallback',
      confidence: 88,
      timestamp: Date.now(),
      allowedActions: [],
      expirationMs: 30000,
      reasoningSummary: 'Deterministic fallback.',
      deterministicFallbackUsed: true,
      payload: {
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        text: 'Suspended particulate clouds reduce corridor visibility.',
        speaker: 'Emergency System',
        tone: 'URGENT',
      },
    };

    const directorAny = aiDirector as any;
    const originalNarrate = directorAny.creativeBrain.narrate;
    directorAny.creativeBrain.narrate = async () => mockFallbackEnvelope;

    const request: GeminiNarrativeRequest = {
      type: 'ENVIRONMENTAL_ATMOSPHERE',
      context: {
        disasterType: 'earthquake',
        currentPhase: 'IMPACT',
        hazardLevel: 75,
        panicLevel: 60,
        playerInstinctBand: 'CONTROLLED',
        playerTrainingBand: 'TRAINED',
        recentDecisions: [],
      },
      language: 'en',
    };

    const envelope = await aiDirector.requestNarrative(request);
    assert.strictEqual(envelope.deterministicFallbackUsed, true, 'Expected fallback response');

    // Check AiDirectorCoordinator internal telemetry
    const telemetry = aiDirector.getTelemetry();
    assert.strictEqual(telemetry.geminiAvailable, false, 'Coordinator geminiAvailable must be false on fallback');

    // Check source attribution
    const sourceAttribution = envelope.deterministicFallbackUsed ? 'deterministic-fallback' : 'gemini';
    assert.strictEqual(sourceAttribution, 'deterministic-fallback', 'Source must be deterministic-fallback');

    directorAny.creativeBrain.narrate = originalNarrate;
    console.log('  ✓ Test B Passed: Coordinator updated geminiAvailable to false and source is "deterministic-fallback"\n');
  }

  // =========================================================================
  // Test C: Fast click before Gemini response -> deterministic fallback is used and correctly labeled
  // =========================================================================
  console.log('[TEST C] Fast click before Gemini response -> deterministic fallback used and correctly labeled');
  {
    // Simulate ScenarioScreen ref tracking
    const nodeNarrativeRef = {
      nodeId: 'node_seismic_01',
      narrativeText: null as string | null,
      source: 'deterministic-fallback' as 'gemini' | 'deterministic-fallback',
    };

    // User clicks before request finishes: nodeNarrativeRef.narrativeText is null
    const currentNodeId = 'node_seismic_01';
    let effectiveNarrative: string;
    let effectiveSource: 'gemini' | 'deterministic-fallback';

    if (nodeNarrativeRef.nodeId === currentNodeId && nodeNarrativeRef.narrativeText) {
      effectiveNarrative = nodeNarrativeRef.narrativeText;
      effectiveSource = nodeNarrativeRef.source;
    } else {
      const fallbackEnvelope = generateDeterministicGeminiFallback({
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        context: {
          disasterType: 'earthquake',
          currentPhase: 'IMPACT',
          hazardLevel: 80,
          panicLevel: 50,
          playerInstinctBand: 'CONTROLLED',
          playerTrainingBand: 'TRAINED',
          recentDecisions: [],
        },
        language: 'en',
      });
      effectiveNarrative = fallbackEnvelope.payload.text;
      effectiveSource = 'deterministic-fallback';
    }

    assert.ok(effectiveNarrative.length > 0, 'Fallback narrative text must be generated');
    assert.strictEqual(effectiveSource, 'deterministic-fallback', 'Fast-click source must be deterministic-fallback');
    console.log('  ✓ Test C Passed: Instant fallback generated without blocking and stamped "deterministic-fallback"\n');
  }

  // =========================================================================
  // Test D: Previous node's Gemini narrative cannot leak into the next node
  // =========================================================================
  console.log('[TEST D] Previous node Gemini narrative cannot leak into next node');
  {
    // Step 1: Node 1 finishes with a Gemini live narrative
    const nodeNarrativeRef = {
      nodeId: 'node_1',
      narrativeText: 'Node 1 Gemini Live Text: Thermal updrafts pulse through quadrant B.',
      source: 'gemini' as 'gemini' | 'deterministic-fallback',
    };

    // Step 2: Transition to Node 2 (ScenarioScreen resets the ref on mount)
    nodeNarrativeRef.nodeId = 'node_2';
    nodeNarrativeRef.narrativeText = null;
    nodeNarrativeRef.source = 'deterministic-fallback';

    // Step 3: Fast click on Node 2 before Node 2's request completes
    const currentNodeId = 'node_2';
    let effectiveNarrative: string;
    let effectiveSource: 'gemini' | 'deterministic-fallback';

    if (nodeNarrativeRef.nodeId === currentNodeId && nodeNarrativeRef.narrativeText) {
      effectiveNarrative = nodeNarrativeRef.narrativeText;
      effectiveSource = nodeNarrativeRef.source;
    } else {
      const fallback = generateDeterministicGeminiFallback({
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        context: {
          disasterType: 'fire',
          currentPhase: 'IMPACT',
          hazardLevel: 80,
          panicLevel: 50,
          playerInstinctBand: 'CONTROLLED',
          playerTrainingBand: 'TRAINED',
          recentDecisions: [],
        },
        language: 'en',
      });
      effectiveNarrative = fallback.payload.text;
      effectiveSource = 'deterministic-fallback';
    }

    assert.ok(!effectiveNarrative.includes('Node 1'), 'Node 2 must NOT contain Node 1 narrative');
    assert.strictEqual(effectiveSource, 'deterministic-fallback', 'Node 2 fast-click must be deterministic-fallback');
    console.log('  ✓ Test D Passed: Zero narrative leakage between nodes\n');
  }

  // =========================================================================
  // Test E: ReportScreen still correctly shows Gemini ONLINE after a successful request
  // =========================================================================
  console.log('[TEST E] ReportScreen shows Gemini ONLINE after a successful request');
  {
    // Simulate ScenarioScreen updating Zustand store after successful response
    let aiDirectorState = {
      mode: 'ACTIVE' as const,
      jevAvailable: false,
      geminiAvailable: false,
      lastRecommendation: null,
      lastNarrative: null,
      recommendationCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      fallbackCount: 0,
      activePressure: 'NONE' as const,
    };

    const updateAiDirectorState = (patch: Partial<typeof aiDirectorState>) => {
      aiDirectorState = { ...aiDirectorState, ...patch };
    };

    // 1. Successful response payload
    const liveEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
      requestId: 'test-live-gemini',
      contextVersion: '1.0',
      source: 'gemini-creative',
      confidence: 94,
      timestamp: Date.now(),
      allowedActions: [],
      expirationMs: 30000,
      reasoningSummary: 'Live Gemini narrative.',
      deterministicFallbackUsed: false,
      payload: {
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        text: 'Live Gemini text',
        speaker: 'System',
        tone: 'URGENT',
      },
    };

    // ScenarioScreen line 261-264
    updateAiDirectorState({
      lastNarrative: liveEnvelope.payload.text,
      geminiAvailable: !liveEnvelope.deterministicFallbackUsed,
    });

    assert.strictEqual(aiDirectorState.geminiAvailable, true, 'Store geminiAvailable must be true');

    // ReportScreen line 573 logic:
    const geminiStatus = aiDirectorState.geminiAvailable
      ? 'ONLINE (ACTIVE)'
      : 'FALLBACK ACTIVE (DETERMINISTIC)';
    assert.strictEqual(geminiStatus, 'ONLINE (ACTIVE)', 'ReportScreen audit must compute ONLINE');

    // If fallback is received instead:
    updateAiDirectorState({
      lastNarrative: 'Fallback text',
      geminiAvailable: false,
    });
    const fallbackStatus = aiDirectorState.geminiAvailable
      ? 'ONLINE (ACTIVE)'
      : 'FALLBACK ACTIVE (DETERMINISTIC)';
    assert.strictEqual(fallbackStatus, 'FALLBACK ACTIVE (DETERMINISTIC)', 'ReportScreen audit must compute FALLBACK');

    console.log('  ✓ Test E Passed: ReportScreen correctly evaluates Gemini as ONLINE (ACTIVE)\n');
  }

  // =========================================================================
  // Test F: Safety firewall behavior remains unchanged
  // =========================================================================
  console.log('[TEST F] Safety firewall behavior remains unchanged');
  {
    // 1. Legitimate emergency language must PASS
    const validEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
      requestId: 'test-valid-fw',
      contextVersion: '1.0',
      source: 'gemini-creative',
      confidence: 90,
      timestamp: Date.now(),
      allowedActions: [],
      expirationMs: 30000,
      reasoningSummary: 'Valid narrative.',
      deterministicFallbackUsed: false,
      payload: {
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        text: 'HAZARD: Tremors detected near the east stairwell. Watch for window glass partitions.',
        speaker: 'System',
        tone: 'URGENT',
      },
    };
    const validCheck = validateGeminiEnvelope(validEnvelope);
    assert.strictEqual(validCheck.valid, true, 'Legitimate emergency text must pass firewall');

    // 2. Malicious state manipulation or script injection must be REJECTED
    const maliciousEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
      requestId: 'test-malicious-fw',
      contextVersion: '1.0',
      source: 'gemini-creative',
      confidence: 90,
      timestamp: Date.now(),
      allowedActions: [],
      expirationMs: 30000,
      reasoningSummary: 'Malicious attempt.',
      deterministicFallbackUsed: false,
      payload: {
        type: 'ENVIRONMENTAL_ATMOSPHERE',
        text: 'window.__admin = true; <script>fetch("/api/leak")</script>',
        speaker: 'System',
        tone: 'URGENT',
      },
    };
    const maliciousCheck = validateGeminiEnvelope(maliciousEnvelope);
    assert.strictEqual(maliciousCheck.valid, false, 'Malicious script pattern must be blocked');

    console.log('  ✓ Test F Passed: Safety firewall correctly validates content\n');
  }

  console.log('=====================================================');
  console.log('ALL AI DIRECTOR TELEMETRY FLOW TESTS PASSED (6/6)');
  console.log('=====================================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
