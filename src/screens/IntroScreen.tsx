// src/screens/IntroScreen.tsx
// Cinematic Main Menu / Game Entry screen.
// Established in the master dark/cinematic disaster-survival aesthetic.

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getUiStrings } from '../i18n';
import styles from './IntroScreen.module.css';

export default function IntroScreen() {
  const navigate = useNavigate();
  const { markIntroSeen, resetSession, language, setLanguage } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [screenShake, setScreenShake] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const ui = useMemo(() => getUiStrings(language), [language]);

  const handleEnterSimulation = () => {
    markIntroSeen();
    navigate('/select');
  };

  const handleHowToPlay = () => {
    navigate('/how-to-play');
  };

  const handleReset = () => {
    resetSession();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      {/* Top HUD Bar */}
      <header className={styles.topHud}>
        <div className={styles.hudStatus}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>SIMULATION CONSOLE ACTIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title="Switch Language (English / Hinglish)"
          >
            LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
          </button>
          <span>CODE: GD-02 · VER 1.0</span>
        </div>
      </header>

      {/* Center Cinematic Content */}
      <div className={styles.content}>
        {/* Emergency Alert Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.alert}>
            ⚠ DISASTER RESPONSE SIMULATION
          </span>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          SURVIVE
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Disaster Response Simulator
        </motion.p>

        <motion.div
          className={styles.divider}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Tagline */}
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          &ldquo;Your decisions determine what happens next.&rdquo;
        </motion.p>

        {/* Action Menu */}
        <motion.div
          className={styles.menuActions}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button className={styles.primaryBtn} onClick={handleEnterSimulation}>
            {ui.enterSimulation}
          </button>
          <button className={styles.secondaryBtn} onClick={handleHowToPlay}>
            {ui.howToPlay}
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setShowSettings(true)}
          >
            {ui.settings}
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        Hack 2 Ignite · GD-02 · Emergency Preparedness & Response
      </footer>

      {/* Minimal Cinematic Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className={styles.modalBackdrop} onClick={() => setShowSettings(false)}>
            <motion.div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.modalHeader}>
                <span className={styles.modalTitle}>Simulation Settings</span>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  ✕
                </button>
              </div>

              <div className={styles.settingRow}>
                <span>Screen Visual Tremors</span>
                <button
                  className={`${styles.toggleBtn} ${screenShake ? styles.toggleBtnActive : ''}`}
                  onClick={() => setScreenShake(!screenShake)}
                >
                  {screenShake ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className={styles.settingRow}>
                <span>High Contrast HUD</span>
                <button
                  className={`${styles.toggleBtn} ${highContrast ? styles.toggleBtnActive : ''}`}
                  onClick={() => setHighContrast(!highContrast)}
                >
                  {highContrast ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className={styles.settingRow}>
                <span>Simulation Session State</span>
                <button className={styles.toggleBtn} onClick={handleReset}>
                  {resetNotice ? 'CLEARED' : 'RESET PROGRESS'}
                </button>
              </div>

              <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <button
                  className={styles.secondaryBtn}
                  style={{ width: '100%' }}
                  onClick={() => setShowSettings(false)}
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}