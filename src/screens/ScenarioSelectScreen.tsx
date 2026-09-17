// src/screens/ScenarioSelectScreen.tsx
// Cinematic Scenario Selection Console.
// Allows choosing between Modern Urban Simulation and Historical Incident Reconstruction.
// Ensures historical scenarios are clearly marked as Coming Soon without breaking gameplay.

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenariosForDisaster, type ScenarioCatalogueItem } from '../data';
import { getUiStrings } from '../i18n';
import { playHover, playSelect } from '../utils/audio';
import type { DisasterType } from '../data/types';
import styles from './ScenarioSelectScreen.module.css';

const THEME_ACCENTS: Record<DisasterType, { accent: string; glow: string; name: string }> = {
  earthquake: {
    accent: '#e8a020',
    glow: 'rgba(232, 160, 32, 0.2)',
    name: 'Earthquake',
  },
  fire: {
    accent: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.2)',
    name: 'Structure Fire',
  },
  flood: {
    accent: '#00a8cc',
    glow: 'rgba(0, 168, 204, 0.2)',
    name: 'Flash Flood',
  },
};

export default function ScenarioSelectScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();
  const { selectScenario, language, setLanguage } = useGameStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeDisaster = (disasterId as DisasterType) || 'earthquake';
  const theme = THEME_ACCENTS[activeDisaster] || THEME_ACCENTS.earthquake;
  const scenarios = useMemo(() => getScenariosForDisaster(activeDisaster), [activeDisaster]);
  const ui = useMemo(() => getUiStrings(language), [language]);

  const toggleLanguage = () => {
    playSelect();
    setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  const handleSelectScenario = (item: ScenarioCatalogueItem) => {
    playSelect();
    if (item.status === 'playable') {
      selectScenario(item.id, activeDisaster);
      navigate(`/disaster/${activeDisaster}/intro?scenario=${item.id}`);
    } else {
      setToastMessage(
        language === 'hinglish'
          ? `NOTICE: ${item.title} (${item.date || ''}) historical simulation abhi development mein hai. Kripya Modern Urban scenario chunein.`
          : `ARCHIVE NOTICE: ${item.title} (${item.date || ''}) is currently in development (Phase 7). Please launch the Modern Urban simulation.`
      );
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      {/* Top HUD */}
      <header className={styles.topHud}>
        <span>SIMULATION ARCHIVE // {theme.name.toUpperCase()} SCENARIOS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title="Switch Language (English / Hinglish)"
          >
            LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
          </button>
          <button
            className={styles.backBtn}
            onClick={() => {
              playSelect();
              navigate('/select');
            }}
            onMouseEnter={() => playHover()}
          >
            ← {ui.backToDisasters}
          </button>
        </div>
      </header>

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className={styles.eyebrow}>{ui.chooseScenario}</p>
        <h1 className={styles.heading}>{ui.selectScenarioTitle}</h1>
      </motion.div>

      {/* Scenario Grid (2 Columns: Modern vs Historical) */}
      <div className={styles.grid}>
        {scenarios.map((sc, index) => {
          const isPlayable = sc.status === 'playable';
          const isHistorical = sc.category === 'historical';

          return (
            <motion.div
              key={sc.id}
              className={`${styles.card} ${
                isPlayable ? styles.cardPlayable : styles.cardLocked
              }`}
              onClick={() => handleSelectScenario(sc)}
              onMouseEnter={() => playHover()}
              style={
                {
                  '--card-accent': theme.accent,
                  '--card-glow': theme.glow,
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectScenario(sc);
                }
              }}
              aria-label={`Scenario: ${sc.title} (${sc.status})`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardCode}>{sc.code}</span>
                <span
                  className={`${styles.statusBadge} ${
                    isPlayable ? styles.statusActive : styles.statusDev
                  }`}
                >
                  {isPlayable ? '● PLAYABLE' : `○ ${ui.comingSoon}`}
                </span>
              </div>

              <div>
                <span className={styles.cardTag}>
                  {isHistorical ? ui.historicalSimulation : ui.modernSimulation}
                </span>
                <h2 className={styles.cardTitle}>{sc.title}</h2>
                <span className={styles.cardSubtitle}>{sc.subtitle}</span>
              </div>

              {isHistorical && (sc.location || sc.date) && (
                <div className={styles.metaBox}>
                  {sc.location && (
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Location:</span>
                      <span className={styles.metaValue}>{sc.location}</span>
                    </div>
                  )}
                  {sc.date && (
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Date:</span>
                      <span className={styles.metaValue}>{sc.date}</span>
                    </div>
                  )}
                </div>
              )}

              <p className={styles.cardDesc}>{sc.description}</p>

              <div className={styles.cardAction}>
                {isPlayable ? (
                  <>
                    <span className={styles.actionLaunch}>{ui.launchScenario}</span>
                    <span className={styles.actionLaunch}>→</span>
                  </>
                ) : (
                  <>
                    <span className={styles.actionLocked}>{ui.comingSoon}</span>
                    <span className={styles.actionLocked}>{ui.locked}</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* In-theme Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}