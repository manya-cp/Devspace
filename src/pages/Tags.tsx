import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { TagInfo } from '../types';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { Hash, Search } from 'lucide-react';

export const Tags: React.FC = () => {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<TagInfo[]>('/tags');
      setTags(res.data);
    } catch (err: any) {
      console.error('Error fetching tags directory:', err);
      setError(err.response?.data?.message || 'Failed to load technology tags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="tags" overlayOpacity="bg-slate-950/85" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/feed"
          backLabel="Back to Feed"
          kicker="Taxonomy & Topics"
          title="Technology Tags Directory"
          description="Browse published technical articles indexed by programming languages, frameworks, and architectural domains."
        />

        {/* Filter bar */}
        <div className="glass-panel rounded-2xl p-4 mb-8 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter topics (e.g. React, Node, Cloud)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Tags Grid */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Loading technology tags..." size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage title="Unable to load tags" message={error} onRetry={fetchTags} />
        ) : filteredTags.length === 0 ? (
          <EmptyState
            icon={Hash}
            title="No tags found"
            description={
              filterQuery
                ? `No tags matched "${filterQuery}".`
                : 'No tags have been assigned to published articles yet.'
            }
            actionText={filterQuery ? 'Clear Filter' : 'Explore Feed'}
            actionLink={filterQuery ? undefined : '/feed'}
            onAction={filterQuery ? () => setFilterQuery('') : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/tag/${tag.slug}`}
                className="glass-panel p-5 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all duration-200 group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {tag.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">#{tag.slug}</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400 tabular-nums">
                  {tag.count} {tag.count === 1 ? 'article' : 'articles'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tags;
