import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { Clock, Calendar, FileText, ArrowUpRight, Heart, MessageSquare } from 'lucide-react';
import TagPill from './TagPill';

interface PostCardProps {
  post: Post;
  showStatusBadge?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, showStatusBadge = false }) => {
  const [imgError, setImgError] = useState(false);

  // Strip markdown formatting symbols for a clean excerpt
  const excerpt = post.content
    ? post.content
        .replace(/#+\s+/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~>]/g, '')
        .slice(0, 160)
        .trim() + '...'
    : 'No preview available.';

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 flex flex-col group relative">
      {/* Cover image with robust fallback */}
      <Link to={`/post/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-slate-900 shrink-0">
        {!imgError && post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-600 p-4">
            <FileText className="w-10 h-10 text-slate-700 mb-1" />
            <span className="text-xs font-mono text-slate-500">DevSpace Article</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {showStatusBadge && post.status === 'draft' && (
          <div className="absolute top-3 right-3 bg-amber-500/95 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-lg backdrop-blur-md">
            Draft
          </div>
        )}

        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </Link>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags list */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <TagPill key={tag} name={tag} />
              ))}
              {post.tags.length > 3 && (
                <span className="text-[11px] font-mono text-slate-500">+{post.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            <Link to={`/post/${post.slug}`}>{post.title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Author & Metadata Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
          <Link
            to={`/profile/${post.authorId}`}
            className="flex items-center gap-2.5 hover:text-slate-200 transition-colors shrink-0 group/author"
          >
            <img
              src={
                post.author?.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  post.author?.name || 'author'
                )}`
              }
              alt={post.author?.name || 'Author'}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover bg-slate-800 border border-slate-700 group-hover/author:border-cyan-500/60 transition-colors"
            />
            <span className="font-medium text-slate-300 group-hover/author:text-cyan-400 transition-colors truncate max-w-[120px]">
              {post.author?.name || 'DevSpace Author'}
            </span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
            {post.likes && post.likes.length > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <Heart className="w-3 h-3 text-rose-400/80 fill-rose-400/50" />
                <span className="tabular-nums">{post.likes.length}</span>
              </span>
            )}
            {post.comments && post.comments.length > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <MessageSquare className="w-3 h-3 text-cyan-400/80" />
                <span className="tabular-nums">{post.comments.length}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{post.readingTime}m</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
