import React from 'react';
import { Link } from 'react-router-dom';

interface TagPillProps {
  name: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  asLink?: boolean;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const TagPill: React.FC<TagPillProps> = ({
  name,
  count,
  isActive = false,
  onClick,
  asLink = true,
}) => {
  const slug = slugify(name);

  if (asLink) {
    return (
      <Link
        to={`/tag/${slug}`}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors whitespace-nowrap group font-mono"
      >
        <span className="text-slate-500 group-hover:text-cyan-500 transition-colors">#</span>
        <span>{name}</span>
        {count !== undefined && (
          <span className="text-[11px] text-slate-500 tabular-nums">({count})</span>
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
        isActive
          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs'
          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
      }`}
    >
      <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>#</span>
      <span>{name}</span>
      {count !== undefined && (
        <span className="ml-1 text-[11px] opacity-70 tabular-nums">({count})</span>
      )}
    </button>
  );
};

export default TagPill;
