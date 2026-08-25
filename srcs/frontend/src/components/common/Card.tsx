import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'purple' | 'cyan' | 'indigo' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  hoverEffect = false,
  onClick,
}) => {
  const hoverClasses = hoverEffect
    ? 'hover:border-slate-700 transition-colors duration-150 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 rounded-xl p-5 border border-slate-800 text-left ${hoverClasses} ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            {title && <h4 className="text-sm font-semibold text-white">{title}</h4>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
