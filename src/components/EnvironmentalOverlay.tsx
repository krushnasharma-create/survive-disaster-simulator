// src/components/EnvironmentalOverlay.tsx
// Environmental event overlay responding to active timer and scene cues.
// Strictly non-blocking (pointer-events: none, z-index: 1), rendering subtle
// disaster-specific visual atmosphere without interfering with controls.

import { useMemo } from 'react';
import type { DisasterType, EnvironmentEvent } from '../data/types';
import styles from './EnvironmentalOverlay.module.css';

interface EnvironmentalOverlayProps {
  disasterType: DisasterType;
  remainingSeconds?: number;
  events?: EnvironmentEvent[];
  active?: boolean;
}

export function EnvironmentalOverlay({
  disasterType,
  remainingSeconds = 15,
  events = [],
  active = true,
}: EnvironmentalOverlayProps) {
  // Check if any specific configured event has been triggered
  const triggeredEvents = useMemo(() => {
    return events.filter((ev) => remainingSeconds <= ev.triggerAtSeconds);
  }, [events, remainingSeconds]);

  if (!active) return null;

  const isUrgent = remainingSeconds <= 5;
  const isMidWay = remainingSeconds <= 8;

  const hasCrack =
    disasterType === 'earthquake' &&
    (isUrgent || triggeredEvents.some((e) => e.effectType === 'crack'));

  const hasSmoke =
    disasterType === 'fire' &&
    (isMidWay || triggeredEvents.some((e) => e.effectType === 'smoke'));

  const hasWaterRise =
    disasterType === 'flood' &&
    (isMidWay || triggeredEvents.some((e) => e.effectType === 'water_rise'));

  return (
    <div
      className={`${styles.container} ${
        disasterType === 'earthquake'
          ? isUrgent
            ? styles.rumbleUrgent
            : styles.rumbleActive
          : ''
      }`}
      aria-hidden="true"
    >
      {/* Earthquake: Branching structural crack SVG */}
      {hasCrack && (
        <svg
          className={styles.cracksSvg}
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          {/* Top-left corner fracture */}
          <path
            d="M0,0 L120,80 L90,140 L160,200 L140,280 L210,320"
            fill="none"
            className={styles.crackLine}
          />
          {/* Top-right corner fracture */}
          <path
            d="M1000,0 L880,70 L910,130 L840,190 L860,260 L800,310"
            fill="none"
            className={styles.crackLine}
          />
          {/* Lower border stress crack */}
          {isUrgent && (
            <path
              d="M350,1000 L380,910 L340,860 L400,790 L390,740"
              fill="none"
              className={styles.crackLine}
            />
          )}
        </svg>
      )}

      {/* Fire: Heat glow and descending smoke ceiling */}
      {disasterType === 'fire' && (
        <>
          <div
            className={isUrgent ? styles.fireGlowUrgent : styles.fireGlow}
          />
          {hasSmoke && <div className={styles.smokeLayer} />}
        </>
      )}

      {/* Flood: Rising water gradient and animated crest */}
      {disasterType === 'flood' && (
        <>
          <div
            className={`${styles.waterOverlay} ${
              isUrgent
                ? styles.waterHigh
                : hasWaterRise
                ? styles.waterRising
                : styles.waterLow
            }`}
          >
            <svg
              className={styles.waterWave}
              viewBox="0 0 1200 24"
              preserveAspectRatio="none"
            >
              <path d="M0,12 C150,24 350,0 500,12 C650,24 850,0 1000,12 C1150,24 1350,0 1500,12 L1500,24 L0,24 Z" />
            </svg>
          </div>
          {isUrgent && <div className={styles.currentStream} />}
        </>
      )}
    </div>
  );
}
