import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ targetDate, label = 'Ends in', size = 'md' }: CountdownTimerProps) {
  const targetMs = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
  const [timeLeft, setTimeLeft] = useState(targetMs - Date.now());

  useEffect(() => {
    const tick = () => setTimeLeft(targetMs - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const isExpired = timeLeft <= 0;
  const hours = Math.max(0, Math.floor(timeLeft / 3600000));
  const minutes = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000));

  const sizeClasses = { sm: 'text-xs gap-1', md: 'text-sm gap-2', lg: 'text-lg gap-3' };
  const numClasses = { sm: 'text-sm font-bold', md: 'text-xl font-bold', lg: 'text-3xl font-bold' };

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-muted)] text-xs">{label}</p>
        <p className="text-red-400 font-bold">Ended</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-[var(--text-muted)] text-xs mb-1">{label}</p>
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <div className="flex flex-col items-center">
          <span className={`${numClasses[size]} text-white tabular-nums`}>{String(hours).padStart(2, '0')}</span>
          <span className="text-[var(--text-muted)] text-[10px]">HRS</span>
        </div>
        <span className="text-[var(--text-muted)] font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className={`${numClasses[size]} text-white tabular-nums`}>{String(minutes).padStart(2, '0')}</span>
          <span className="text-[var(--text-muted)] text-[10px]">MIN</span>
        </div>
        <span className="text-[var(--text-muted)] font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className={`${numClasses[size]} text-hive-500 tabular-nums`}>{String(seconds).padStart(2, '0')}</span>
          <span className="text-[var(--text-muted)] text-[10px]">SEC</span>
        </div>
      </div>
    </div>
  );
}
