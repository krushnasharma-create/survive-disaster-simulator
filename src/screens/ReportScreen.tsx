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