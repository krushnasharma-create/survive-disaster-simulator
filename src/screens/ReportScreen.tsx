// src/screens/ReportScreen.tsx
// Comprehensive Emergency Preparedness Report.
// Displays calculated score, decision-by-decision review, and official NDMA takeaways.

import { useMemo, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { buildReport } from '../engine/reportBuilder';
import { getUiStrings, FIRE_HINGLISH_TAKEAWAYS, FLOOD_HINGLISH_TAKEAWAYS, GAS_LEAK_HINGLISH_TAKEAWAYS } from '../i18n';
import { finalizeRun } from '../services/gamePersistenceService';
import { OperatorBadge } from '../components/OperatorBadge';
import {
  getBehavioralBand,
  getBehaviorProfile,
  getProfileDescription,
} from '../engine/simulationState';
import { playSelect } from '../utils/audio';
import { adaptiveDirector } from '../ai';
import styles from './ReportScreen.module.css';

export default function ReportScreen() {
  const navigate = useNavigate();
  const {
    decisions,
    activeDisaster,
    activeScenarioId,
    resetSession,
    language,
    authUserId,
    activeRunId,
    setActiveRunId,
    currentOutcome,
    aiDirectorState,
  } = useGameStore();

  const [showDeepAudits, setShowDeepAudits] = useState(false);

  const report = useMemo(() => buildReport(decisions, activeDisaster || undefined), [decisions, activeDisaster]);
  const { scoreSummary, decisionReviews, keyTakeaways, officialHelplines } = report;
  const ui = useMemo(() => getUiStrings(language), [language]);

  // Asynchronously finalize active Supabase game run if authenticated
  useEffect(() => {
    if (authUserId && activeRunId) {
      finalizeRun(activeRunId, authUserId, {
        survived: currentOutcome?.survived ?? true,
        scoreSummary,
      });
      setActiveRunId(null);
    }
  }, [authUserId, activeRunId, currentOutcome, scoreSummary, setActiveRunId]);

  const handlePlayAgain = () => {
    const savedDisaster = activeDisaster || 'earthquake';
    const savedScenarioId = activeScenarioId;
    resetSession();
    const query = savedScenarioId ? `?scenario=${savedScenarioId}` : '';
    navigate(`/disaster/${savedDisaster}/intro${query}`);
  };

  const handleSelectNew = () => {
    resetSession();
    navigate('/select');
  };

  const toggleLanguage = () => {
    useGameStore.getState().setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  const localizedScoreBandDesc = useMemo(() => {
    if (language === 'hinglish') {
      if (scoreSummary.score >= 85) {
        return 'Shaandar emergency response instincts! Aapke har kadam ne NDMA ke official disaster protocol ka seedha paalan kiya.';
      }
      if (scoreSummary.score >= 65) {
        return 'Achha suraksha anubhav. Thodi jhijhak ya secondary hazards aaye, par mukhya jaan-maal ki suraksha bani rahi.';
      }
      if (scoreSummary.score >= 40) {
        return 'Kuch ahem galtiyan samne aayi hain. NDMA guidelines ko dhyan se padhein taaki emergency mein sahi kadam instinctively utha sakein.';
      }
      return 'Khatarnak faislon ne suraksha ko jokhim mein daala. Is simulation ko dobara khele aur jeevan-rakshak emergency rules sikhein.';
    }
    return scoreSummary.bandDescription;
  }, [language, scoreSummary]);

  const isGasLeak = useMemo(
    () => activeDisaster === 'gas_leak' || decisions.some((d) => d.nodeId.startsWith('gas-')),
    [activeDisaster, decisions]
  );

  const takeawaysToDisplay = useMemo(() => {
    const isFire = activeDisaster === 'fire' || decisions.some((d) => d.nodeId.startsWith('fire-') || d.nodeId.startsWith('frc-'));
    const isFlood = activeDisaster === 'flood' || decisions.some((d) => d.nodeId.startsWith('flood-') || d.nodeId.startsWith('fls-'));
    if (language === 'hinglish') {
      if (isFire) return FIRE_HINGLISH_TAKEAWAYS;
      if (isFlood) return FLOOD_HINGLISH_TAKEAWAYS;
      if (isGasLeak) return GAS_LEAK_HINGLISH_TAKEAWAYS;
      return ui.takeawaysList;
    }
    return keyTakeaways;
  }, [language, activeDisaster, decisions, ui, keyTakeaways, isGasLeak]);

  const panicAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        peakPanic: 15,
        peakBand: 'CALM',
        finalPanic: 15,
        finalBand: 'CALM',
        timerCompressions: 0,
        summary: 'No active decisions recorded.',
      };
    }

    let peakPanic = 15;
    let timerCompressions = 0;
    decisions.forEach((d) => {
      if (d.panicLevel !== undefined) {
        if (d.panicLevel > peakPanic) {
          peakPanic = d.panicLevel;
        }
        if (d.panicLevel >= 41) {
          timerCompressions++;
        }
      }
    });

    const lastDecision = decisions[decisions.length - 1];
    const finalPanic = lastDecision?.panicLevel ?? peakPanic;
    const finalBand = lastDecision?.panicBand ?? (finalPanic <= 20 ? 'CALM' : finalPanic <= 40 ? 'CONTROLLED' : finalPanic <= 60 ? 'ELEVATED' : finalPanic <= 80 ? 'HIGH' : 'CRITICAL');
    const peakBand = peakPanic <= 20 ? 'CALM' : peakPanic <= 40 ? 'CONTROLLED' : peakPanic <= 60 ? 'ELEVATED' : peakPanic <= 80 ? 'HIGH' : 'CRITICAL';

    let summary = '';
    if (language === 'hinglish') {
      if (peakPanic <= 35) {
        summary = 'Shaandar manasik santulan! Aapne disaster ke tanaav ko bilkul kabu mein rakha aur sthir soch ke sath NDMA nirdeshon ka palan kiya.';
      } else if (peakPanic <= 65) {
        summary = 'Madhyam tanaav sthiti. Beech mein khatre badhne par stress badha, par aapne samay par surakshit faisle lekar sthiti ko sambhal liya.';
      } else {
        summary = 'Uchha tanaav aur ghabrahat darj ki gayi. Jokhim bhare kadmon ne psychological pressure badhaya, jisse faisla lene ka samay kam ho gaya.';
      }
    } else {
      if (peakPanic <= 35) {
        summary = 'High situational composure. You controlled psychological stress effectively, avoiding critical timer compression and maintaining clear decision margins.';
      } else if (peakPanic <= 65) {
        summary = 'Controlled operational stress. Experienced elevated crisis pressure during critical junctures, but regained situational stability through protocol adherence.';
      } else {
        summary = 'Severe crisis stress overload. High-risk decisions escalated panic into critical thresholds, compressing subsequent decision windows and reducing margin of safety.';
      }
    }

    return {
      peakPanic,
      peakBand,
      finalPanic,
      finalBand,
      timerCompressions,
      summary,
    };
  }, [decisions, language]);

  const envAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        peakHazard: 25,
        minSafety: 85,
        minVisibility: 85,
        escalations: 0,
        recoveries: 0,
        containmentRating: 'OPTIMAL',
        finalBand: 'LOW_RISK',
        summary: 'No active decisions recorded.',
      };
    }

    let peakHazard = 0;
    let minSafety = 100;
    let minVisibility = 100;
    let escalations = 0;
    let recoveries = 0;

    decisions.forEach((d) => {
      if (d.hazardLevel !== undefined) {
        if (d.hazardLevel > peakHazard) peakHazard = d.hazardLevel;
      }
      if (d.safetyIntegrity !== undefined) {
        if (d.safetyIntegrity < minSafety) minSafety = d.safetyIntegrity;
      }
      if (d.visibility !== undefined) {
        if (d.visibility < minVisibility) minVisibility = d.visibility;
      }
      if (d.stateDelta) {
        if (d.stateDelta.hazardChange > 0) escalations++;
        if (d.stateDelta.hazardChange <= 0 && d.isCorrect) recoveries++;
      }
    });

    const lastDecision = decisions[decisions.length - 1];
    const finalBand = lastDecision?.convergenceBand ?? 'LOW_RISK';

    // Containment Rating
    let containmentRating = 'OPTIMAL';
    if (peakHazard >= 70 || minSafety <= 30) {
      containmentRating = 'CRITICAL_BREACH';
    } else if (peakHazard >= 50 || minSafety <= 50) {
      containmentRating = 'COMPROMISED';
    } else if (peakHazard >= 35 || minSafety <= 65) {
      containmentRating = 'CONTROLLED';
    }

    let summary = '';
    if (language === 'hinglish') {
      if (containmentRating === 'OPTIMAL') {
        summary = 'Aadarniya paryavaran niyantran! Aapke faislon ne khatarnak hazards ko badhne nahi diya aur surakshit nikaas raste barkarar rakhe.';
      } else if (containmentRating === 'CONTROLLED') {
        summary = 'Sthir paryavaran santulan. Kuch secondary hazards ubhre, par aapne samay par suraksha banaye rakhi.';
      } else {
        summary = 'Paryavaran sthiti mein gambhir bigaad darj hua. Hazard compounding ne nikaas margon aur suraksha ko sankat mein daala.';
      }
    } else {
      if (containmentRating === 'OPTIMAL') {
        summary = 'Exceptional environmental containment. Decisions systematically mitigated secondary hazards, preserving structural integrity and viable evacuation corridors.';
      } else if (containmentRating === 'CONTROLLED') {
        summary = 'Controlled hazard trajectory. Contained active escalation with focused protocol execution, maintaining tenable margins.';
      } else {
        summary = 'Severe hazard escalation. Compounding risks degraded pathway safety and narrowed survival margins across consecutive decision phases.';
      }
    }

    return {
      peakHazard,
      minSafety,
      minVisibility,
      escalations,
      recoveries,
      containmentRating,
      finalBand,
      summary,
    };
  }, [decisions, language]);

  const behaviorAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        finalInstinct: 50,
        finalTraining: 50,
        instinctBand: 'DEVELOPING' as const,
        trainingBand: 'DEVELOPING' as const,
        profile: 'BALANCED_RESPONDER' as const,
        initialDifficulty: 2,
        peakDifficulty: 2,
        finalDifficulty: 2,
        adaptationTrajectory: 'STABILIZED',
        strongestSignal: 'Standard Evaluation',
        weakestSignal: 'None',
        summary: 'No active decisions recorded.',
      };
    }

    const lastDecision = decisions[decisions.length - 1];
    const finalInstinct = lastDecision?.instinctScore ?? 50;
    const finalTraining = lastDecision?.trainingScore ?? 50;
    const instinctBand = lastDecision?.instinctBand ?? getBehavioralBand(finalInstinct);
    const trainingBand = lastDecision?.trainingBand ?? getBehavioralBand(finalTraining);
    const profile = lastDecision?.behaviorProfile ?? getBehaviorProfile(finalInstinct, finalTraining);

    let peakDifficulty = 2;
    const finalDifficulty = lastDecision?.difficultyLevel ?? 2;
    const signalCounts: Record<string, number> = {};

    decisions.forEach((d) => {
      const lvl = d.difficultyLevel ?? 2;
      if (lvl > peakDifficulty) peakDifficulty = lvl;
      if (d.behaviorSignal) {
        signalCounts[d.behaviorSignal] = (signalCounts[d.behaviorSignal] || 0) + 1;
      }
    });

    const positiveSignals = [
      'RAPID_DECISIVE_SAFE',
      'HIGH_STRESS_COMPOSURE',
      'POST_ERROR_RECOVERY',
      'MEASURED_PROTOCOL_ADHERENCE',
      'HESITANT_SAFE_RECOVERY',
    ];
    const negativeSignals = [
      'IMPULSIVE_RISK_REFLEX',
      'HESITANT_PARALYSIS',
      'PANIC_COMPROMISE',
      'COMPOUNDING_ERROR',
      'SUBOPTIMAL_ACTION',
    ];

    let strongestSignal = 'Measured Protocol Adherence';
    let maxPosCount = 0;
    for (const sig of positiveSignals) {
      if ((signalCounts[sig] || 0) > maxPosCount) {
        maxPosCount = signalCounts[sig];
        strongestSignal = sig.replace(/_/g, ' ');
      }
    }

    let weakestSignal = 'None';
    let maxNegCount = 0;
    for (const sig of negativeSignals) {
      if ((signalCounts[sig] || 0) > maxNegCount) {
        maxNegCount = signalCounts[sig];
        weakestSignal = sig.replace(/_/g, ' ');
      }
    }

    let adaptationTrajectory: 'IMPROVED' | 'STABILIZED' | 'COMPROMISED' = 'STABILIZED';
    if (finalTraining >= 65) {
      adaptationTrajectory = 'IMPROVED';
    } else if (finalTraining < 45) {
      adaptationTrajectory = 'COMPROMISED';
    }

    let summary = '';
    if (language === 'hinglish') {
      if (adaptationTrajectory === 'IMPROVED') {
        summary = `Shandar protocol execution! Aapka training score ${finalTraining}/100 tak pahuncha aur aapne Level ${peakDifficulty} difficulty tak disciplined faisle liye. Sahaj reflex aur NDMA training ka behtareen talmel.`;
      } else if (adaptationTrajectory === 'STABILIZED') {
        summary = `Sthir pratikriya. Aapne crisis ke dauran buniyadi safety niyam apnaye rakhe. Tezi se badhte tanaav mein jhijhak kam karke reflex ko aur disciplined banaya ja sakta hai.`;
      } else {
        summary = `Training mein badha darj hui. Bar-bar high-risk ya impulsive chayan se training score ${finalTraining}/100 par gir gaya. Emergency guidelines ke niyamit abhyas ki sifarish ki jaati hai.`;
      }
    } else {
      if (adaptationTrajectory === 'IMPROVED') {
        summary = `Exemplary protocol execution. Training score reached ${finalTraining}/100 with disciplined response across peak Level ${peakDifficulty} difficulty. Instinct and NDMA guidelines operated in complete alignment.`;
      } else if (adaptationTrajectory === 'STABILIZED') {
        summary = `Steady operational response. Maintained foundational safety principles under moderate crisis pressure. Eliminating late hesitation will further convert reactive impulse into conditioned discipline.`;
      } else {
        summary = `Protocol adherence degraded under compounded stress. Impulsive or hesitant choices reduced training score to ${finalTraining}/100. Focused review of official NDMA protocols recommended.`;
      }
    }

    return {
      finalInstinct,
      finalTraining,
      instinctBand,
      trainingBand,
      profile,
      initialDifficulty: 2,
      peakDifficulty,
      finalDifficulty,
      adaptationTrajectory,
      strongestSignal,
      weakestSignal,
      summary,
    };
  }, [decisions, language]);

  // ── Batch 5: NPC Squad Audit ──
  const squadAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        finalCohesion: 75,
        minCohesion: 75,
        membersSurvived: 3,
        membersInjured: 0,
        membersCritical: 0,
        synergyEvents: 0,
        rating: 'COHESIVE_SQUAD' as const,
        summary: 'No active squad decisions recorded.',
      };
    }

    const lastDec = decisions[decisions.length - 1];
    const finalCohesion = lastDec?.squadCohesion ?? 75;
    let minCohesion = 100;
    let synergyEvents = 0;

    decisions.forEach((d) => {
      const coh = d.squadCohesion ?? 75;
      if (coh < minCohesion) minCohesion = coh;
      if (coh >= 65 && d.isCorrect) synergyEvents++;
    });

    const squadMembers = lastDec?.squadMembers ?? [];
    let membersCritical = 0;
    let membersInjured = 0;
    let membersSurvived = 0;

    if (squadMembers.length > 0) {
      squadMembers.forEach((m) => {
        if (m.status === 'CRITICAL' || m.safety <= 25) {
          membersCritical++;
        } else if (m.status === 'INJURED' || m.safety <= 45) {
          membersInjured++;
          membersSurvived++;
        } else {
          membersSurvived++;
        }
      });
    } else {
      membersSurvived = 3;
    }

    let rating: 'ELITE_UNIT' | 'COHESIVE_SQUAD' | 'STRAINED_COMPANIONS' | 'FRACTURED_UNIT' = 'COHESIVE_SQUAD';
    if (finalCohesion >= 80 && membersCritical === 0) {
      rating = 'ELITE_UNIT';
    } else if (finalCohesion >= 60 && membersCritical === 0) {
      rating = 'COHESIVE_SQUAD';
    } else if (finalCohesion >= 40) {
      rating = 'STRAINED_COMPANIONS';
    } else {
      rating = 'FRACTURED_UNIT';
    }

    let summary = '';
    if (language === 'hinglish') {
      if (rating === 'ELITE_UNIT') {
        summary = `Behtareen leadership! Aapne companion squad ka vishwas ${finalCohesion}% banaye rakha aur bina kisi critical nuksaan ke sabhi ko surakshit nikala.`;
      } else if (rating === 'COHESIVE_SQUAD') {
        summary = `Acche talmel ke sath squad ko lead kiya. Cohesion ${finalCohesion}% par sthir raha aur specialist sahayog ka poora labh mila.`;
      } else {
        summary = `Crisis stress ke kaaran squad cohesion ${finalCohesion}% par gir gaya. Emergency mein sath chalne walon ki pacing aur suraksha par dhyan dena zaroori hai.`;
      }
    } else {
      if (rating === 'ELITE_UNIT') {
        summary = `Exceptional squad stewardship. Maintained ${finalCohesion}% unit cohesion with zero critical casualties, activating specialist medical and technical synergies.`;
      } else if (rating === 'COHESIVE_SQUAD') {
        summary = `Steady group leadership. Kept companions composed and responsive with ${finalCohesion}% final cohesion through disciplined directions.`;
      } else {
        summary = `Squad cohesion degraded under crisis strain to ${finalCohesion}%. Panic and rapid decisions compromised vulnerable companions.`;
      }
    }

    return {
      finalCohesion,
      minCohesion,
      membersSurvived,
      membersInjured,
      membersCritical,
      synergyEvents,
      rating,
      summary,
    };
  }, [decisions, language]);

  // ── Batch 5: City Brain Audit ──
  const cityAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        finalAccess: 70,
        finalUtility: 65,
        finalInfrastructure: 70,
        macroStatus: 'OPERATIONAL' as const,
        summary: 'No active decisions recorded.',
      };
    }

    const lastDec = decisions[decisions.length - 1];
    const finalAccess = lastDec?.cityEmergencyAccess ?? 70;
    const finalUtility = lastDec?.cityUtilityStability ?? 65;
    const macroStatus = lastDec?.cityMacroStatus ?? 'OPERATIONAL';

    let summary = '';
    if (language === 'hinglish') {
      if (macroStatus === 'OPERATIONAL') {
        summary = `Aapke niyamit faislon ne municipal evacuation routes aur 112 emergency corridors ko khula rakha. Grid aur utility sthir rahe.`;
      } else if (macroStatus === 'STRAINED') {
        summary = `Shehari infrastructure par bhari dawab darj hua. Choke points aur utility trips ne emergency access ko simit kiya.`;
      } else {
        summary = `Shehar ke sector mein gambhir disruption hua. Corridor blockade aur utility crash ne rescue teams ki pohanch ko rokk diya.`;
      }
    } else {
      if (macroStatus === 'OPERATIONAL') {
        summary = `Local actions preserved vital municipal corridors. 112 emergency access held at ${finalAccess}% and utility stability at ${finalUtility}%.`;
      } else if (macroStatus === 'STRAINED') {
        summary = `Macro municipal infrastructure operated under significant strain. Emergency response was restricted along primary transit corridors.`;
      } else {
        summary = `Severe municipal corridor disruption. Utility grid collapse and street bottlenecks impeded first-responder dispatch.`;
      }
    }

    return {
      finalAccess,
      finalUtility,
      macroStatus,
      summary,
    };
  }, [decisions, language]);

  // ── Batch 6: Multi-Disaster Chain Audit ──
  const chainAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        chainEncountered: false,
        chainTitle: 'None',
        finalSeverity: 'NONE' as const,
        contained: false,
        summary: 'No active disaster chain recorded.',
      };
    }

    let chainEncountered = false;
    let contained = false;
    let chainTitle = 'Secondary Threat';
    let finalSeverity: string = 'NONE';

    decisions.forEach((d) => {
      if (d.chainSeverity && d.chainSeverity !== 'NONE') {
        chainEncountered = true;
        finalSeverity = d.chainSeverity;
        if (d.chainTitle) chainTitle = d.chainTitle;
        if (d.chainSeverity === 'CONTAINED') contained = true;
      }
    });

    let summary = '';
    if (chainEncountered) {
      if (contained) {
        summary = language === 'hinglish'
          ? `Secondary disaster risk (${chainTitle}) ko proactive NDMA protocols dwara safaltapurvak contain kar liya gaya.`
          : `Secondary cascading hazard (${chainTitle}) was systematically neutralized before compound disaster ignition.`;
      } else {
        summary = language === 'hinglish'
          ? `Secondary hazard (${chainTitle}) active raha, jisse situation compounding aur localized risk badh gaya.`
          : `Secondary cascading threat (${chainTitle}) breached thresholds, escalating overall operational hazard.`;
      }
    } else {
      summary = language === 'hinglish'
        ? 'Aapke faislon ne secondary cascading disaster triggers ko active hone se roke rakha.'
        : 'Controlled mitigation prevented cascading secondary hazard triggers from activating.';
    }

    return {
      chainEncountered,
      chainTitle,
      finalSeverity,
      contained,
      summary,
    };
  }, [decisions, language]);

  // ── Batch 6: Alternative Timeline Audit ──
  const altAudit = useMemo(() => {
    if (decisions.length === 0) {
      return {
        totalEvaluated: 0,
        mistakesAvoided: 0,
        missedOptimal: 0,
        summary: 'No alternative timeline branches evaluated.',
      };
    }

    let mistakesAvoided = 0;
    let missedOptimal = 0;
    let totalEvaluated = 0;

    decisions.forEach((d) => {
      if (d.alternativeBranch) {
        totalEvaluated++;
        if (d.alternativeBranch.regretLevel === 'CRITICAL_MISTAKE_AVOIDED') mistakesAvoided++;
        if (d.alternativeBranch.regretLevel === 'MISSED_OPTIMAL_PATH') missedOptimal++;
      }
    });

    const summary = language === 'hinglish'
      ? `Alternative timeline analysis: Aapne ${mistakesAvoided} critical traps se bachaav kiya, aur ${missedOptimal} jagah aur behtar path chune ja sakte the.`
      : `What-If Analysis: Your decisions successfully steered away from ${mistakesAvoided} high-risk traps, with ${missedOptimal} instances where alternative NDMA protocols offered superior containment.`;

    return {
      totalEvaluated,
      mistakesAvoided,
      missedOptimal,
      summary,
    };
  }, [decisions, language]);

  // ── Batch 7: AI Director & Two-Brain Architecture Audit ──
  const aiDirectorAudit = useMemo(() => {
    const totalEvaluated = decisions.filter((d) => d.aiDirectorEvent && d.aiDirectorEvent !== 'NONE').length;
    const fallbacksUsed = decisions.filter((d) => d.aiFallbackUsed).length;
    const jevStatus = aiDirectorState.jevAvailable ? 'ONLINE (ACTIVE)' : 'FALLBACK ACTIVE (DETERMINISTIC)';
    const geminiStatus = aiDirectorState.geminiAvailable ? 'ONLINE (ACTIVE)' : 'FALLBACK ACTIVE (DETERMINISTIC)';
    const systemStatus = aiDirectorState.jevAvailable || aiDirectorState.geminiAvailable ? 'HYBRID ACTIVE' : 'DETERMINISTIC FALLBACK (SAFE)';

    let summary = '';
    if (language === 'hinglish') {
      summary = `Jev Decision Brain ne ${totalEvaluated} simulation events suggest kiye aur Gemini Creative Brain ne non-authoritative flavor diya. Sabhi safety-critical faisle NDMA protocol engine dwara 100% deterministic maaniye rahe.`;
    } else {
      summary = `Jev Decision Brain evaluated ${totalEvaluated} bounded simulation events while Gemini Creative Brain delivered atmospheric flavor. All safety-critical consequences and scoring were authoritatively determined by the deterministic NDMA engine.`;
    }

    return {
      totalEvaluated,
      fallbacksUsed,
      jevStatus,
      geminiStatus,
      systemStatus,
      summary,
    };
  }, [decisions, aiDirectorState, language]);

  // ── Batch 9: Live Adaptive Disaster Director Audit (Pre-Venue Framework) ──
  const adaptiveDirectorAudit = useMemo(() => {
    const directorTelemetry = adaptiveDirector.getTelemetry(decisions.length);
    const validCount = decisions.filter((d) => d.directorValidation === 'VALID').length;
    const cooldownBlocks =
      directorTelemetry.cooldownBlocks ||
      decisions.filter((d) => d.directorValidation === 'COOLDOWN_BLOCKED').length;
    const standbyCount = decisions.filter(
      (d) => d.directorExecutionStatus === 'STANDBY_FRAMEWORK'
    ).length;

    const sourceBreakdown = {
      deterministic: decisions.filter((d) => d.directorSource === 'DETERMINISTIC').length,
      jev: decisions.filter((d) => d.directorSource === 'JEV').length,
      fallback: decisions.filter((d) => d.directorSource === 'FALLBACK').length,
    };

    let summary = '';
    if (language === 'hinglish') {
      summary = `Adaptive Disaster Director ne Pre-Venue Standby mode mein ${decisions.length} steps evaluate kiye. ${validCount} events safely validated rahe aur ${cooldownBlocks} pacing cooldowns block hue. Live adaptive mutations 3 October venue par deploy honge.`;
    } else {
      summary = `The Adaptive Disaster Director evaluated ${decisions.length} steps under Pre-Venue Standby mode. ${validCount} candidate events were strictly validated through the deterministic registry, with ${cooldownBlocks} cooldown interventions applied. Live dynamic branching remains standing by for the 3 October 2026 venue final.`;
    }

    return {
      mode: directorTelemetry.mode,
      totalEvaluated: decisions.length,
      validCount,
      cooldownBlocks,
      standbyCount,
      sourceBreakdown,
      summary,
    };
  }, [decisions, language]);

  const scoreColor = useMemo(() => {
    if (scoreSummary.score >= 85) return 'var(--color-safe)';
    if (scoreSummary.score >= 65) return 'var(--color-warning)';
    if (scoreSummary.score >= 40) return '#ff9f40';
    return 'var(--color-danger)';
  }, [scoreSummary.score]);

  return (
    <div className={`${styles.screen} scanlines`}>
      <div className={styles.topBar}>
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtnPrimary} onClick={handlePlayAgain}>
            ↻ {ui.replayScenario}
          </button>
          <button className={styles.quickActionBtnSecondary} onClick={handleSelectNew}>
            ← {ui.selectDisaster}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title="Switch Language (English / Hinglish)"
          >
            LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
          </button>
          <OperatorBadge />
        </div>
      </div>

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Report Header */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {isGasLeak ? 'GAS LEAKAGE // DYNAMIC INCIDENT RESPONSE' : ui.simulationCompleted}
          </p>
          <h1 className={styles.title}>{ui.preparednessReport}</h1>
          {isGasLeak && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '0.2rem 0.55rem',
                borderRadius: '3px'
              }}>
                DISASTER: GAS LEAKAGE (DYNAMIC REAL-TIME SIMULATION)
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--color-fog)',
                letterSpacing: '0.05em'
              }}>
                DYNAMIC EVENTS TRIGGERED: {decisions.length}
              </span>
            </div>
          )}
        </header>

        {/* Score Block */}
        <div className={styles.scoreBlock}>
          <div className={styles.scoreLabel}>{ui.preparednessRating}</div>
          <div className={styles.scoreValue} style={{ color: scoreColor }}>
            {scoreSummary.score}
          </div>
          <div className={styles.scoreBand} style={{ color: scoreColor }}>
            {scoreSummary.band}
          </div>
          <p className={styles.scoreDesc}>{localizedScoreBandDesc}</p>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.optimalCount}/{scoreSummary.totalDecisions}
              </span>
              <span className={styles.statLabel}>{ui.optimalDecisions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.suboptimalCount}/{scoreSummary.totalDecisions}
              </span>
              <span className={styles.statLabel}>{ui.highRiskDecisions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.rawTotal} pts
              </span>
              <span className={styles.statLabel}>{ui.rawPerformanceScore}</span>
            </div>
          </div>
        </div>

        {/* Decision-by-Decision Replay */}
        {decisionReviews.length > 0 && (
          <div>
            <h2 className={styles.sectionHeading}>
              <span aria-hidden="true">📋</span>
              <span>{ui.decisionBreakdown}</span>
            </h2>

            <div className={styles.reviewList}>
              {decisionReviews.map((item) => {
                const dec = decisions[item.step - 1];
                return (
                  <div
                    key={item.nodeId + item.step}
                    className={`${styles.reviewCard} ${
                      item.isCorrect
                        ? styles.reviewCardOptimal
                        : styles.reviewCardSuboptimal
                    }`}
                  >
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewStep}>
                        {ui.stepLabel} {String(item.step).padStart(2, '0')}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {dec?.difficultyLevel !== undefined && (
                          <span className={styles.reviewDiffTag}>
                            {ui.difficultyLevel}: L{dec.difficultyLevel}
                          </span>
                        )}
                        {dec?.squadCohesion !== undefined && (
                          <span className={styles.reviewSquadTag}>
                            {ui.squadCohesion}: {dec.squadCohesion}%
                          </span>
                        )}
                        {dec?.cityMacroStatus && (
                          <span className={styles.reviewCityTag}>
                            {ui.cityStatus}: {dec.cityMacroStatus}
                          </span>
                        )}
                        {dec?.chainSeverity && dec.chainSeverity !== 'NONE' && (
                          <span className={styles.reviewChainTag}>
                            CHAIN: {dec.chainSeverity}
                          </span>
                        )}
                        {dec?.aiDirectorEvent && dec.aiDirectorEvent !== 'NONE' && (
                          <span className={styles.reviewDirectorTag}>
                            DIRECTOR: {dec.aiDirectorEvent.replace(/_/g, ' ')}
                          </span>
                        )}
                        {dec?.directorEventId && dec.directorEventId !== 'NONE' && (
                          <span className={styles.reviewDirectorTag}>
                            DIRECTOR [{ui.directorStandby}]: {dec.directorEventId.replace(/_/g, ' ')}
                          </span>
                        )}
                        {dec?.trainingBand && (
                          <span className={styles.reviewTrainTag}>
                            {ui.trainingPace}: {dec.trainingBand}
                          </span>
                        )}
                        {dec?.panicLevel !== undefined && (
                          <span className={styles.reviewStressTag}>
                            {ui.stressLevel}: {dec.panicBand || 'CONTROLLED'} ({dec.panicLevel}/100)
                          </span>
                        )}
                        {dec?.convergenceBand && (
                          <span className={styles.reviewEnvTag}>
                            RISK: {dec.convergenceBand.replace('_', ' ')}
                          </span>
                        )}
                        {dec?.hazardLevel !== undefined && (
                          <span className={styles.reviewEnvTag}>
                            {ui.hazardLevel}: {dec.hazardLevel}%
                          </span>
                        )}
                        <span
                          className={`${styles.reviewBadge} ${
                            item.isCorrect ? styles.badgeOptimal : styles.badgeSuboptimal
                          }`}
                        >
                          {item.isCorrect ? ui.optimalAction : ui.highRiskAction}
                        </span>
                      </div>
                    </div>

                    {isGasLeak && dec?.directorTriggerReason && (
                      <div style={{
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#6ee7b7',
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderLeft: '3px solid #10b981',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '2px',
                        marginBottom: '0.45rem',
                      }}>
                        ⚡ DYNAMIC EVENT REASON: {dec.directorTriggerReason}
                      </div>
                    )}

                    <div className={styles.reviewChoice}>
                      <strong>{ui.actionLabel}</strong> {item.choiceLabel}
                    </div>

                    <div className={styles.reviewConsequence}>
                      <strong>{ui.consequenceLabel}</strong> {item.consequenceText}
                    </div>

                    {dec?.stateShiftSummary && (
                      <div className={styles.reviewShift}>
                        <strong>⚡ {language === 'hinglish' ? 'Badlaav:' : 'Shift:'}</strong> {dec.stateShiftSummary}
                      </div>
                    )}

                    {dec?.propagationSummary && (
                      <div className={styles.reviewPropText}>
                        <strong>🌐 {language === 'hinglish' ? 'Aage Ka Asar:' : 'Propagation:'}</strong> {dec.propagationSummary}
                      </div>
                    )}

                    {dec?.behaviorSummary && (
                      <div className={styles.reviewBehaviorText}>
                        <strong>🧠 {language === 'hinglish' ? 'Vyavahar:' : 'Behavior:'}</strong> {dec.behaviorSummary}
                      </div>
                    )}

                    {dec?.alternativeBranch && (
                      <div className={styles.reviewAltText}>
                        <strong>🔀 {language === 'hinglish' ? 'Agar Aisa Karte:' : 'What If:'}</strong> If chosen "{dec.alternativeBranch.choiceLabel}" →{' '}
                        {dec.alternativeBranch.divergenceSummary}
                      </div>
                    )}

                    <div className={styles.reviewInsight}>
                      <div>
                        <strong>{ui.protocolLabel}</strong> {item.insight}
                      </div>
                      <div className={styles.reviewSource}>
                        {ui.sourceLabel} {item.insightSource}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Preparedness Takeaways */}
        <div>
          <h2 className={styles.sectionHeading}>
            <span aria-hidden="true">💡</span>
            <span>{ui.keyTakeaways}</span>
          </h2>
          <div className={styles.takeawayList}>
            {takeawaysToDisplay.map((takeaway, idx) => (
              <div key={idx} className={styles.takeawayItem}>
                <span className={styles.takeawayBullet}>[{idx + 1}]</span>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 3: Progressive Disclosure — Deep Incident Analysis & Simulation Audits */}
        <div className={styles.deepAuditsSection}>
          <div className={styles.deepAuditsHeader}>
            <div className={styles.deepAuditsTitleGroup}>
              <h2 className={styles.deepAuditsTitle}>
                <span aria-hidden="true">🔬</span>
                <span>{ui.deepIncidentAnalysis}</span>
              </h2>
              <p className={styles.deepAuditsSubtitle}>{ui.deepAnalysisSubtitle}</p>
            </div>
            <button
              type="button"
              className={`${styles.auditToggleBtn} ${showDeepAudits ? styles.auditToggleBtnActive : ''}`}
              onClick={() => setShowDeepAudits((prev) => !prev)}
              aria-expanded={showDeepAudits}
            >
              <span>{showDeepAudits ? '▲ ' + ui.hideAdvanced : '▼ ' + ui.showAdvanced}</span>
            </button>
          </div>

          {showDeepAudits && (
            <div className={styles.deepAuditsDrawer}>
              {/* Stress Regulation & Panic Audit */}
              <div className={styles.panicAuditBlock}>
                <div className={styles.panicAuditTop}>
                  <div className={styles.panicAuditTitle}>
                    <span aria-hidden="true">🧠</span>
                    <span>{ui.stressRegulationAudit}</span>
                  </div>
                  <span
                    className={styles.panicAuditBadge}
                    style={{
                      color:
                        panicAudit.peakBand === 'CALM'
                          ? '#39d353'
                          : panicAudit.peakBand === 'CONTROLLED'
                          ? '#68d391'
                          : panicAudit.peakBand === 'ELEVATED'
                          ? '#ecc94b'
                          : panicAudit.peakBand === 'HIGH'
                          ? '#ed8936'
                          : '#f56565',
                      borderColor:
                        panicAudit.peakBand === 'CALM'
                          ? '#39d353'
                          : panicAudit.peakBand === 'CONTROLLED'
                          ? '#68d391'
                          : panicAudit.peakBand === 'ELEVATED'
                          ? '#ecc94b'
                          : panicAudit.peakBand === 'HIGH'
                          ? '#ed8936'
                          : '#f56565',
                    }}
                  >
                    PEAK: {panicAudit.peakBand} ({panicAudit.peakPanic}/100)
                  </span>
                </div>

                <div className={styles.panicMetricsRow}>
                  <div className={styles.panicMetricCard}>
                    <span className={styles.panicMetricVal} style={{ color: '#68d391' }}>
                      {panicAudit.finalPanic}/100
                    </span>
                    <span className={styles.panicMetricLabel}>
                      {ui.finalPanicLevel}
                    </span>
                  </div>

                  <div className={styles.panicMetricCard}>
                    <span className={styles.panicMetricVal} style={{ color: '#ecc94b' }}>
                      {panicAudit.peakPanic}/100
                    </span>
                    <span className={styles.panicMetricLabel}>
                      {ui.peakPanicReached}
                    </span>
                  </div>

                  <div className={styles.panicMetricCard}>
                    <span className={styles.panicMetricVal} style={{ color: panicAudit.timerCompressions > 0 ? '#f56565' : '#39d353' }}>
                      {panicAudit.timerCompressions}
                    </span>
                    <span className={styles.panicMetricLabel}>
                      {ui.panicTimePenalties}
                    </span>
                  </div>
                </div>

                <p className={styles.panicAuditDesc}>{panicAudit.summary}</p>
              </div>

        {/* Environmental Response Audit */}
        <div className={styles.envAuditBlock}>
          <div className={styles.envAuditTop}>
            <div className={styles.envAuditTitle}>
              <span aria-hidden="true">🌐</span>
              <span>{ui.envContainmentAudit}</span>
            </div>
            <span
              className={styles.envAuditBadge}
              style={{
                color:
                  envAudit.containmentRating === 'OPTIMAL'
                    ? '#39d353'
                    : envAudit.containmentRating === 'CONTROLLED'
                    ? '#ecc94b'
                    : envAudit.containmentRating === 'COMPROMISED'
                    ? '#ed8936'
                    : '#f56565',
                borderColor:
                  envAudit.containmentRating === 'OPTIMAL'
                    ? '#39d353'
                    : envAudit.containmentRating === 'CONTROLLED'
                    ? '#ecc94b'
                    : envAudit.containmentRating === 'COMPROMISED'
                    ? '#ed8936'
                    : '#f56565',
              }}
            >
              CONTAINMENT: {envAudit.containmentRating.replace('_', ' ')}
            </span>
          </div>

          <div className={styles.envMetricsRow}>
            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#ed8936' }}>
                {envAudit.peakHazard}%
              </span>
              <span className={styles.envMetricLabel}>
                {ui.peakHazardReached}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#68d391' }}>
                {envAudit.minSafety}%
              </span>
              <span className={styles.envMetricLabel}>
                {ui.lowestSafetyIntegrity}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#38bdf8' }}>
                {envAudit.minVisibility}%
              </span>
              <span className={styles.envMetricLabel}>
                {ui.lowestVisibility}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: envAudit.escalations > 0 ? '#f56565' : '#39d353' }}>
                {envAudit.escalations}
              </span>
              <span className={styles.envMetricLabel}>
                {ui.hazardEscalations}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#39d353' }}>
                {envAudit.recoveries}
              </span>
              <span className={styles.envMetricLabel}>
                {ui.containmentRecoveries}
              </span>
            </div>
          </div>

          <p className={styles.envAuditDesc}>{envAudit.summary}</p>
        </div>

        {/* Behavior & Adaptation Audit Block */}
        <div className={styles.behaviorAuditBlock}>
          <div className={styles.behaviorAuditTop}>
            <div className={styles.behaviorAuditTitle}>
              <span aria-hidden="true">🧠</span>
              <span>{ui.behaviorAdaptationAudit}</span>
            </div>
            <span
              className={styles.behaviorAuditBadge}
              style={{
                color:
                  behaviorAudit.adaptationTrajectory === 'IMPROVED'
                    ? '#a855f7'
                    : behaviorAudit.adaptationTrajectory === 'STABILIZED'
                    ? '#38bdf8'
                    : '#f56565',
                borderColor:
                  behaviorAudit.adaptationTrajectory === 'IMPROVED'
                    ? '#a855f7'
                    : behaviorAudit.adaptationTrajectory === 'STABILIZED'
                    ? '#38bdf8'
                    : '#f56565',
              }}
            >
              TRAJECTORY: {behaviorAudit.adaptationTrajectory}
            </span>
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#c084fc' }}>
                {behaviorAudit.trainingBand}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.protocolTraining} ({behaviorAudit.finalTraining}/100)
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {behaviorAudit.instinctBand}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.instinctiveReflex} ({behaviorAudit.finalInstinct}/100)
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#f6ad55' }}>
                LVL {behaviorAudit.peakDifficulty}/5
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.peakDifficultyReached}
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#48bb78' }}>
                {behaviorAudit.strongestSignal}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.primaryBehavioralAsset}
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span
                className={styles.behaviorMetricVal}
                style={{ color: behaviorAudit.weakestSignal !== 'None' ? '#f87171' : '#a0aec0' }}
              >
                {behaviorAudit.weakestSignal}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.observedVulnerability}
              </span>
            </div>
          </div>

          <div className={styles.profileBox}>
            <div className={styles.profileHeader}>
              <span className={styles.profileLabel}>
                {ui.operatorProfile}:
              </span>
              <span className={styles.profileName}>
                {behaviorAudit.profile.replace(/_/g, ' ')}
              </span>
            </div>
            <p className={styles.profileDesc}>
              {getProfileDescription(behaviorAudit.profile, language)}
            </p>
          </div>

          <p className={styles.behaviorAuditDesc}>{behaviorAudit.summary}</p>
        </div>

        {/* NPC Survival Squad Audit */}
        <div className={styles.squadAuditBox}>
          <div className={styles.squadAuditHeader}>
            <div className={styles.squadAuditTitle}>
              <span aria-hidden="true">👥</span>
              <span>{ui.npcSquadAudit}</span>
            </div>
            <span className={styles.squadCohesionTag}>
              RATING: {squadAudit.rating.replace(/_/g, ' ')}
            </span>
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {squadAudit.finalCohesion}%
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.finalSquadCohesion}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#48bb78' }}>
                {squadAudit.membersSurvived}/3
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.squadMembersSurvived}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: squadAudit.membersInjured > 0 ? '#ecc94b' : '#39d353' }}>
                {squadAudit.membersInjured}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.injuredCompanions}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#c084fc' }}>
                {squadAudit.synergyEvents}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.specialistSynergies}
              </span>
            </div>
          </div>

          <p className={styles.behaviorAuditDesc}>{squadAudit.summary}</p>
        </div>

        {/* City Brain & Municipal Infrastructure Audit */}
        <div className={styles.cityAuditBox}>
          <div className={styles.cityAuditHeader}>
            <div className={styles.cityAuditTitle}>
              <span aria-hidden="true">🏙️</span>
              <span>{ui.cityBrainAudit}</span>
            </div>
            <span
              className={styles.cityMacroAuditTag}
              style={{
                color:
                  cityAudit.macroStatus === 'OPERATIONAL'
                    ? '#34d399'
                    : cityAudit.macroStatus === 'STRAINED'
                    ? '#ecc94b'
                    : '#f56565',
                borderColor:
                  cityAudit.macroStatus === 'OPERATIONAL'
                    ? 'rgba(16, 185, 129, 0.4)'
                    : cityAudit.macroStatus === 'STRAINED'
                    ? 'rgba(236, 201, 75, 0.4)'
                    : 'rgba(245, 101, 101, 0.5)',
                backgroundColor:
                  cityAudit.macroStatus === 'OPERATIONAL'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : cityAudit.macroStatus === 'STRAINED'
                    ? 'rgba(236, 201, 75, 0.12)'
                    : 'rgba(245, 101, 101, 0.15)',
              }}
            >
              SECTOR: {cityAudit.macroStatus}
            </span>
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#34d399' }}>
                {cityAudit.finalAccess}%
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.emergency112Access}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {cityAudit.finalUtility}%
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.municipalUtilityStability}
              </span>
            </div>
          </div>

          <p className={styles.behaviorAuditDesc}>{cityAudit.summary}</p>
        </div>

        {/* Multi-Disaster Chain Audit */}
        <div className={styles.chainAuditBox}>
          <div className={styles.chainAuditHeader}>
            <div className={styles.chainAuditTitle}>
              <span aria-hidden="true">⛓️</span>
              <span>{ui.multiDisasterAudit}</span>
            </div>
            <span
              className={styles.chainAuditBadge}
              style={{
                color: chainAudit.contained
                  ? '#39d353'
                  : chainAudit.finalSeverity === 'ACTIVE'
                  ? '#ff5252'
                  : '#ff9f43',
                borderColor: chainAudit.contained
                  ? 'rgba(57, 211, 83, 0.5)'
                  : 'rgba(255, 82, 82, 0.5)',
                backgroundColor: chainAudit.contained
                  ? 'rgba(57, 211, 83, 0.12)'
                  : 'rgba(255, 82, 82, 0.12)',
              }}
            >
              STATUS: {chainAudit.contained ? 'CONTAINED' : chainAudit.finalSeverity}
            </span>
          </div>

          <p className={styles.behaviorAuditDesc}>{chainAudit.summary}</p>
        </div>

        {/* Alternative Timeline ("What-If?") Audit */}
        <div className={styles.altAuditBox}>
          <div className={styles.altAuditHeader}>
            <div className={styles.altAuditTitle}>
              <span aria-hidden="true">🔀</span>
              <span>{ui.altTimelineAudit}</span>
            </div>
            <span className={styles.altAuditBadge}>
              BRANCHES: {altAudit.totalEvaluated} ANALYZED
            </span>
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#39d353' }}>
                {altAudit.mistakesAvoided}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Critical Traps Se Bachaav' : 'Critical Traps Avoided'}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: altAudit.missedOptimal > 0 ? '#ff9f40' : '#48bb78' }}>
                {altAudit.missedOptimal}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Missed Optimal Paths' : 'Missed Optimal Protocols'}
              </span>
            </div>
          </div>

          <p className={styles.behaviorAuditDesc}>{altAudit.summary}</p>
        </div>

        {/* AI Director & Two-Brain Architecture Audit */}
        <div className={styles.aiDirectorAuditBox}>
          <div className={styles.aiDirectorAuditHeader}>
            <div className={styles.aiDirectorAuditTitle}>
              <span aria-hidden="true">🤖</span>
              <span>{ui.aiDirectorAuditTitle}</span>
            </div>
            <span className={styles.aiDirectorStatusBadge}>
              {aiDirectorAudit.systemStatus}
            </span>
          </div>

          <div className={styles.aiSafetyFirewallBanner}>
            🛡️ <strong>{ui.safetyArchitectureFirewall}:</strong> AI suggestions and creative narrations never determine safety-critical outcomes, correct procedures, scoring, or survival status. The deterministic NDMA engine remains the sole authority.
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#63b3ed' }}>
                {aiDirectorAudit.totalEvaluated}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.stepsEvaluated}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {aiDirectorAudit.jevStatus.includes('ONLINE') ? 'ONLINE' : 'FALLBACK'}
              </span>
              <span className={styles.behaviorMetricLabel}>
                Layer 2: Jev Decision Brain
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#c084fc' }}>
                {aiDirectorAudit.geminiStatus.includes('ONLINE') ? 'ONLINE' : 'FALLBACK'}
              </span>
              <span className={styles.behaviorMetricLabel}>
                Layer 1: Gemini Creative Brain
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#39d353' }}>
                100%
              </span>
              <span className={styles.behaviorMetricLabel}>
                Safety Truth Determinism
              </span>
            </div>
          </div>

          <p className={styles.behaviorAuditDesc}>{aiDirectorAudit.summary}</p>
        </div>

        {/* Batch 9: Disaster Director Audit (Pre-Venue Framework) */}
        <div className={styles.adaptiveDirectorAuditBox}>
          <div className={styles.adaptiveDirectorAuditHeader}>
            <div className={styles.adaptiveDirectorAuditTitle}>
              <span aria-hidden="true">🎬</span>
              <span>{ui.disasterDirectorAuditTitle}</span>
            </div>
            <span className={styles.directorFrameworkModeTag}>
              MODE: {adaptiveDirectorAudit.mode} ({ui.directorStandby})
            </span>
          </div>

          <div className={styles.directorFrameworkNoticeBanner}>
            🛡️ <strong>{ui.preVenueComplianceNotice}:</strong> The Live Adaptive Disaster Director operates in Pre-Venue Standby mode. Full runtime adaptive branching and dynamic mutations are reserved for the Round 2 offline final on 3 October 2026. The deterministic simulation engine remains the sole authority for safety truth, scores, and outcomes.
          </div>

          <div className={styles.behaviorMetricsRow}>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#63b3ed' }}>
                {adaptiveDirectorAudit.totalEvaluated}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.stepsEvaluated}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#39d353' }}>
                {adaptiveDirectorAudit.validCount}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.registryValidations}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#ecc94b' }}>
                {adaptiveDirectorAudit.cooldownBlocks}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.cooldownBlocks}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#90cdf4' }}>
                {ui.directorStandby}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {ui.executionStatus}
              </span>
            </div>
          </div>

          <div className={styles.directorSourceBreakdownRow}>
            <span className={styles.sourceBreakdownTitle}>{ui.recommendationSources}:</span>
            <span className={styles.sourceTag}>
              DETERMINISTIC: <strong>{adaptiveDirectorAudit.sourceBreakdown.deterministic}</strong>
            </span>
            <span className={styles.sourceTag}>
              JEV ADVISORY: <strong>{adaptiveDirectorAudit.sourceBreakdown.jev}</strong>
            </span>
            <span className={styles.sourceTag}>
              FALLBACK: <strong>{adaptiveDirectorAudit.sourceBreakdown.fallback}</strong>
            </span>
          </div>

          <p className={styles.behaviorAuditDesc}>{adaptiveDirectorAudit.summary}</p>
        </div>
      </div>
    )}
  </div>

        {/* Emergency Helplines */}
        <div>
          <h2 className={styles.sectionHeading}>
            <span aria-hidden="true">📞</span>
            <span>{ui.emergencyHelplines}</span>
          </h2>
          <div className={styles.helplineGrid}>
            {officialHelplines.map((line, idx) => (
              <div key={idx} className={styles.helplineCard}>
                <span className={styles.helplineTitle}>{line.title}</span>
                <span className={styles.helplineNumber}>{line.number}</span>
                <span className={styles.helplinePurpose}>{line.purpose}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Disclaimer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--color-fog)',
            borderTop: 'var(--border-thin)',
            paddingTop: '1.25rem',
            lineHeight: 1.5,
          }}
        >
          {ui.educationalDisclaimer}
        </div>

        {/* Guest Persistence Prompt */}
        {!authUserId && (
          <div
            style={{
              textAlign: 'center',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-fog)',
            }}
          >
            <span>{ui.playingAsGuest} · </span>
            <Link to="/auth/signup" style={{ color: 'var(--color-white)', textDecoration: 'underline' }}>
              {ui.createAccountToSave}
            </Link>
          </div>
        )}

        {/* Footer Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handlePlayAgain}>
            {ui.replayScenario}
          </button>
          <button className={styles.btnSecondary} onClick={handleSelectNew}>
            {ui.selectDisaster}
          </button>
          {authUserId ? (
            <button
              className={styles.btnSecondary}
              onClick={() => {
                playSelect();
                resetSession();
                navigate('/profile');
              }}
            >
              {ui.operatorDossier}
            </button>
          ) : null}
          <button className={styles.btnSecondary} onClick={() => navigate('/')}>
            {ui.mainMenu}
          </button>
        </div>
      </motion.div>
    </div>
  );
}