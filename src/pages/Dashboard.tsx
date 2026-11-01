import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { 
  PenTool, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Settings, 
  LogOut,
  Calendar,
  Layers
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');

  // Deletion state
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Post[]>('/posts/mine');
      setPosts(res.data);
    } catch (err: any) {
      console.error('Error fetching dashboard posts:', err);
      setError(err.response?.data?.message || 'Failed to load your articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'published') return p.status === 'published';
    if (activeTab === 'draft') return p.status === 'draft';
    return true;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/posts/${deletingPostId}`);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      setDeletingPostId(null);
    } catch (err: any) {
      console.error('Delete post error:', err);
      alert(err.response?.data?.message || 'Failed to delete article.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="nodes" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/"
          backLabel="Back to Home"
          kicker="Author Workspace"
          title={`Welcome back, ${user?.name || 'Developer'}`}
          description="Manage your published insights, drafts, and track your technical articles."
          actions={
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          }
        />

        {/* User Summary & Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* User Profile Tile */}
          <div className="glass-panel p-5 rounded-2xl md:col-span-1 flex items-center gap-3.5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || 'user')}`}
              alt={user?.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <Link
                to={`/profile/${user?.id}`}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-0.5 inline-block font-medium"
              >
                View Public Profile →
              </Link>
            </div>
          </div>

          {/* Metric 1: Total */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Total Articles</span>
              <span className="text-2xl font-extrabold text-white mt-1 block font-mono tabular-nums">
                {totalCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Published */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Published</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-mono tabular-nums">
                {publishedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Drafts */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">In Draft</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block font-mono tabular-nums">
                {draftCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action & Filter Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Articles ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('published')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'published'
                  ? 'bg-slate-800 text-emerald-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-slate-800 text-amber-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <Link
            to="/editor/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md hover:shadow-cyan-500/20 transition-all duration-150 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Create New Article</span>
          </Link>
        </div>

        {/* Articles Table / List */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Loading your articles..." size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage title="Unable to load articles" message={error} onRetry={fetchMyPosts} />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={activeTab === 'draft' ? 'No drafts found' : 'No articles published yet'}
            description={
              activeTab === 'draft'
                ? 'You have no saved drafts. All your articles are currently published.'
                : 'Share your first technical tutorial or software engineering insight with the DevSpace community.'
            }
            actionText="Write New Article"
            actionLink="/editor/new"
          />
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="divide-y divide-slate-800/80">
              {filteredPosts.map((post) => {
                const updatedDate = new Date(post.updatedAt || post.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                );

                return (
                  <div
                    key={post.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            post.status === 'published'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                          }`}
                        >
                          {post.status}
                        </span>

                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{updatedDate}</span>
                        </span>

                        <span className="text-[11px] text-slate-500">·</span>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {post.readingTime} min read
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-100 truncate hover:text-cyan-400 transition-colors">
                        <Link to={post.status === 'published' ? `/post/${post.slug}` : `/editor/${post.id}`}>
                          {post.title}
                        </Link>
                      </h3>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {post.tags.map((t) => (
                            <span key={t} className="text-[11px] font-mono text-slate-500">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      {post.status === 'published' && (
                        <Link
                          to={`/post/${post.slug}`}
                          className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
                          title="View Live Article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}

                      <Link
                        to={`/editor/${post.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingPostId(post.id)}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded-lg border border-red-800/40 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={Boolean(deletingPostId)}
        title="Delete Technical Article"
        message="Are you sure you want to permanently delete this article? This action cannot be reversed."
        confirmLabel="Delete Article"
        cancelLabel="Keep Article"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPostId(null)}
      />
    </div>
  );
};

export default Dashboard;
