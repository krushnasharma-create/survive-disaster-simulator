// src/screens/HowToPlayScreen.tsx
// Explains the simulation mechanics, core feedback loop, and preparedness philosophy.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getUiStrings } from '../i18n';
import styles from './HowToPlayScreen.module.css';

export default function HowToPlayScreen() {
  const navigate = useNavigate();
  const { language, setLanguage } = useGameStore();
  const ui = getUiStrings(language);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Top Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Field Briefing · Simulation Mechanics</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className={styles.langToggle}
              onClick={toggleLanguage}
              title="Switch Language (English / Hinglish)"
            >
              LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
            </button>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
              ← {ui.mainMenu}
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.title}>How to Play</h1>
          <p className={styles.subtitle}>
            SURVIVE is an interactive emergency simulation. You are placed directly inside real-world disaster scenarios where your decisions determine consequences, survival outcomes, and preparedness ratings.
          </p>
        </div>

        {/* Core Loop Card */}
        <div className={styles.loopCard}>
          <span className={styles.loopHeading}>The Core Simulation Loop</span>
          <div className={styles.loopFlow}>
            <span className={styles.loopStep}>1. Scenario</span>
            <span className={styles.loopArrow}>→</span>
            <span className={styles.loopStep}>2. Decision</span>
            <span className={styles.loopArrow}>→</span>
            <span className={styles.loopStep}>3. Consequence</span>
            <span className={styles.loopArrow}>→</span>
            <span className={styles.loopStep}>4. New Situation</span>
            <span className={styles.loopArrow}>→</span>
            <span className={styles.loopStep}>5. Score</span>
          </div>
        </div>

        {/* Principles Grid */}
        <div className={styles.principlesGrid}>
          <div className={styles.principleItem}>
            <span className={styles.principleNum}>01 // REALISTIC CRISIS</span>
            <span className={styles.principleTitle}>Grounded Scenarios</span>
            <p className={styles.principleDesc}>
              Every hazard, environment, and choice is calibrated against authoritative public safety principles (NDMA, SACHET, and 112 ERSS).
            </p>
          </div>

          <div className={styles.principleItem}>
            <span className={styles.principleNum}>02 // TIME PRESSURE</span>
            <span className={styles.principleTitle}>Time-Critical Responses</span>
            <p className={styles.principleDesc}>
              Earthquakes and sudden hazards strike with seconds to react. On timed decisions, hesitation leads to automatic fallbacks and lost survival advantage.
            </p>
          </div>

          <div className={styles.principleItem}>
            <span className={styles.principleNum}>03 // DYNAMIC BRANCHING</span>
            <span className={styles.principleTitle}>Real Consequences</span>
            <p className={styles.principleDesc}>
              Poor choices create complicating hazards, injuries, or entrapments rather than immediate game-overs. You must deal with what you choose.
            </p>
          </div>

          <div className={styles.principleItem}>
            <span className={styles.principleNum}>04 // ACTIONABLE AUDIT</span>
            <span className={styles.principleTitle}>Preparedness Score</span>
            <p className={styles.principleDesc}>
              Review a step-by-step audit of all actions taken, gain official NDMA protocol insights, and discover how to protect yourself in actual emergencies.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/select')}
          >
            Enter Simulation →
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => navigate('/')}
          >
            Return to Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}