import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Post, Comment } from '../types';
import PageBackground from '../components/common/PageBackground';
import BackButton from '../components/common/BackButton';
import TagPill from '../components/post/TagPill';
import PostCard from '../components/post/PostCard';
import MarkdownPreview from '../components/editor/MarkdownPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { 
  Calendar, 
  Clock, 
  Edit3, 
  ArrowLeft, 
  Share2, 
  Check, 
  Heart, 
  Bookmark, 
  MessageSquare, 
  Send 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Developer Interactions state
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Post>(`/posts/${slug}`);
        setPost(res.data);

        // Initialize interaction states
        const currentLikes = res.data.likes || [];
        setLikesCount(currentLikes.length);
        if (user && currentLikes.includes(user.id)) {
          setHasLiked(true);
        }

        const currentBookmarks = res.data.bookmarks || [];
        if (user && currentBookmarks.includes(user.id)) {
          setHasBookmarked(true);
        }

        setComments(res.data.comments || []);

        // Fetch related posts matching first tag
        if (res.data.tags && res.data.tags.length > 0) {
          const firstTag = res.data.tags[0];
          const relatedRes = await api.get<Post[]>('/posts', { params: { tag: firstTag } });
          setRelatedPosts(relatedRes.data.filter((p) => p.id !== res.data.id).slice(0, 3));
        }
      } catch (err: any) {
        console.error('Error loading article:', err);
        setError(err.response?.data?.message || 'Article could not be found or has been removed.');
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like this article.');
      return;
    }
    if (!post) return;
    try {
      const res = await api.post<{ likes: string[]; liked: boolean; count: number }>(`/posts/${post.id}/like`);
      setHasLiked(res.data.liked);
      setLikesCount(res.data.count);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please sign in to bookmark this article.');
      return;
    }
    if (!post) return;
    try {
      const res = await api.post<{ bookmarks: string[]; bookmarked: boolean; count: number }>(`/posts/${post.id}/bookmark`);
      setHasBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to join the discussion.');
      return;
    }
    if (!post || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setCommentError(null);
      const res = await api.post<Comment>(`/posts/${post.id}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      setCommentError(err.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageBackground theme="reader" overlayOpacity="bg-slate-950/90" />
        <LoadingSpinner message="Loading article..." size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col justify-center max-w-2xl mx-auto px-4 py-12">
        <PageBackground theme="reader" overlayOpacity="bg-slate-950/90" />
        <div className="mb-6">
          <BackButton fallback="/feed" label="Back to Feed" />
        </div>
        <ErrorMessage
          title="Article Not Available"
          message={error || 'The requested article does not exist or may have been deleted.'}
        />
        <div className="mt-6 text-center">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedCreated = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = user && user.id === post.authorId;

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="reader" overlayOpacity="bg-slate-950/90" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Control Bar with Mandatory BackButton */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <BackButton fallback="/feed" label="Back to Feed" />

          <div className="flex items-center gap-2.5">
            {isAuthor && (
              <Link
                to={`/editor/${post.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </Link>
            )}

            {/* Like button */}
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-xs'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
              }`}
              title={user ? 'Like this article' : 'Sign in to like'}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span className="tabular-nums font-mono">{likesCount}</span>
            </button>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                hasBookmarked
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
              }`}
              title={hasBookmarked ? 'Bookmarked' : 'Save bookmark'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${hasBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              aria-label="Share article link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Reading Surface Container */}
        <article className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.tags.map((tag) => (
                <TagPill key={tag} name={tag} />
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author & Publication Metadata */}
          <div className="mt-6 pb-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <Link
              to={`/profile/${post.authorId}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={
                  post.author?.avatar ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                    post.author?.name || 'author'
                  )}`
                }
                alt={post.author?.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover bg-slate-800 border border-slate-700 group-hover:border-cyan-500/60 transition-colors"
              />
              <div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors block">
                  {post.author?.name || 'DevSpace Author'}
                </span>
                <span className="text-xs text-slate-400 block line-clamp-1 max-w-xs">
                  {post.author?.bio || 'Software Developer & Writer'}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formattedCreated}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{post.readingTime} min read</span>
              </span>
            </div>
          </div>

          {/* Cover Image banner */}
          {post.coverImage && (
            <div className="my-8 rounded-2xl overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-800">
              <img
                src={post.coverImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Markdown Content */}
          <div className="mt-8">
            <MarkdownPreview content={post.content} />
          </div>

          {/* Post Author Bio Card at Bottom */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex items-start gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <img
              src={
                post.author?.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  post.author?.name || 'author'
                )}`
              }
              alt={post.author?.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover bg-slate-800 shrink-0 border border-slate-700"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Written by {post.author?.name}
                </h3>
                <Link
                  to={`/profile/${post.authorId}`}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  View Profile →
                </Link>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {post.author?.bio ||
                  'Software developer sharing architectural insights, system design, and engineering best practices on DevSpace.'}
              </p>
            </div>
          </div>

          {/* Interactive Comments & Discussion Section */}
          <section className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Discussion ({comments.length})
              </h3>
            </div>

            {/* Comment Submission Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-8">
                {commentError && (
                  <div className="mb-3">
                    <ErrorMessage title="Comment Error" message={commentError} />
                  </div>
                )}
                <div className="flex gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover bg-slate-800 shrink-0 border border-slate-700"
                  />
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts, ask questions, or contribute to this discussion..."
                      className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 mb-8 flex items-center justify-between">
                <span>Join the technical conversation and share your feedback.</span>
                <Link
                  to="/login"
                  className="px-3 py-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-800/60 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/80 transition-colors"
                >
                  Sign in to Comment
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No comments on this article yet. Be the first to start the discussion!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
                    <img
                      src={c.userAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(c.userId)}`}
                      alt={c.userName}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0 border border-slate-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-200">{c.userName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-800/80">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Recommended Related Articles
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                More articles discussing engineering patterns and modern software design
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <PostCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PostDetail;
