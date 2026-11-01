import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/common/PageBackground';
import PageHeader from '../components/layout/PageHeader';
import MarkdownPreview from '../components/editor/MarkdownPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { 
  Eye, 
  Columns, 
  Save, 
  Send, 
  Image as ImageIcon, 
  Hash, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  FileEdit
} from 'lucide-react';

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = Boolean(id && id !== 'new');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // UI state
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('split');
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Suggested cover images
  const sampleCovers = [
    { label: 'Cloud Architecture', url: '/src/assets/images/bg_landing_tech_1793504993992.jpg' },
    { label: 'Engineering Desk', url: '/src/assets/images/bg_workspace_dark_1793505024814.jpg' },
    { label: 'Digital Topography', url: '/src/assets/images/bg_profile_identity_1793505805767.jpg' },
    { label: 'Neural Network', url: '/src/assets/images/bg_tags_constellation_1793505836681.jpg' },
    { label: 'Minimalist Slate', url: '/src/assets/images/bg_reader_sanctuary_1793505789951.jpg' },
  ];

  // Fetch existing article if in edit mode
  useEffect(() => {
    async function loadPost() {
      if (!isEditMode || !id) return;
      try {
        setLoadingInitial(true);
        const res = await api.get<Post>(`/posts/${id}`);
        const p = res.data;

        // Verify author ownership
        if (user && p.authorId !== user.id) {
          setErrorMessage('You do not have permission to edit this article.');
          return;
        }

        setTitle(p.title);
        setContent(p.content);
        setCoverImage(p.coverImage || '');
        setTagsInput(p.tags ? p.tags.join(', ') : '');
        setStatus(p.status);
      } catch (err: any) {
        console.error('Failed to load post for editing:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to load article details.');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadPost();
  }, [id, isEditMode, user]);

  // Handle unsaved changes prompt on unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && (title || content)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, title, content]);

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an article title.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Article content cannot be empty.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || '/src/assets/images/bg_landing_tech_1793504993992.jpg',
        tags: tagsArray,
        status: targetStatus,
      };

      if (isEditMode && id) {
        const res = await api.put<Post>(`/posts/${id}`, payload);
        setStatus(targetStatus);
        setHasChanges(false);
        setSuccessMessage(
          targetStatus === 'published'
            ? 'Article updated and published successfully!'
            : 'Draft saved successfully!'
        );
        setTimeout(() => {
          if (targetStatus === 'published') {
            navigate(`/post/${res.data.slug}`);
          } else {
            navigate('/dashboard');
          }
        }, 800);
      } else {
        const res = await api.post<Post>('/posts', payload);
        setStatus(targetStatus);
        setHasChanges(false);
        setSuccessMessage(
          targetStatus === 'published'
            ? 'Article published to the feed!'
            : 'Draft saved to your dashboard!'
        );
        setTimeout(() => {
          if (targetStatus === 'published') {
            navigate(`/post/${res.data.slug}`);
          } else {
            navigate('/dashboard');
          }
        }, 800);
      }
    } catch (err: any) {
      console.error('Error saving article:', err);
      setErrorMessage(
        err.response?.data?.message || 'An error occurred while saving the article.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageBackground theme="editor" />
        <LoadingSpinner message="Loading article editor..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground theme="editor" overlayOpacity="bg-slate-950/90" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header with Mandatory BackButton */}
        <PageHeader
          backFallback="/dashboard"
          backLabel="Back to Dashboard"
          kicker={isEditMode ? 'Edit Mode' : 'Create Mode'}
          title={isEditMode ? 'Edit Technical Article' : 'Write a New Article'}
          description="Draft high-impact technical tutorials and architectural notes using Markdown."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{saving ? 'Publishing...' : isEditMode ? 'Update & Publish' : 'Publish Article'}</span>
              </button>
            </div>
          }
        />

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mb-6">
            <ErrorMessage title="Editor Notice" message={errorMessage} />
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Editor Settings Card: Title, Cover, Tags */}
        <div className="glass-panel rounded-2xl p-6 mb-6 space-y-4">
          <div>
            <label htmlFor="article-title" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Article Title *
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="e.g. Architecting Resilient Distributed Microservices in Node.js"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-bold text-lg sm:text-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tags input */}
            <div>
              <label htmlFor="article-tags" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Technology Tags (comma-separated)</span>
              </label>
              <input
                id="article-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => {
                  setTagsInput(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="React, TypeScript, Node.js, Architecture"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors font-mono"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="article-cover" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cover Image URL (or pick a preset below)</span>
              </label>
              <input
                id="article-cover"
                type="text"
                value={coverImage}
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="/src/assets/images/... or custom image URL"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Quick presets for cover */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Quick Presets:</span>
            {sampleCovers.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setCoverImage(preset.url);
                  setHasChanges(true);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  coverImage === preset.url
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toolbar: Write | Split | Preview */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                viewMode === 'write' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                viewMode === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Markdown supported · ```code```
          </div>
        </div>

        {/* Editor & Preview Panes */}
        <div
          className={`grid gap-6 ${
            viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Write Pane */}
          {(viewMode === 'write' || viewMode === 'split') && (
            <div className="glass-panel rounded-2xl p-4 flex flex-col border border-slate-800">
              <div className="text-xs font-mono text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>MARKDOWN INPUT</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasChanges(true);
                }}
                placeholder={`Write your article in Markdown...

# Heading 1
## Heading 2

Paragraph text here with **bold** or *italic* terms.

\`\`\`typescript
const greeting = "Hello DevSpace";
console.log(greeting);
\`\`\`

> Quotation or takeaway note`}
                rows={22}
                className="w-full flex-1 p-4 bg-[#0a0f18] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 resize-y"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 overflow-y-auto max-h-[650px]">
              <div className="text-xs font-mono text-slate-400 mb-4 pb-2 border-b border-slate-800">
                LIVE PREVIEW
              </div>
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  {title}
                </h1>
              )}
              {content ? (
                <MarkdownPreview content={content} />
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Markdown preview will render here as you type...
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PostEditor;
