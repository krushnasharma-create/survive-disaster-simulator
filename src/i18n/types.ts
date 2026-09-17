// src/i18n/types.ts
// Localization types for English and Hinglish language modes.

export type Language = 'en' | 'hinglish';

export interface LocalizedChoice {
  label: string;
  consequenceText: string;
  insight: string;
  insightSource?: string;
}

export interface LocalizedNode {
  situationText?: string;
  contextHint?: string;
  narrativeText?: string;
  choices?: Record<string, LocalizedChoice>;
}

export interface LocalizedScenarioData {
  title?: string;
  subtitle?: string;
  historicalMeta?: {
    eventTitle?: string;
    location?: string;
    date?: string;
    historicalContext?: string;
    disclaimer?: string;
  };
  nodes: Record<string, LocalizedNode>;
}

export interface UiStrings {
  // Navigation & General
  mainMenu: string;
  enterSimulation: string;
  howToPlay: string;
  settings: string;
  returnToMenu: string;
  selectDisaster: string;
  chooseScenario: string;
  launchScenario: string;
  inDevelopment: string;
  locked: string;
  educationalDisclaimer: string;

  // Scenario Selection Layer
  selectScenarioTitle: string;
  modernSimulation: string;
  historicalSimulation: string;
  eventContext: string;
  comingSoon: string;
  backToDisasters: string;

  // Scenario HUD & Gameplay
  activeSimulation: string;
  decisionNumber: string;
  selectAction: string;
  secondsRemaining: string;

  // Consequence & Outcome
  decisionEvaluation: string;
  optimalAction: string;
  highRiskAction: string;
  actionTakenLabel: string;
  immediateOutcome: string;
  protocolGrounding: string;
  continueSimulation: string;
  scenarioResolution: string;
  survivedEvacuated: string;
  viewReport: string;

  // Timeout / Game Over
  timeExpired: string;
  timeoutMessage: string;
  simulationFailed: string;
  retryScenario: string;
  returnToSelect: string;

  // Preparedness Report
  simulationCompleted: string;
  preparednessReport: string;
  preparednessRating: string;
  optimalDecisions: string;
  highRiskDecisions: string;
  rawPerformanceScore: string;
  decisionBreakdown: string;
  stepLabel: string;
  actionLabel: string;
  consequenceLabel: string;
  protocolLabel: string;
  sourceLabel: string;
  keyTakeaways: string;
  emergencyHelplines: string;
  replayScenario: string;
  takeawaysList: string[];

  // Gameplay actions (P1-3)
  enterScenario: string;
  decideNow: string;

  // Consequence chain (P0-2, P0-3)
  yourAction: string;
  newRisk: string;
  saferResponse: string;

  // Outcome (P1-1)
  criticalIncident: string;
  criticalOutcomeSubtext: string;
}