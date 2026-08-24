import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neon' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
  }[size];

  const variantStyles = {
    primary: 'bg-slate-800 text-slate-200 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    info: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
    neon: 'bg-slate-800 text-slate-300 border-slate-700',
    purple: 'bg-slate-800 text-slate-300 border-slate-700',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
