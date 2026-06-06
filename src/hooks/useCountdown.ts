import { useState, useEffect } from 'react';

export function useCountdown(targetDate: Date | number) {
  const targetMs = typeof targetDate === 'number' ? targetDate : targetDate.getTime();

  const [timeLeft, setTimeLeft] = useState(targetMs - Date.now());

  useEffect(() => {
    const tick = () => {
      const remaining = targetMs - Date.now();
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const isExpired = timeLeft <= 0;
  const hours = Math.max(0, Math.floor(timeLeft / 3600000));
  const minutes = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000));

  return { timeLeft, isExpired, hours, minutes, seconds };
}
