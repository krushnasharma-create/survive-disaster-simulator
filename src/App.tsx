// src/App.tsx
// Root component. Sets up client-side routing with AnimatePresence for
// cinematic screen transitions between all game screens.

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

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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