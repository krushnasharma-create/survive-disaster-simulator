// src/components/AuthGuard.tsx
// Route wrapper that checks for an active authenticated session.
// Redirects unauthenticated visitors to /auth/login while preserving intended target.

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const authUserId = useGameStore((state) => state.authUserId);
  const isAuthLoading = useGameStore((state) => state.isAuthLoading);

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
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
