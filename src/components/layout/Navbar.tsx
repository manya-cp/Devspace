import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Terminal, 
  PenTool, 
  LayoutDashboard, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Compass,
  Hash
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>DevSpace</span>
        </Link>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link
            to="/feed"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isActive('/feed') ? 'text-cyan-400' : 'hover:text-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Articles</span>
          </Link>
          <Link
            to="/tags"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isActive('/tags') || isActive('/tag') ? 'text-cyan-400' : 'hover:text-slate-100'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Tags</span>
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                isActive('/dashboard') ? 'text-cyan-400' : 'hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Zone 3: Primary Action / Auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/editor/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm hover:shadow-cyan-500/20 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Write</span>
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-700/60 hover:border-cyan-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
                  aria-expanded={profileMenuOpen}
                  aria-label="User profile options"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover bg-slate-800"
                  />
                </button>

                {profileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-xl py-1.5 border border-slate-800 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Profile Settings</span>
                    </Link>

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to="/editor/new"
              className="px-2.5 py-1 text-xs font-medium text-slate-950 bg-cyan-400 rounded-lg"
            >
              Write
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3">
          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Articles
          </Link>
          <Link
            to="/tags"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Tags Directory
          </Link>

          {user ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 hover:text-white py-1"
              >
                Dashboard
              </Link>
              <Link
                to={`/profile/${user.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 hover:text-white py-1"
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 hover:text-white py-1"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-sm font-medium text-red-400 hover:text-red-300 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
