// src/components/OperatorBadge.tsx
// Persistent, standardized operator status badge and navigation link.
// Renders across safe non-game screens to give authenticated users seamless access
// to their Profile / Operator Dossier, and guests a clear entry point to log in.

import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { playHover, playSelect } from '../utils/audio';
import styles from './OperatorBadge.module.css';

interface OperatorBadgeProps {
  className?: string;
  onClickCustom?: () => void;
}

export function OperatorBadge({ className, onClickCustom }: OperatorBadgeProps) {
  const navigate = useNavigate();
  const authUserId = useGameStore((state) => state.authUserId);

  const handleClick = () => {
    playSelect();
    if (onClickCustom) {
      onClickCustom();
      return;
    }
    if (authUserId) {
      navigate('/profile');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <button
      type="button"
      className={`${styles.badge} ${authUserId ? styles.online : styles.offline} ${className || ''}`}
      onClick={handleClick}
      onMouseEnter={() => playHover()}
      title={authUserId ? 'View Operator Dossier' : 'Operator Login'}
      aria-label={authUserId ? 'View Operator Dossier' : 'Operator Login'}
    >
      {authUserId && <span className={styles.statusDot} aria-hidden="true" />}
      <span>{authUserId ? 'OPERATOR: ONLINE' : 'LOGIN'}</span>
    </button>
  );
}

export default OperatorBadge;
