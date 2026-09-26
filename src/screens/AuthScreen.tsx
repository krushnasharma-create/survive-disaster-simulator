// src/screens/AuthScreen.tsx
// Cinematic authentication screen supporting Sign In and Sign Up.
// Connects to authService without disrupting guest simulation accessibility.

import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { signIn, signUp, validateUsername } from '../services/authService';
import { useGameStore } from '../store/gameStore';
import styles from './AuthScreen.module.css';

export default function AuthScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuthUserId = useGameStore((state) => state.setAuthUserId);

  const isSignUpMode = location.pathname.includes('signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSignUpMode) {
      const usernameCheck = validateUsername(username);
      if (!usernameCheck.valid) {
        setErrorMessage(usernameCheck.error || 'Invalid username.');
        return;
      }
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUpMode) {
        const result = await signUp(email, password, username, displayName);
        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed.');
          setLoading(false);
          return;
        }
        if (result.data?.session?.user?.id) {
          setAuthUserId(result.data.session.user.id);
        } else {
          // Registration succeeded but backend requires email confirmation before issuing a session
          setAuthUserId(null);
          setErrorMessage('Registration submitted. Please verify your email before logging in.');
          setLoading(false);
          return;
        }
      } else {
        const result = await signIn(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed.');
          setLoading(false);
          return;
        }
        if (result.data?.session?.user?.id) {
          setAuthUserId(result.data.session.user.id);
        } else {
          setAuthUserId(null);
          setErrorMessage('Unable to establish an authenticated session. Please verify your credentials.');
          setLoading(false);
          return;
        }
      }

      // Navigate to profile upon successful authentication
      navigate('/profile', { replace: true });
    } catch {
      setErrorMessage('A connection error occurred. Please verify your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>CRISIS IDENTIFICATION // ACCESS TERMINAL</span>
          <Link to="/" className={styles.cancelBtn}>
            RETURN TO MENU
          </Link>
        </header>

        <div className={styles.card}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>
              {isSignUpMode ? 'REGISTER PERSONNEL' : 'OPERATOR LOGIN'}
            </h1>
            <p className={styles.subtitle}>
              {isSignUpMode
                ? 'Create a personnel profile to track lifetime survival records.'
                : 'Authenticate to access private simulation history and records.'}
            </p>
          </div>

          {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {isSignUpMode && (
              <>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="username">
                    CALLSIGN / USERNAME
                  </label>
                  <input
                    id="username"
                    type="text"
                    className={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. survival_lead"
                    required
                    autoComplete="username"
                  />
                  <span className={styles.hint}>3–24 alphanumeric characters or underscores</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="displayName">
                    DISPLAY NAME (OPTIONAL)
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Commander Sharma"
                    maxLength={40}
                  />
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                COMMUNICATION CHANNEL / EMAIL
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.gov.in"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                ACCESS KEY / PASSWORD
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
              />
              {isSignUpMode && <span className={styles.hint}>Minimum 6 characters</span>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? 'AUTHENTICATING...'
                : isSignUpMode
                ? 'ESTABLISH PROFILE'
                : 'INITIALIZE SESSION'}
            </button>
          </form>

          <div className={styles.toggleRow}>
            <span>{isSignUpMode ? 'Already have credentials?' : 'Need operator clearance?'}</span>
            <button
              type="button"
              className={styles.toggleLink}
              onClick={() => {
                setErrorMessage(null);
                navigate(isSignUpMode ? '/auth/login' : '/auth/signup');
              }}
            >
              {isSignUpMode ? 'Log In' : 'Sign Up'}
            </button>
          </div>

          <div className={styles.guestNote}>
            <Link
              to="/select"
              className={styles.guestLink}
              onClick={() => setAuthUserId(null)}
            >
              ▶ CONTINUE AS GUEST (LOCAL PLAY ONLY)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
