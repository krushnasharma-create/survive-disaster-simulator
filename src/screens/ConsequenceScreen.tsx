// src/screens/ConsequenceScreen.tsx
// Consequence display stub — shown after a player decision.
// Phase 3 (scenario engine) will populate real consequence content.

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const THEME_MAP: Record<string, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

export default function ConsequenceScreen() {
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
        transition={{ duration: 0.6 }}
      >
        Consequence
      </motion.p>

      <motion.p
        style={{
          maxWidth: '600px',
          fontSize: '1.1rem',
          color: 'var(--color-cloud)',
          lineHeight: 1.8,
          fontWeight: 300,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Consequence narrative will appear here after Phase 3 implementation.
      </motion.p>

      <motion.button
        onClick={() => navigate(`/disaster/${disasterId}/scenario`)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
        Continue
      </motion.button>
    </div>
  );
}
