import { useState } from 'react';

/**
 * Custom hook for polling an API endpoint at a fixed interval.
 * Stops when shouldStop returns true.
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 3000
) {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = (shouldStop: (data: T) => boolean) => {
    setIsPolling(true);

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        if (shouldStop(result)) {
          setIsPolling(false);
          return;
        }
        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error('Polling error:', error);
        setIsPolling(false);
      }
    };

    poll();
  };

  return { data, isPolling, startPolling };
}
