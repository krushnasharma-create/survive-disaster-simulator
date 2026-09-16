// src/screens/ReportScreen.tsx
// Preparedness report screen. Shows score band and decision review.
// Score data will come from Zustand store in Phase 7.
// Currently shows a structural shell with placeholder score.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import styles from './ReportScreen.module.css';

function getScoreBand(score: number): string {
  if (score >= 85) return 'Ready to Respond';
  if (score >= 65) return 'Good Awareness';
  if (score >= 40) return 'Needs Preparation';
  return 'Critically Unprepared';
}

export default function ReportScreen() {
  const navigate = useNavigate();
  const { totalScore, activeDisaster, resetSession } = useGameStore((s) => ({
    totalScore: s.totalScore,
    activeDisaster: s.activeDisaster,
    resetSession: s.resetSession,
  }));

  // Shell phase: show 0 score until engine provides real data
  const displayScore = totalScore;
  const band = getScoreBand(displayScore);

  const handlePlayAgain = () => {
    resetSession();
    navigate(`/disaster/${activeDisaster}/intro`);
  };

  const handleSelectNew = () => {
    resetSession();
    navigate('/select');
  };

  return (
    <div className={styles.screen}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className={styles.eyebrow}>Simulation Complete</p>
        <h1 className={styles.title}>Preparedness Report</h1>
      </motion.div>

      <motion.div
        className={styles.scoreBlock}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className={styles.scoreBand}>Preparedness Score</p>
        <p className={styles.scoreValue}>{displayScore}</p>
        <p className={styles.scoreBand}>{band}</p>
      </motion.div>

      <motion.div
        className={styles.placeholder}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Decision-by-decision review and key takeaways will appear here
        once the scenario engine is implemented (Phase 3).
        {'\n\n'}
        Source: NDMA / SACHET / Government of India 112 ERSS
      </motion.div>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {activeDisaster && (
          <button className={styles.btnPrimary} onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
        <button className={styles.btnSecondary} onClick={handleSelectNew}>
          Select Disaster
        </button>
      </motion.div>
    </div>
  );
}
