// src/screens/DisasterSelect.tsx
// Atmospheric disaster selection console.
// Earthquake is PLAYABLE and launches the full gameplay slice.
// Fire and Flood are clearly designated as IN DEVELOPMENT for Phase 4.

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getUiStrings } from '../i18n';
import type { DisasterType } from '../data/types';
import styles from './DisasterSelect.module.css';

interface DisasterScenarioItem {
  id: DisasterType;
  code: string;
  icon: string;
  title: string;
  tag: string;
  description: string;
  accent: string;
  glow: string;
  status: 'playable' | 'development';
}

const SCENARIO_LIST: DisasterScenarioItem[] = [
  {
    id: 'earthquake',
    code: 'SCN-EQ-01',
    icon: '🌍',
    title: 'Earthquake',
    tag: 'Urban Apartment · 11:47 AM',
    description:
      'The concrete floor lurches beneath you. Navigate structural shaking, post-tremor gas leaks, stairwell aftershocks, and facade hazard clearance.',
    accent: '#e8a020',
    glow: 'rgba(232, 160, 32, 0.2)',
    status: 'playable',
  },
  {
    id: 'fire',
    code: 'SCN-FR-02',
    icon: '🔥',
    title: 'Structure Fire',
    tag: 'Residential Building · 02:13 AM',
    description:
      'Smoke alarms trigger at midnight. Thermal door evaluation, staying below the toxic smoke ceiling, and compartmentalization evacuation.',
    accent: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.2)',
    status: 'playable',
  },
  {
    id: 'flood',
    code: 'SCN-FL-03',
    icon: '🌊',
    title: 'Flash Flood',
    tag: 'Low-Lying Colony · Monsoon Alert',
    description:
      'Rapidly rising urban floodwaters. Power grid isolation, vertical refuge protocols, and avoiding deceptive moving water hazards.',
    accent: '#00a8cc',
    glow: 'rgba(0, 168, 204, 0.2)',
    status: 'development',
  },
];

export default function DisasterSelect() {
  const navigate = useNavigate();
  const { selectDisaster, language, setLanguage } = useGameStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ui = useMemo(() => getUiStrings(language), [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  const handleSelect = (item: DisasterScenarioItem) => {
    if (item.status === 'playable') {
      selectDisaster(item.id);
      navigate(`/disaster/${item.id}/intro`);
    } else {
      setToastMessage(
        language === 'hinglish'
          ? `NOTICE: ${item.title} scenario abhi taiyyari mein hai. Kripya Earthquake simulation chunein.`
          : `ARCHIVE NOTICE: ${item.title} scenario is currently in development (Phase 4). Please launch the Earthquake simulation.`
      );
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      {/* Top HUD */}
      <header className={styles.topHud}>
        <span>SIMULATION ARCHIVE // SCENARIO SELECTION</span>
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

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className={styles.eyebrow}>{ui.chooseScenario}</p>
        <h1 className={styles.heading}>{ui.selectDisaster}</h1>
      </motion.div>

      {/* Scenario Grid */}
      <div className={styles.grid}>
        {SCENARIO_LIST.map((d, index) => {
          const isPlayable = d.status === 'playable';

          return (
            <motion.div
              key={d.id}
              className={`${styles.card} ${
                isPlayable ? styles.cardPlayable : styles.cardLocked
              }`}
              onClick={() => handleSelect(d)}
              style={
                {
                  '--card-accent': d.accent,
                  '--card-glow': d.glow,
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(d);
                }
              }}
              aria-label={`Scenario: ${d.title} (${d.status})`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardCode}>{d.code}</span>
                <span
                  className={`${styles.statusBadge} ${
                    isPlayable ? styles.statusActive : styles.statusDev
                  }`}
                >
                  {isPlayable ? '● PLAYABLE' : '○ IN DEVELOPMENT'}
                </span>
              </div>

              <span className={styles.cardIcon} aria-hidden="true">
                {d.icon}
              </span>
              <div>
                <h2 className={styles.cardTitle}>{d.title}</h2>
                <span className={styles.cardTag}>{d.tag}</span>
              </div>

              <p className={styles.cardDesc}>{d.description}</p>

              <div className={styles.cardAction}>
                {isPlayable ? (
                  <>
                    <span className={styles.actionLaunch}>{ui.launchScenario}</span>
                    <span className={styles.actionLaunch}>→</span>
                  </>
                ) : (
                  <>
                    <span className={styles.actionLocked}>{ui.inDevelopment}</span>
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