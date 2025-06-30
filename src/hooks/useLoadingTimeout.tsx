
import { useEffect, useState } from 'react';

interface UseLoadingTimeoutOptions {
  timeout?: number;
  onTimeout?: () => void;
}

export const useLoadingTimeout = (
  isLoading: boolean, 
  options: UseLoadingTimeoutOptions = {}
) => {
  const { timeout = 15000, onTimeout } = options;
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setHasTimedOut(false);
      
      const timer = setTimeout(() => {
        console.warn('⏰ Loading timeout reached');
        setHasTimedOut(true);
        onTimeout?.();
      }, timeout);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setHasTimedOut(false);
    }
  }, [isLoading, timeout, onTimeout]);

  return { hasTimedOut };
};
