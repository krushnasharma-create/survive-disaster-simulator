// src/hooks/useCountdown.ts
// Countdown timer hook. Returns remaining seconds and a started flag.
// Calls onExpire when timer reaches zero.

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  duration: number;      // seconds
  onExpire?: () => void;
  autoStart?: boolean;
  resetKey?: number | string;
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
  resetKey,
}: UseCountdownOptions): UseCountdownReturn {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clear();
    setRemaining(duration);
    setIsRunning(autoStart);
  }, [duration, autoStart, resetKey, clear]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    clear();
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    setRemaining(duration);
  }, [clear, duration]);

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    clear();
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

    return () => {
      clear();
    };
  }, [isRunning, resetKey, clear]);

  return {
    remaining,
    isRunning,
    progress: duration > 0 ? remaining / duration : 0,
    start,
    stop,
    reset,
  };
}
