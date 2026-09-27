// src/components/AuthGuard.tsx
// Route wrapper that checks for an active authenticated session.
// Redirects unauthenticated visitors to /auth/login while preserving intended target.

import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authUserId = useGameStore((state) => state.authUserId);
  const isAuthLoading = useGameStore((state) => state.isAuthLoading);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthLoading && !authUserId && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate('/auth/login', { state: { from: location }, replace: true });
    }
  }, [isAuthLoading, authUserId, navigate, location]);

  if (isAuthLoading && !authUserId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-ash)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-micro)',
        letterSpacing: '0.2em',
        color: 'var(--color-fog)',
      }}>
        VERIFYING OPERATOR CLEARANCE...
      </div>
    );
  }

  if (!authUserId) {
    return null;
  }

  return <>{children}</>;
}
