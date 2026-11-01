import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">DevSpace</span>
              <p className="text-xs text-slate-400 mt-0.5">Developer publishing & knowledge sharing platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/feed" className="hover:text-cyan-400 transition-colors">Articles</Link>
            <Link to="/tags" className="hover:text-cyan-400 transition-colors">Technology Tags</Link>
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} DevSpace. Built for developers.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
