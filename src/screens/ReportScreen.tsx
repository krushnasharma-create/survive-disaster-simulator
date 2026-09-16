// src/screens/ReportScreen.tsx
// Comprehensive Emergency Preparedness Report.
// Displays calculated score, decision-by-decision review, and official NDMA takeaways.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { buildReport } from '../engine/reportBuilder';
import styles from './ReportScreen.module.css';

export default function ReportScreen() {
  const navigate = useNavigate();
  const { decisions, activeDisaster, resetSession } = useGameStore();

  const report = useMemo(() => buildReport(decisions), [decisions]);
  const { scoreSummary, decisionReviews, keyTakeaways, officialHelplines } = report;

  const handlePlayAgain = () => {
    resetSession();
    navigate(`/disaster/${activeDisaster || 'earthquake'}/intro`);
  };

  const handleSelectNew = () => {
    resetSession();
    navigate('/select');
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Report Header */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>Simulation Completed · Official Evaluation</p>
          <h1 className={styles.title}>Preparedness Report</h1>
        </header>

        {/* Score Block */}
        <div className={styles.scoreBlock}>
          <div className={styles.scoreLabel}>Final Preparedness Rating</div>
          <div className={styles.scoreValue}>{scoreSummary.score}</div>
          <div className={styles.scoreBand}>{scoreSummary.band}</div>
          <p className={styles.scoreDesc}>{scoreSummary.bandDescription}</p>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.optimalCount}/{scoreSummary.totalDecisions}
              </span>
              <span className={styles.statLabel}>Optimal Decisions</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.suboptimalCount}/{scoreSummary.totalDecisions}
              </span>
              <span className={styles.statLabel}>High-Risk Decisions</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {scoreSummary.rawTotal} pts
              </span>
              <span className={styles.statLabel}>Raw Performance Score</span>
            </div>
          </div>
        </div>

        {/* Decision-by-Decision Replay */}
        {decisionReviews.length > 0 && (
          <div>
            <h2 className={styles.sectionHeading}>
              <span aria-hidden="true">📋</span>
              <span>Decision Breakdown & Feedback</span>
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
                    <span className={styles.reviewStep}>Step {String(item.step).padStart(2, '0')}</span>
                    <span
                      className={`${styles.reviewBadge} ${
                        item.isCorrect ? styles.badgeOptimal : styles.badgeSuboptimal
                      }`}
                    >
                      {item.isCorrect ? '✓ Life-Safety Optimal' : '⚠ High-Risk Hazard'}
                    </span>
                  </div>

                  <div className={styles.reviewChoice}>
                    <strong>Action:</strong> {item.choiceLabel}
                  </div>

                  <div className={styles.reviewConsequence}>
                    <strong>Consequence:</strong> {item.consequenceText}
                  </div>

                  <div className={styles.reviewInsight}>
                    <div>
                      <strong>NDMA Protocol:</strong> {item.insight}
                    </div>
                    <div className={styles.reviewSource}>
                      Source: {item.insightSource}
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
            <span>NDMA Life-Safety Rules (Takeaways)</span>
          </h2>
          <div className={styles.takeawayList}>
            {keyTakeaways.map((takeaway, idx) => (
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
            <span>Emergency Support Services (India)</span>
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
          Educational Simulation: This experience is designed for general emergency awareness based on public safety principles from NDMA and 112 ERSS. It does not substitute for on-ground directives from local disaster management authorities or certified safety training.
        </div>

        {/* Footer Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handlePlayAgain}>
            Replay Earthquake Scenario
          </button>
          <button className={styles.btnSecondary} onClick={handleSelectNew}>
            Select Another Disaster
          </button>
        </div>
      </motion.div>
    </div>
  );
}