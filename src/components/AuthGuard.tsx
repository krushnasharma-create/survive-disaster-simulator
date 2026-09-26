// src/components/AuthGuard.tsx
// Route wrapper that checks for an active authenticated session.
// Redirects unauthenticated visitors to /auth/login while preserving intended target.

import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../services/authService';
import { useGameStore } from '../store/gameStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const authUserId = useGameStore((state) => state.authUserId);
  const setAuthUserId = useGameStore((state) => state.setAuthUserId);
  const [checking, setChecking] = useState(!authUserId);

  useEffect(() => {
    let mounted = true;
    if (!authUserId) {
      getSession().then((session) => {
        if (!mounted) return;
        if (session?.user?.id) {
          setAuthUserId(session.user.id);
        }
        setChecking(false);
      });
    }

    return () => {
      mounted = false;
    };
  }, [authUserId, setAuthUserId]);

  if (checking) {
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
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
