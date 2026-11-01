import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import { User, CheckCircle2, Save, Image as ImageIcon } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Display name must be at least 2 characters.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put<{ user: any; message: string }>('/users/me', {
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });

      updateUser(res.data.user);
      setSuccessMessage('Profile settings saved successfully.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatars = [
    { label: 'Identicon', url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || 'dev')}` },
    { label: 'Bottts', url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'dev')}` },
    { label: 'Architect Photo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="settings" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/dashboard"
          backLabel="Back to Dashboard"
          kicker="Account Preferences"
          title="Profile Settings"
          description="Update your public profile, author avatar, and bio visible across your articles."
        />

        <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          {errorMessage && (
            <div className="mb-6">
              <ErrorMessage title="Settings Notice" message={errorMessage} />
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
              <img
                src={avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || 'dev')}`}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border-2 border-slate-700 shadow-md shrink-0"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">Avatar Preview</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose a preset or paste a custom image URL below.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {sampleAvatars.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setAvatar(s.url)}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name *
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email Address (Account Identifier)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full px-3 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed font-mono"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar-url" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Avatar Image URL
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  id="avatar-url"
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label htmlFor="bio" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Author Biography
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell readers about your software engineering stack, current projects, and technical focus..."
                className="block w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md hover:shadow-cyan-500/20 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
