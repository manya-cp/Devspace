import React from 'react';
import { Link } from 'react-router-dom';
import PageBackground from '../components/common/PageBackground';
import BackButton from '../components/common/BackButton';
import { Terminal, Home, Compass } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PageBackground theme="landing" overlayOpacity="bg-slate-950/88" />

      {/* Mandatory Back Button */}
      <div className="w-full max-w-md mx-auto mb-4">
        <BackButton fallback="/" label="Back to Home" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto mb-6 shadow-inner">
            <Terminal className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
            The path or article you requested does not exist, was moved, or is currently unpublished.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>DevSpace Home</span>
            </Link>

            <Link
              to="/feed"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Browse Feed</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
