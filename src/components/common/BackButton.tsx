import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallback = '/',
  label = 'Back',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if there is valid in-app history to pop
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-100 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/80 rounded-xl shadow-md hover:shadow-cyan-500/10 backdrop-blur-md transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer select-none group shrink-0 ${className}`}
      aria-label={`Go back (defaults to ${fallback})`}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
