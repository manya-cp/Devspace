import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Post } from '../types';
import PageBackground from '../components/common/PageBackground';
import BackButton from '../components/common/BackButton';
import PostCard from '../components/post/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { Calendar, FileText, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileResponse {
  user: User;
  posts: Post[];
  articleCount: number;
}

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<ProfileResponse>(`/users/${id}`);
      setProfileData(res.data);
    } catch (err: any) {
      console.error('Error fetching author profile:', err);
      setError(err.response?.data?.message || 'Author profile could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageBackground theme="profile" overlayOpacity="bg-slate-950/90" />
        <LoadingSpinner message="Loading author profile..." size="lg" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col justify-center max-w-2xl mx-auto px-4 py-12">
        <PageBackground theme="profile" overlayOpacity="bg-slate-950/90" />
        <div className="mb-6">
          <BackButton fallback="/feed" label="Back to Feed" />
        </div>
        <ErrorMessage title="Profile Unavailable" message={error || 'User not found.'} />
      </div>
    );
  }

  const { user, posts, articleCount } = profileData;
  const isSelf = currentUser && currentUser.id === user.id;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member';

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="profile" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Control Bar with Mandatory BackButton */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <BackButton fallback="/feed" label="Back to Feed" />

          {isSelf && (
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>

        {/* Author Header Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 mb-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.name)}`
              }
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-800 border-2 border-slate-700 shadow-xl shrink-0"
            />

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {user.name}
                  </h1>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">Author on DevSpace</p>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-2 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {user.bio || 'Software engineer and author on DevSpace sharing lessons learned in production.'}
              </p>

              {/* Stats badges */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center sm:justify-start gap-6 text-xs text-slate-400">
                <div>
                  <span className="text-lg font-bold text-white font-mono tabular-nums block">
                    {articleCount}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Published {articleCount === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Articles Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Published by {user.name}
            </h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No published articles yet"
              description={`${user.name} has not published any public articles yet.`}
              actionText="Browse Articles Feed"
              actionLink="/feed"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;
