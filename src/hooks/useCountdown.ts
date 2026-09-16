// src/hooks/useCountdown.ts
// Countdown timer hook. Returns remaining seconds and a started flag.
// Calls onExpire when timer reaches zero.

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  duration: number;      // seconds
  onExpire?: () => void;
  autoStart?: boolean;
}

interface UseCountdownReturn {
  remaining: number;
  isRunning: boolean;
  progress: number;      // 1.0 → 0.0
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useCountdown({
  duration,
  onExpire,
  autoStart = false,
}: UseCountdownOptions): UseCountdownReturn {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    clear();
  }, []);

  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) { clear(); return; }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [isRunning]);

  return {
    remaining,
    isRunning,
    progress: remaining / duration,
    start,
    stop,
    reset,
  };
}
