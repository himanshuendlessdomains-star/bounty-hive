import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/format';

interface CountdownTimerProps {
  endTime: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ endTime, size = 'md' }: CountdownTimerProps) {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  if (isExpired) {
    return (
      <span className="text-red-400 font-mono font-bold">EXPIRED</span>
    );
  }

  return (
    <span className={`${sizeClasses[size]} font-mono font-bold text-hive-400`}>
      ⏱ {formatCountdown(hours, minutes, seconds)}
    </span>
  );
}
