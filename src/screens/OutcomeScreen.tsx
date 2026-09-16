// src/screens/OutcomeScreen.tsx
// End-of-disaster outcome screen stub.
// Will show survival/failure narrative when Phase 3 scenario engine is complete.

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const THEME_MAP: Record<string, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

export default function OutcomeScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();
  const theme = THEME_MAP[disasterId ?? ''] ?? '';

  return (
    <div
      className={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--theme-bg-deep, #080806)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        gap: '2rem',
        textAlign: 'center',
      }}
    >
      <motion.p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-micro)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--theme-primary, var(--color-warning))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Outcome
      </motion.p>

      <motion.h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-hero)',
          color: 'var(--color-white)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        Survived
      </motion.h2>

      <motion.p
        style={{
          maxWidth: '560px',
          color: 'var(--color-cloud)',
          lineHeight: 1.8,
          fontWeight: 300,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your outcome narrative will appear here once the scenario engine is implemented.
      </motion.p>

      <motion.button
        onClick={() => navigate(`/disaster/${disasterId}/report`)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          padding: '0.9rem 2.5rem',
          background: 'var(--theme-primary, #ff8c00)',
          color: '#000',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-small)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        View Report
      </motion.button>
    </div>
  );
}
