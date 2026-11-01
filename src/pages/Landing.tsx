import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Post, TagInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/common/PageBackground';
import BackButton from '../components/common/BackButton';
import PostCard from '../components/post/PostCard';
import TagPill from '../components/post/TagPill';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  ArrowRight, 
  Terminal, 
  Code2, 
  BookOpen, 
  Share2, 
  Sparkles,
  ShieldCheck,
  Compass,
  FileCode,
  Users,
  Layers
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [popularTags, setPopularTags] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, tagsRes] = await Promise.all([
          api.get<Post[]>('/posts'),
          api.get<TagInfo[]>('/tags'),
        ]);
        setFeaturedPosts(postsRes.data.slice(0, 3));
        setPopularTags(tagsRes.data.slice(0, 8));
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="landing" overlayOpacity="bg-slate-950/80" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-6 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>The premier publishing platform crafted for software engineers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
            Build. Write. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Share. Grow.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            DevSpace is a dedicated home for technical minds to publish deep architectural breakdowns, 
            interactive code tutorials, and share lessons learned in production.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                to="/editor/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer"
              >
                <span>Write an Article</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/feed"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl backdrop-blur-md transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Feed</span>
            </Link>
          </div>
        </section>

        {/* Live Metrics Proof Strip */}
        <section className="mb-14">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums block">
                100%
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Developer Owned Content</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tabular-nums block">
                Native
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Markdown & Syntax Engine</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono tabular-nums block">
                Zero
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Paywalls or Popups</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono tabular-nums block">
                Instant
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Tag-Indexed Discovery</span>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-10 border-t border-slate-800/60">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-widest block mb-1">
              Engineered For Writers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything you need to publish technical ideas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Native Markdown & Syntax</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                First-class Markdown editing with live syntax highlighting, code copy actions, and formatted code snippets across all major languages.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Domain & Tag Taxonomy</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Connect your writing to curated engineering tags. Reach engineers searching for specific solutions in React, Node, Python, and cloud systems.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Full Content Ownership</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                You retain complete ownership over your intellectual property. Manage your drafts, publish when ready, or update articles at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Tags Section */}
        {popularTags.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-200">Popular Technologies</h2>
              <Link to="/tags" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                View all tags →
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {popularTags.map((tag) => (
                <TagPill key={tag.slug} name={tag.name} count={tag.count} asLink={true} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Articles Section */}
        <section className="py-12 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured Articles</h2>
              <p className="text-xs text-slate-400 mt-1">Curated deep dives written by the community</p>
            </div>
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading latest engineering articles..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Landing;
