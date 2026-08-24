import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  variant?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rainbow';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  variant = 'purple',
  size = 'md',
  showPercentage = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4 text-[10px]',
  }[size];

  const gradientStyles = {
    purple: 'bg-gradient-to-r from-violet-600 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    rainbow: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]',
  }[variant];

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage || sublabel) && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {label && <span className="font-semibold text-slate-200">{label}</span>}
            {sublabel && <span className="text-slate-400 text-[11px]">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="font-mono font-bold text-slate-300">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 ${heightStyles}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${gradientStyles}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
