// src/App.tsx
// Root component. Sets up client-side routing with AnimatePresence for
// cinematic screen transitions between all game screens.

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScreenTransition } from './components/ScreenTransition';
import IntroScreen from './screens/IntroScreen';
import DisasterSelect from './screens/DisasterSelect';
import DisasterIntro from './screens/DisasterIntro';
import ScenarioScreen from './screens/ScenarioScreen';
import ConsequenceScreen from './screens/ConsequenceScreen';
import OutcomeScreen from './screens/OutcomeScreen';
import ReportScreen from './screens/ReportScreen';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Game flow */}
        <Route
          path="/"
          element={
            <ScreenTransition>
              <IntroScreen />
            </ScreenTransition>
          }
        />
        <Route
          path="/select"
          element={
            <ScreenTransition>
              <DisasterSelect />
            </ScreenTransition>
          }
        />
        <Route
          path="/disaster/:disasterId/intro"
          element={
            <ScreenTransition>
              <DisasterIntro />
            </ScreenTransition>
          }
        />
        <Route
          path="/disaster/:disasterId/scenario"
          element={
            <ScreenTransition>
              <ScenarioScreen />
            </ScreenTransition>
          }
        />
        <Route
          path="/disaster/:disasterId/consequence"
          element={
            <ScreenTransition>
              <ConsequenceScreen />
            </ScreenTransition>
          }
        />
        <Route
          path="/disaster/:disasterId/outcome"
          element={
            <ScreenTransition>
              <OutcomeScreen />
            </ScreenTransition>
          }
        />
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
