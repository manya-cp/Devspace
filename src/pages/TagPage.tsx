import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Post } from '../types';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/post/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { Hash, Compass } from 'lucide-react';

export const TagPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTagPosts = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Post[]>(`/tags/${slug}/posts`);
      setPosts(res.data);
    } catch (err: any) {
      console.error('Error loading tag articles:', err);
      setError(err.response?.data?.message || `Failed to load articles for tag "${slug}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTagPosts();
  }, [slug]);

  // Capitalize or clean up tag display name
  const formattedTagName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="tags" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/tags"
          backLabel="Back to Tags Directory"
          kicker="Tag Taxonomy"
          title={`#${formattedTagName}`}
          description={`Exploring all published technical tutorials and articles categorized under #${slug}.`}
          actions={
            <Link
              to="/tags"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
            >
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>All Tags</span>
            </Link>
          }
        />

        {/* Content */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message={`Loading articles tagged #${slug}...`} size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage title="Unable to load articles" message={error} onRetry={fetchTagPosts} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={`No articles tagged #${slug}`}
            description="There are currently no published articles associated with this tag."
            actionText="Browse All Articles"
            actionLink="/feed"
          />
        ) : (
          <div>
            <div className="mb-6 text-xs text-slate-400 font-mono">
              Found <span className="text-cyan-400 font-bold tabular-nums">{posts.length}</span> published {posts.length === 1 ? 'article' : 'articles'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TagPage;
