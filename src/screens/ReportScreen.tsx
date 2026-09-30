// src/screens/ReportScreen.tsx
// Comprehensive Emergency Preparedness Report.
// Displays calculated score, decision-by-decision review, and official NDMA takeaways.

import { useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { buildReport } from '../engine/reportBuilder';
import { getUiStrings, FIRE_HINGLISH_TAKEAWAYS, FLOOD_HINGLISH_TAKEAWAYS } from '../i18n';
import { finalizeRun } from '../services/gamePersistenceService';
import { OperatorBadge } from '../components/OperatorBadge';
import {
  getBehavioralBand,
  getBehaviorProfile,
  getProfileDescription,
} from '../engine/simulationState';
import { playSelect } from '../utils/audio';
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
  } = useGameStore();

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

  const takeawaysToDisplay = useMemo(() => {
    const isFire = activeDisaster === 'fire' || decisions.some((d) => d.nodeId.startsWith('fire-') || d.nodeId.startsWith('frc-'));
    const isFlood = activeDisaster === 'flood' || decisions.some((d) => d.nodeId.startsWith('flood-') || d.nodeId.startsWith('fls-'));
    if (language === 'hinglish') {
      if (isFire) return FIRE_HINGLISH_TAKEAWAYS;
      if (isFlood) return FLOOD_HINGLISH_TAKEAWAYS;
      return ui.takeawaysList;
    }
    return keyTakeaways;
  }, [language, activeDisaster, decisions, ui, keyTakeaways]);

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
          <p className={styles.eyebrow}>{ui.simulationCompleted}</p>
          <h1 className={styles.title}>{ui.preparednessReport}</h1>
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

        {/* Stress Regulation & Panic Audit */}
        <div className={styles.panicAuditBlock}>
          <div className={styles.panicAuditTop}>
            <div className={styles.panicAuditTitle}>
              <span aria-hidden="true">🧠</span>
              <span>{language === 'hinglish' ? 'Tanaav Niyantran & Panic Audit' : 'Stress Regulation & Panic Audit'}</span>
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
                {language === 'hinglish' ? 'Antim Panic Level' : 'Final Panic Level'}
              </span>
            </div>

            <div className={styles.panicMetricCard}>
              <span className={styles.panicMetricVal} style={{ color: '#ecc94b' }}>
                {panicAudit.peakPanic}/100
              </span>
              <span className={styles.panicMetricLabel}>
                {language === 'hinglish' ? 'Peak Panic Spikes' : 'Peak Panic Reached'}
              </span>
            </div>

            <div className={styles.panicMetricCard}>
              <span className={styles.panicMetricVal} style={{ color: panicAudit.timerCompressions > 0 ? '#f56565' : '#39d353' }}>
                {panicAudit.timerCompressions}
              </span>
              <span className={styles.panicMetricLabel}>
                {language === 'hinglish' ? 'Time Pressure Nodes' : 'Panic Time Penalties'}
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
              <span>
                {language === 'hinglish'
                  ? 'Paryavaran Niyantran & Hazard Audit'
                  : 'Environmental Containment & Hazard Audit'}
              </span>
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
                {language === 'hinglish' ? 'Peak Hazard Level' : 'Peak Hazard Reached'}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#68d391' }}>
                {envAudit.minSafety}%
              </span>
              <span className={styles.envMetricLabel}>
                {language === 'hinglish' ? 'Min Safety Integrity' : 'Lowest Safety Integrity'}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#38bdf8' }}>
                {envAudit.minVisibility}%
              </span>
              <span className={styles.envMetricLabel}>
                {language === 'hinglish' ? 'Min Visibility' : 'Lowest Visibility'}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: envAudit.escalations > 0 ? '#f56565' : '#39d353' }}>
                {envAudit.escalations}
              </span>
              <span className={styles.envMetricLabel}>
                {language === 'hinglish' ? 'Hazard Escalations' : 'Hazard Escalations'}
              </span>
            </div>

            <div className={styles.envMetricCard}>
              <span className={styles.envMetricVal} style={{ color: '#39d353' }}>
                {envAudit.recoveries}
              </span>
              <span className={styles.envMetricLabel}>
                {language === 'hinglish' ? 'Containment Actions' : 'Containment Recoveries'}
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
              <span>
                {language === 'hinglish'
                  ? 'Vyavahar aur Anukulan Audit // Instinct vs Training'
                  : 'Behavior & Adaptation Audit // Instinct vs Training'}
              </span>
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
                {language === 'hinglish' ? 'Training Score' : 'Protocol Training'} ({behaviorAudit.finalTraining}/100)
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {behaviorAudit.instinctBand}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Instinctive Reflex' : 'Instinctive Reflex'} ({behaviorAudit.finalInstinct}/100)
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#f6ad55' }}>
                LVL {behaviorAudit.peakDifficulty}/5
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Peak Difficulty' : 'Peak Difficulty Reached'}
              </span>
            </div>

            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#48bb78' }}>
                {behaviorAudit.strongestSignal}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Sabse Majboot Signal' : 'Primary Behavioral Asset'}
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
                {language === 'hinglish' ? 'Dhyan Dene Yogya Signal' : 'Observed Vulnerability'}
              </span>
            </div>
          </div>

          <div className={styles.profileBox}>
            <div className={styles.profileHeader}>
              <span className={styles.profileLabel}>
                {language === 'hinglish' ? 'OPERATOR PROFILE' : 'OPERATOR SURVIVAL PROFILE'}:
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
              <span>NPC SURVIVAL SQUAD & COMPANION AUDIT</span>
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
                {language === 'hinglish' ? 'Final Cohesion' : 'Final Squad Cohesion'}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#48bb78' }}>
                {squadAudit.membersSurvived}/3
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Survivors' : 'Squad Members Survived'}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: squadAudit.membersInjured > 0 ? '#ecc94b' : '#39d353' }}>
                {squadAudit.membersInjured}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Injured' : 'Injured Companions'}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#c084fc' }}>
                {squadAudit.synergyEvents}
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Synergy Bonus' : 'Specialist Synergies'}
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
              <span>CITY BRAIN & MUNICIPAL INFRASTRUCTURE AUDIT</span>
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
                {language === 'hinglish' ? '112 Emergency Access' : '112 Emergency Access'}
              </span>
            </div>
            <div className={styles.behaviorMetricCard}>
              <span className={styles.behaviorMetricVal} style={{ color: '#38bdf8' }}>
                {cityAudit.finalUtility}%
              </span>
              <span className={styles.behaviorMetricLabel}>
                {language === 'hinglish' ? 'Utility Stability' : 'Municipal Utility Stability'}
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
              <span>MULTI-DISASTER CHAIN & SECONDARY HAZARDS</span>
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
              <span>ALTERNATIVE TIMELINES & WHAT-IF ANALYSIS</span>
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
                            DIFF: L{dec.difficultyLevel}
                          </span>
                        )}
                        {dec?.squadCohesion !== undefined && (
                          <span className={styles.reviewSquadTag}>
                            SQUAD: {dec.squadCohesion}%
                          </span>
                        )}
                        {dec?.cityMacroStatus && (
                          <span className={styles.reviewCityTag}>
                            CITY: {dec.cityMacroStatus}
                          </span>
                        )}
                        {dec?.chainSeverity && dec.chainSeverity !== 'NONE' && (
                          <span className={styles.reviewChainTag}>
                            CHAIN: {dec.chainSeverity}
                          </span>
                        )}
                        {dec?.trainingBand && (
                          <span className={styles.reviewTrainTag}>
                            TRAIN: {dec.trainingBand}
                          </span>
                        )}
                        {dec?.panicLevel !== undefined && (
                          <span className={styles.reviewStressTag}>
                            STRESS: {dec.panicBand || 'CONTROLLED'} ({dec.panicLevel}/100)
                          </span>
                        )}
                        {dec?.convergenceBand && (
                          <span className={styles.reviewEnvTag}>
                            RISK: {dec.convergenceBand.replace('_', ' ')}
                          </span>
                        )}
                        {dec?.hazardLevel !== undefined && (
                          <span className={styles.reviewEnvTag}>
                            HAZARD: {dec.hazardLevel}%
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

                    <div className={styles.reviewChoice}>
                      <strong>{ui.actionLabel}</strong> {item.choiceLabel}
                    </div>

                    <div className={styles.reviewConsequence}>
                      <strong>{ui.consequenceLabel}</strong> {item.consequenceText}
                    </div>

                    {dec?.stateShiftSummary && (
                      <div className={styles.reviewShift}>
                        <strong>⚡ Shift:</strong> {dec.stateShiftSummary}
                      </div>
                    )}

                    {dec?.propagationSummary && (
                      <div className={styles.reviewPropText}>
                        <strong>🌐 Propagation:</strong> {dec.propagationSummary}
                      </div>
                    )}

                    {dec?.behaviorSummary && (
                      <div className={styles.reviewBehaviorText}>
                        <strong>🧠 Behavior:</strong> {dec.behaviorSummary}
                      </div>
                    )}

                    {dec?.alternativeBranch && (
                      <div className={styles.reviewAltText}>
                        <strong>🔀 What If:</strong> If chosen "{dec.alternativeBranch.choiceLabel}" →{' '}
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
            <span>PLAYING AS GUEST · </span>
            <Link to="/auth/signup" style={{ color: 'var(--color-white)', textDecoration: 'underline' }}>
              CREATE OPERATOR ACCOUNT TO SAVE SIMULATION RECORDS
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
              OPERATOR DOSSIER
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