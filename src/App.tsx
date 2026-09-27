// src/App.tsx
// Root component. Sets up client-side routing with AnimatePresence for
// cinematic screen transitions between all game screens.

import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScreenTransition } from './components/ScreenTransition';
import IntroScreen from './screens/IntroScreen';
import HowToPlayScreen from './screens/HowToPlayScreen';
import DisasterSelect from './screens/DisasterSelect';
import ScenarioSelectScreen from './screens/ScenarioSelectScreen';
import DisasterIntro from './screens/DisasterIntro';
import ScenarioScreen from './screens/ScenarioScreen';
import ConsequenceScreen from './screens/ConsequenceScreen';
import OutcomeScreen from './screens/OutcomeScreen';
import ReportScreen from './screens/ReportScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthGuard } from './components/AuthGuard';
import { getSession, subscribeToAuthChanges } from './services/authService';
import { useGameStore } from './store/gameStore';

export default function App() {
  const location = useLocation();
  const setAuthUserId = useGameStore((state) => state.setAuthUserId);
  const setAuthLoading = useGameStore((state) => state.setAuthLoading);

  useEffect(() => {
    let isMounted = true;
    let initialResolved = false;

    // Subscribe to auth state updates.
    // In Supabase v2, onAuthStateChange emits INITIAL_SESSION on registration
    // and subsequent SIGNED_IN, SIGNED_OUT, and TOKEN_REFRESHED events.
    const { unsubscribe } = subscribeToAuthChanges((_event, session) => {
      if (!isMounted) return;
      initialResolved = true;
      setAuthUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });

    // Active session check fallback (ensures immediate resolution if INITIAL_SESSION is delayed or unconfigured)
    getSession()
      .then((session) => {
        if (!isMounted) return;
        if (!initialResolved) {
          initialResolved = true;
          setAuthUserId(session?.user?.id ?? null);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        if (!initialResolved) {
          initialResolved = true;
          setAuthUserId(null);
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setAuthUserId, setAuthLoading]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Authentication Routes */}
        <Route
          path="/auth/login"
          element={
            <ScreenTransition>
              <AuthScreen />
            </ScreenTransition>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <ScreenTransition>
              <AuthScreen />
            </ScreenTransition>
          }
        />

        {/* Private Personnel Profile */}
        <Route
          path="/profile"
          element={
            <ScreenTransition>
              <AuthGuard>
                <ProfileScreen />
              </AuthGuard>
            </ScreenTransition>
          }
        />
        {/* Main Menu / Entry */}
        <Route
          path="/"
          element={
            <ScreenTransition>
              <IntroScreen />
            </ScreenTransition>
          }
        />

        {/* How to Play Briefing */}
        <Route
          path="/how-to-play"
          element={
            <ScreenTransition>
              <HowToPlayScreen />
            </ScreenTransition>
          }
        />

        {/* Disaster Selection Console */}
        <Route
          path="/select"
          element={
            <ScreenTransition>
              <DisasterSelect />
            </ScreenTransition>
          }
        />

        {/* Scenario Selection Console (Modern vs Historical) */}
        <Route
          path="/disaster/:disasterId/scenarios"
          element={
            <ScreenTransition>
              <ScenarioSelectScreen />
            </ScreenTransition>
          }
        />

        {/* Scenario Narrative Intro */}
        <Route
          path="/disaster/:disasterId/intro"
          element={
            <ScreenTransition>
              <DisasterIntro />
            </ScreenTransition>
          }
        />

        {/* Core Scenario Gameplay */}
        <Route
          path="/disaster/:disasterId/scenario"
          element={
            <ScreenTransition>
              <ScenarioScreen />
            </ScreenTransition>
          }
        />

        {/* Consequence & Protocol Feedback */}
        <Route
          path="/disaster/:disasterId/consequence"
          element={
            <ScreenTransition>
              <ConsequenceScreen />
            </ScreenTransition>
          }
        />

        {/* Evacuation Outcome Resolution */}
        <Route
          path="/disaster/:disasterId/outcome"
          element={
            <ScreenTransition>
              <OutcomeScreen />
            </ScreenTransition>
          }
        />

        {/* Preparedness Report & Audit */}
        <Route
          path="/disaster/:disasterId/report"
          element={
            <ScreenTransition>
              <ReportScreen />
            </ScreenTransition>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}