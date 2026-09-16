// src/store/gameStore.ts
// Zustand global game state. Single source of truth for the entire session.

import { create } from 'zustand';
import type { DisasterType } from '../data/types';

export interface DecisionRecord {
  nodeId: string;
  situationText: string;
  choiceId: string;
  choiceLabel: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus: number;
  consequenceText: string;
  insight: string;
  insightSource: string;
  nextNodeId: string;
}

export interface ConsequenceState {
  consequenceText: string;
  insight: string;
  insightSource: string;
  nextNodeId: string;
  isCorrect: boolean;
  choiceLabel: string;
}

export interface OutcomeState {
  survived: boolean;
  narrativeText: string;
  nextNodeId: string;
}

interface GameState {
  // ── Session ─────────────────────────────────────────
  hasSeenIntro: boolean;

  // ── Active disaster ──────────────────────────────────
  activeDisaster: DisasterType | null;

  // ── Scenario traversal ───────────────────────────────
  currentNodeId: string;
  visitedNodes: string[];

  // ── Active consequence & outcome states ─────────────
  currentConsequence: ConsequenceState | null;
  currentOutcome: OutcomeState | null;

  // ── Decision history (drives scoring + report) ───────
  decisions: DecisionRecord[];

  // ── Computed score (finalised at report screen) ──────
  totalScore: number;

  // ── Actions ──────────────────────────────────────────
  markIntroSeen: () => void;
  selectDisaster: (disaster: DisasterType) => void;
  advanceTo: (nodeId: string) => void;
  setConsequence: (consequence: ConsequenceState | null) => void;
  setOutcome: (outcome: OutcomeState | null) => void;
  recordDecision: (record: DecisionRecord) => void;
  finaliseScore: (score: number) => void;
  resetSession: () => void;
}

const initialState = {
  hasSeenIntro: false,
  activeDisaster: null,
  currentNodeId: '',
  visitedNodes: [] as string[],
  currentConsequence: null as ConsequenceState | null,
  currentOutcome: null as OutcomeState | null,
  decisions: [] as DecisionRecord[],
  totalScore: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  markIntroSeen: () => set({ hasSeenIntro: true }),

  selectDisaster: (disaster) =>
    set({
      activeDisaster: disaster,
      currentNodeId: '',
      visitedNodes: [],
      currentConsequence: null,
      currentOutcome: null,
      decisions: [],
      totalScore: 0,
    }),

  advanceTo: (nodeId) =>
    set((state) => ({
      currentNodeId: nodeId,
      visitedNodes: [...state.visitedNodes, nodeId],
    })),

  setConsequence: (consequence) => set({ currentConsequence: consequence }),

  setOutcome: (outcome) => set({ currentOutcome: outcome }),

  recordDecision: (record) =>
    set((state) => ({
      decisions: [...state.decisions, record],
    })),

  finaliseScore: (score) => set({ totalScore: score }),

  resetSession: () => set({ ...initialState }),
}));