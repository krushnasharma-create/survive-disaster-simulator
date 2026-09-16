// src/screens/ScenarioScreen.tsx
// Main gameplay screen stub. Displays current scenario node.
// Scenario engine (Phase 3) will drive this screen with real data.
// For now: placeholder indicating the engine is not yet implemented.

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DisasterType } from '../data/types';
import styles from './ScenarioScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

const LABEL_MAP: Record<DisasterType, string> = {
  earthquake: 'Earthquake — Active',
  fire: 'Structure Fire — Active',
  flood: 'Flash Flood — Active',
};

export default function ScenarioScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();
  const theme = THEME_MAP[(disasterId as DisasterType) ?? 'earthquake'] ?? '';
  const label = LABEL_MAP[(disasterId as DisasterType) ?? 'earthquake'] ?? '';

  return (
    <div className={`${styles.screen} ${theme}`}>
      {/* Minimal HUD */}
      <div className={styles.hud}>
        <span className={styles.hudDisaster}>{label}</span>
        <span className={styles.hudNode}>Node 01 / 06</span>
      </div>

      <div className={styles.main}>
        <motion.p
          className={styles.situation}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          The scenario engine is not yet implemented. This screen will render the
          active situation and player decision choices when Phase 3 is complete.
        </motion.p>

        <div>
          <p className={styles.decisionLabel}>What do you do?</p>
          <div className={styles.placeholder}>
            Decision choices load here — Scenario Engine (Phase 3)
          </div>
        </div>

        <motion.button
          onClick={() => navigate(`/disaster/${disasterId}/report`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-micro)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-mist)',
            padding: '0.5rem 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Skip to report →
        </motion.button>
      </div>
    </div>
  );
}
