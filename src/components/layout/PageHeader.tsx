import React from 'react';
import BackButton from '../common/BackButton';

interface PageHeaderProps {
  title?: string;
  description?: string;
  kicker?: string;
  backFallback?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  kicker,
  backFallback = '/',
  backLabel = 'Back',
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Top action row containing the Mandatory Back Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <BackButton fallback={backFallback} label={backLabel} />
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {kicker && (
        <span className="text-xs font-mono font-medium text-cyan-400 tracking-wider uppercase block mb-1">
          {kicker}
        </span>
      )}

      {title && (
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
      )}

      {description && (
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}

      {children}
    </div>
  );
};

export default PageHeader;
