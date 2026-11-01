import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono text-[0.875em]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0b101b] shadow-xl group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs font-mono text-slate-400">
        <span>{language ? language.toUpperCase() : 'CODE'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose-devspace text-slate-200 leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          code: CodeBlock as any,
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight border-b border-slate-800 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-7 mb-3 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc list-inside space-y-1.5 text-slate-300 text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal list-inside space-y-1.5 text-slate-300 text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 italic text-sm sm:text-base">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline decoration-cyan-500/50 hover:decoration-cyan-400 font-medium transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-200">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="p-3 border-t border-slate-800/60">{children}</td>,
          hr: () => <hr className="my-8 border-slate-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
