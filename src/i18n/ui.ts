// src/i18n/ui.ts
// UI string dictionaries for English and Hinglish.

import type { UiStrings, Language } from './types';

export const UI_EN: UiStrings = {
  mainMenu: 'Main Menu',
  enterSimulation: 'Enter Simulation',
  howToPlay: 'How to Play',
  settings: 'Settings',
  returnToMenu: 'Return to Menu',
  selectDisaster: 'Select Disaster',
  chooseScenario: 'Choose Your Scenario',
  launchScenario: 'Launch Scenario',
  inDevelopment: 'In Development',
  locked: '[LOCKED]',
  educationalDisclaimer:
    'Educational Simulation: This experience is designed for general emergency awareness based on public safety principles from NDMA and 112 ERSS. It does not substitute for on-ground directives from local disaster management authorities or certified safety training.',

  // Scenario Selection Layer
  selectScenarioTitle: 'Select Incident Scenario',
  modernSimulation: 'Modern Urban Simulation',
  historicalSimulation: 'Historical Simulation',
  eventContext: 'Historical Event Context',
  comingSoon: 'Coming Next',
  backToDisasters: 'All Disasters',

  activeSimulation: 'LIVE SIMULATION',
  decisionNumber: 'DECISION',
  selectAction: 'Select Your Action',
  secondsRemaining: 'seconds remaining',

  decisionEvaluation: 'Decision Evaluation',
  optimalAction: '✓ Optimal Protocol',
  highRiskAction: '⚠ High-Risk Action',
  actionTakenLabel: 'Action Taken:',
  immediateOutcome: 'Immediate Outcome',
  protocolGrounding: 'Emergency Protocol Grounding',
  continueSimulation: 'Continue Simulation →',
  scenarioResolution: 'Scenario Resolution',
  survivedEvacuated: 'Survived — Evacuated',
  viewReport: 'View Preparedness Report →',

  timeExpired: 'TIME EXPIRED',
  timeoutMessage:
    'You hesitated too long. In an emergency, survival decisions must be made in seconds. The situation escalated beyond your control.',
  simulationFailed: 'SIMULATION FAILED',
  retryScenario: 'Retry Scenario',
  returnToSelect: 'Return to Selection',

  simulationCompleted: 'Simulation Completed · Official Evaluation',
  preparednessReport: 'Preparedness Report',
  preparednessRating: 'Final Preparedness Rating',
  optimalDecisions: 'Optimal Decisions',
  highRiskDecisions: 'High-Risk Decisions',
  rawPerformanceScore: 'Raw Performance Score',
  decisionBreakdown: 'Decision Breakdown & Feedback',
  stepLabel: 'Step',
  actionLabel: 'Action:',
  consequenceLabel: 'Consequence:',
  protocolLabel: 'NDMA Protocol:',
  sourceLabel: 'Source:',
  keyTakeaways: 'NDMA Life-Safety Rules (Takeaways)',
  emergencyHelplines: 'Emergency Support Services (India)',
  replayScenario: 'Replay Scenario',
  takeawaysList: [
    'DROP, COVER, AND HOLD ON: Protect your head and torso under sturdy furniture. Avoid running outside while ground shaking is active.',
    'NEUTRALIZE SECONDARY HAZARDS: Switch off LPG cylinder regulators and electrical mains once shaking stops to help prevent fires.',
    'NEVER USE ELEVATORS: Use designated fire staircases. If an aftershock hits while on stairs, crouch on the landing against an interior wall.',
    'CLEAR BUILDING EXTERIORS: Falling glass, parapet debris, and air conditioner units present severe hazards. Move to an open area away from structures.',
    'USE SMS & KEEP 112 CLEAR: Cellular voice networks congest quickly. Use text messages to reach family, and reserve 112 for urgent life-threatening emergencies.',
  ],
};

