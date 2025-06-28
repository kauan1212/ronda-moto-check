
import { useState, useCallback } from 'react';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
}

const rateLimitStorage = new Map<string, RateLimitState>();

export const useRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const [isBlocked, setIsBlocked] = useState(false);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = rateLimitStorage.get(key) || { attempts: 0, lastAttempt: 0, isBlocked: false };

    // Reset if window has passed
    if (now - state.lastAttempt > windowMs) {
      state.attempts = 0;
      state.isBlocked = false;
    }

    // Check if blocked
    if (state.attempts >= maxAttempts) {
      state.isBlocked = true;
      setIsBlocked(true);
      return false;
    }

    return true;
  }, [key, maxAttempts, windowMs]);

  const recordAttempt = useCallback((success: boolean = false) => {
    const now = Date.now();
    const state = rateLimitStorage.get(key) || { attempts: 0, lastAttempt: 0, isBlocked: false };

    if (success) {
      // Reset on successful attempt
      state.attempts = 0;
      state.isBlocked = false;
      setIsBlocked(false);
    } else {
      // Increment failed attempts
      state.attempts += 1;
      state.lastAttempt = now;

      if (state.attempts >= maxAttempts) {
        state.isBlocked = true;
        setIsBlocked(true);
      }
    }

    rateLimitStorage.set(key, state);
  }, [key, maxAttempts]);

  const getRemainingTime = useCallback((): number => {
    const state = rateLimitStorage.get(key);
    if (!state || !state.isBlocked) return 0;

    const timeLeft = windowMs - (Date.now() - state.lastAttempt);
    return Math.max(0, Math.ceil(timeLeft / 1000));
  }, [key, windowMs]);

  return {
    isBlocked,
    checkRateLimit,
    recordAttempt,
    getRemainingTime
  };
};
