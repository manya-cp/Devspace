import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-sm flex items-start gap-3 backdrop-blur-md ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-red-100">{title}</h4>
        <p className="mt-1 text-xs text-red-300 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-900/60 hover:bg-red-900 text-red-100 rounded-lg border border-red-700/50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