export const UI_HINGLISH: UiStrings = {
  mainMenu: 'Main Menu',
  enterSimulation: 'Simulation Shuru Karein',
  howToPlay: 'Khelne Ka Tareeka',
  settings: 'Settings',
  returnToMenu: 'Menu Par Lautiye',
  selectDisaster: 'Aapda Chunein',
  chooseScenario: 'Apna Scenario Chunein',
  launchScenario: 'Simulation Shuru Karein',
  inDevelopment: 'Taiyyari Jaari Hai',
  locked: '[LOCKED]',
  educationalDisclaimer:
    'Shiksha hetu Simulation: Yeh anubhav NDMA aur 112 ERSS ke suraksha niyamo par aadharit aam jagrukta ke liye hai. Yeh official emergency services ya safety training ka vikalp nahi hai.',

  // Scenario Selection Layer
  selectScenarioTitle: 'Apna Scenario Chunein',
  modernSimulation: 'Modern Urban Simulation',
  historicalSimulation: 'Itihasik (Historical) Simulation',
  eventContext: 'Ahem Itihasik Sandarbh',
  comingSoon: 'Agla Scenario (Jald Aayega)',
  backToDisasters: 'Sabhi Aapdayein',

  activeSimulation: 'LIVE SIMULATION',
  decisionNumber: 'FAISLA',
  selectAction: 'Apna Kadam Chunein',
  secondsRemaining: 'seconds bache hain',

  decisionEvaluation: 'Faisle Ki Jaanch',
  optimalAction: '✓ Sahi Niyamit Kadam',
  highRiskAction: '⚠ Khatarnak Kadam',
  actionTakenLabel: 'Aapka Faisla:',
  immediateOutcome: 'Turant Nateeja',
  protocolGrounding: 'Official Suraksha Niyam (NDMA)',
  continueSimulation: 'Aage Badhein →',
  scenarioResolution: 'Nateeja',
  survivedEvacuated: 'Aap Bach Gaye — Surakshit Bahar',
  viewReport: 'Taiyyari Ki Report Dekhein →',

  timeExpired: 'WAQT KHATAM',
  timeoutMessage:
    'Aapne faisla lene mein bahut der kardi. Disaster ke waqt har second keemti hota hai. Haalat aapke niyantran se bahar ho gaye.',
  simulationFailed: 'SIMULATION ASAFAL',
  retryScenario: 'Dobara Koshish Karein',
  returnToSelect: 'Aapda Selection Par Lautiye',

  simulationCompleted: 'Simulation Pura Hua · Taiyyari Report',
  preparednessReport: 'Aapda Taiyyari Report',
  preparednessRating: 'Antim Taiyyari Rating',
  optimalDecisions: 'Sahi Faisle',
  highRiskDecisions: 'Khatarnak Faisle',
  rawPerformanceScore: 'Kull Score Points',
  decisionBreakdown: 'Har Faisle Ka Breakdown',
  stepLabel: 'Kadam',
  actionLabel: 'Aapka Action:',
  consequenceLabel: 'Nateeja:',
  protocolLabel: 'NDMA Niyam:',
  sourceLabel: 'Srot (Source):',
  keyTakeaways: 'NDMA Zaroori Suraksha Niyam',
  emergencyHelplines: 'Emergency Sahayata Numbers (India)',
  replayScenario: 'Scenario Phir Se Khele',
  takeawaysList: [
    'DROP, COVER, HOLD ON: Majboot table ke neeche sar aur shareer ko cover karein. Tremor ke waqt bahar bhagne ki koshish na karein.',
    'SECONDARY HAZARDS SE BACHEIN: Jhatke rukte hi gas cylinder ka regulator aur main bijli switch band karein taaki aag na lage.',
    'LIFT KA ISTEMAL KABHI NA KAREIN: Sirf emergency seedhiyon (stairs) ka prayog karein. Seedhiyon par aftershock aaye toh landing par deewar ke paas jhuk kar baith jayein.',
    'BUILDING KI DEEWARON SE DOOR RAHEIN: Girte hue kanch, AC units aur bricks se bachein. Ek khule maidan mein jayein.',
    'SMS KA PRAYOG KAREIN, 112 LINE KHALI RAKHEIN: Disaster ke waqt call network jam ho jata hai. Parivaar ko SMS karein aur 112 sirf jaanleva sankat ke liye dial karein.',
  ],
};

export function getUiStrings(lang: Language): UiStrings {
  return lang === 'hinglish' ? UI_HINGLISH : UI_EN;
}