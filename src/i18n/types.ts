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

  // Progressive Disclosure & Accordions (Batch 10)
  systemStatus: string;
  advancedAnalysis: string;
  showDetails: string;
  hideDetails: string;
  showAdvanced: string;
  hideAdvanced: string;
  deepIncidentAnalysis: string;
  deepAnalysisSubtitle: string;

  // Telemetry HUD Labels
  psychologicalStress: string;
  stressLevel: string;
  dangerLevel: string;
  environmentalIntegrity: string;
  squadCohesion: string;
  cityStatus: string;
  trainingPace: string;
  difficultyLevel: string;
  hazardLevel: string;
  safetyIntegrity: string;
  visibility: string;
  directorLabel: string;
  directorStandby: string;
  directorPreVenue: string;
  timePressure: string;
  timeGrace: string;

  // Status Bands & Values
  bandCalm: string;
  bandControlled: string;
  bandElevated: string;
  bandHigh: string;
  bandCritical: string;
  statusStable: string;
  statusEscalating: string;
  statusOperational: string;
  statusStrained: string;
  statusCompromised: string;
  statusSystemFailure: string;

  // Consequence Screen Headings & Labels
  situationShiftTitle: string;
  forwardPropagationTitle: string;
  behavioralResponseTitle: string;
  instinctiveReflex: string;
  protocolTraining: string;
  operatorProfile: string;
  squadStatusTitle: string;
  cityBrainTitle: string;
  multiDisasterChainTitle: string;
  altTimelineTitle: string;
  aiDirectorContextTitle: string;
  disasterDirectorTitle: string;
  officialSource: string;
  actionCommitted: string;

  // Report Screen Deep Audits
  stressRegulationAudit: string;
  envContainmentAudit: string;
  behaviorAdaptationAudit: string;
  npcSquadAudit: string;
  cityBrainAudit: string;
  multiDisasterAudit: string;
  altTimelineAudit: string;
  aiDirectorAuditTitle: string;
  disasterDirectorAuditTitle: string;
  operatorDossier: string;
  finalPanicLevel: string;
  peakPanicReached: string;
  panicTimePenalties: string;
  peakHazardReached: string;
  lowestSafetyIntegrity: string;
  lowestVisibility: string;
  hazardEscalations: string;
  containmentRecoveries: string;
  peakDifficultyReached: string;
  primaryBehavioralAsset: string;
  observedVulnerability: string;
  finalSquadCohesion: string;
  squadMembersSurvived: string;
  injuredCompanions: string;
  specialistSynergies: string;
  emergency112Access: string;
  municipalUtilityStability: string;
  criticalTrapsAvoided: string;
  missedOptimalProtocols: string;
  eventsEvaluated: string;
  stepsEvaluated: string;
  registryValidations: string;
  cooldownBlocks: string;
  executionStatus: string;
  recommendationSources: string;
  playingAsGuest: string;
  createAccountToSave: string;
  safetyArchitectureFirewall: string;
  preVenueComplianceNotice: string;

  // Menus & Settings
  simulationArchive: string;
  statusPlayable: string;
  statusInDev: string;
  tagline: string;
  alertBadge: string;
  settingsTitle: string;
  screenTremors: string;
  highContrastHud: string;
  sessionState: string;
  resetProgress: string;
  closeSettings: string;
  enabled: string;
  disabled: string;
  on: string;
  off: string;
  cleared: string;
}