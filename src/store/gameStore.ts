// src/store/gameStore.ts
// Zustand global game state. Single source of truth for the entire session.
// No persistence to localStorage for MVP — reset on page load is intentional.

import { create } from 'zustand';
import type { DisasterType } from '../data/types';

export interface DecisionRecord {
  nodeId: string;
  choiceId: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus: number;
  consequenceText: string;
  insight: string;
  insightSource: string;
}

interface GameState {
  // ── Session ─────────────────────────────────────────
  hasSeenIntro: boolean;

  // ── Active disaster ──────────────────────────────────
  activeDisaster: DisasterType | null;

  // ── Scenario traversal ───────────────────────────────
  currentNodeId: string;
  visitedNodes: string[];

  // ── Decision history (drives scoring + report) ───────
  decisions: DecisionRecord[];

  // ── Computed score (finalised at report screen) ──────
  totalScore: number;

  // ── Actions ──────────────────────────────────────────
  markIntroSeen: () => void;
  selectDisaster: (disaster: DisasterType) => void;
  advanceTo: (nodeId: string) => void;
  recordDecision: (record: DecisionRecord) => void;
  finaliseScore: (score: number) => void;
  resetSession: () => void;
}

const initialState = {
  hasSeenIntro: false,
  activeDisaster: null,
  currentNodeId: '',
  visitedNodes: [] as string[],
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
      decisions: [],
      totalScore: 0,
    }),

  advanceTo: (nodeId) =>
    set((state) => ({
      currentNodeId: nodeId,
      visitedNodes: [...state.visitedNodes, nodeId],
    })),

  recordDecision: (record) =>
    set((state) => ({
      decisions: [...state.decisions, record],
    })),

  finaliseScore: (score) => set({ totalScore: score }),

  resetSession: () => set({ ...initialState }),
}));
