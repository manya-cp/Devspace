import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Post, TagInfo } from '../types';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/post/PostCard';
import TagPill from '../components/post/TagPill';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { Search, Compass, X } from 'lucide-react';

export const Feed: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || '';
  const initialSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state if URL search params change
  useEffect(() => {
    setSelectedTag(searchParams.get('tag') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch tags for filter strip
  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await api.get<TagInfo[]>('/tags');
        setTags(res.data);
      } catch (err) {
        console.warn('Failed to fetch tags for filter:', err);
      }
    }
    fetchTags();
  }, []);

  // Fetch posts whenever selectedTag or search query stabilizes
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get<Post[]>('/posts', { params });
      setPosts(res.data);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.message || 'Failed to load articles from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag, searchQuery]);

  const handleTagClick = (tagName: string) => {
    if (selectedTag.toLowerCase() === tagName.toLowerCase()) {
      setSelectedTag('');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tag');
      setSearchParams(newParams);
    } else {
      setSelectedTag(tagName);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tag', tagName);
      setSearchParams(newParams);
    }
  };

  const handleClearFilters = () => {
    setSelectedTag('');
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="feed" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/"
          backLabel="Back to Home"
          kicker="Engineering Feed"
          title="Explore Technical Articles"
          description="In-depth tutorials, system architecture deep dives, and production-tested patterns from engineering peers."
        />

        {/* Filter & Search Toolbar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const p = new URLSearchParams(searchParams);
                  if (e.target.value.trim()) {
                    p.set('search', e.target.value.trim());
                  } else {
                    p.delete('search');
                  }
                  setSearchParams(p);
                }}
                placeholder="Search articles by title, topic, or keyword..."
                className="w-full pl-10 pr-10 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    const p = new URLSearchParams(searchParams);
                    p.delete('search');
                    setSearchParams(p);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedTag || searchQuery) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Quick Tag Filter strip */}
          {tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
                Filter by:
              </span>
              <button
                type="button"
                onClick={() => handleTagClick('')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                  !selectedTag
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Topics
              </button>
              {tags.map((t) => (
                <TagPill
                  key={t.slug}
                  name={t.name}
                  count={t.count}
                  isActive={selectedTag.toLowerCase() === t.name.toLowerCase()}
                  onClick={() => handleTagClick(t.name)}
                  asLink={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Searching developer articles..." size="lg" />
          </div>
        ) : error ? (
          <div className="py-8">
            <ErrorMessage
              title="Unable to load articles"
              message={error}
              onRetry={fetchPosts}
            />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Compass}
              title="No articles found"
              description={
                selectedTag || searchQuery
                  ? `No published articles matched "${selectedTag || searchQuery}". Try clearing filters or searching for different keywords.`
                  : 'There are no published articles yet. Be the first developer to share your technical knowledge!'
              }
              actionText={selectedTag || searchQuery ? 'Clear Filters' : 'Write First Article'}
              actionLink={selectedTag || searchQuery ? undefined : '/editor/new'}
              onAction={selectedTag || searchQuery ? handleClearFilters : undefined}
            />
          </div>
        ) : (
          <div>
            <div className="mb-4 text-xs font-medium text-slate-400">
              Showing <span className="text-cyan-400 font-mono tabular-nums">{posts.length}</span> published {posts.length === 1 ? 'article' : 'articles'}
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

export default Feed;
