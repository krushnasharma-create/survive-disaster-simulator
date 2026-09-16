// src/screens/ReportScreen.tsx
// Comprehensive Emergency Preparedness Report.
// Displays calculated score, decision-by-decision review, and official NDMA takeaways.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { buildReport } from '../engine/reportBuilder';
import { getUiStrings, FIRE_HINGLISH_TAKEAWAYS, FLOOD_HINGLISH_TAKEAWAYS } from '../i18n';
import styles from './ReportScreen.module.css';

export default function ReportScreen() {
  const navigate = useNavigate();
  const { decisions, activeDisaster, resetSession, language } = useGameStore();

  const report = useMemo(() => buildReport(decisions, activeDisaster || undefined), [decisions, activeDisaster]);
  const { scoreSummary, decisionReviews, keyTakeaways, officialHelplines } = report;
  const ui = useMemo(() => getUiStrings(language), [language]);

  const handlePlayAgain = () => {
    resetSession();
    navigate(`/disaster/${activeDisaster || 'earthquake'}/intro`);
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
    const isFire = activeDisaster === 'fire' || decisions.some((d) => d.nodeId.startsWith('fire-'));
    const isFlood = activeDisaster === 'flood' || decisions.some((d) => d.nodeId.startsWith('flood-'));
    if (language === 'hinglish') {
      if (isFire) return FIRE_HINGLISH_TAKEAWAYS;
      if (isFlood) return FLOOD_HINGLISH_TAKEAWAYS;
      return ui.takeawaysList;
    }
    return keyTakeaways;
  }, [language, activeDisaster, decisions, ui, keyTakeaways]);

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
        <button
          className={styles.langToggle}
          onClick={toggleLanguage}
          title="Switch Language (English / Hinglish)"
        >
          LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
        </button>
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
          <div className={styles.scoreValue}>{scoreSummary.score}</div>
          <div className={styles.scoreBand}>{scoreSummary.band}</div>
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
              {decisionReviews.map((item) => (
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
                    <span
                      className={`${styles.reviewBadge} ${
                        item.isCorrect ? styles.badgeOptimal : styles.badgeSuboptimal
                      }`}
                    >
                      {item.isCorrect ? ui.optimalAction : ui.highRiskAction}
                    </span>
                  </div>

                  <div className={styles.reviewChoice}>
                    <strong>{ui.actionLabel}</strong> {item.choiceLabel}
                  </div>

                  <div className={styles.reviewConsequence}>
                    <strong>{ui.consequenceLabel}</strong> {item.consequenceText}
                  </div>

                  <div className={styles.reviewInsight}>
                    <div>
                      <strong>{ui.protocolLabel}</strong> {item.insight}
                    </div>
                    <div className={styles.reviewSource}>
                      {ui.sourceLabel} {item.insightSource}
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Footer Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handlePlayAgain}>
            {ui.replayScenario}
          </button>
          <button className={styles.btnSecondary} onClick={handleSelectNew}>
            {ui.selectDisaster}
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/')}>
            {ui.mainMenu}
          </button>
        </div>
      </motion.div>
    </div>
  );
}