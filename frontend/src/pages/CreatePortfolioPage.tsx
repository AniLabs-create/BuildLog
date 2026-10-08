import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPortfolio, importBuildLogPortfolio } from '../services/portfolios';
import { TEMPLATES_REGISTRY } from '../components/portfolio/templates/TemplateRegistry';

export const CreatePortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplate = searchParams.get('template') || 'minimal';

  const [title, setTitle] = useState('Software Engineer Portfolio');
  const [slug, setSlug] = useState('software-engineer');
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [creationMode, setCreationMode] = useState<'buildlog' | 'template' | 'manual'>('buildlog');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generated || 'portfolio');
  };

  const handleCreate = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Please provide a portfolio title and slug.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (creationMode === 'buildlog') {
        const result = await importBuildLogPortfolio({
          title,
          slug,
          template_id: selectedTemplate,
          include_github: true,
          include_buildlogs: true,
        });
        navigate(`/portfolio/${result.id}/edit`);
      } else {
        const result = await createPortfolio({
          title,
          slug,
          template_id: selectedTemplate,
        });
        navigate(`/portfolio/${result.id}/edit`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create portfolio');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-10 animate-fadeIn">
      {/* Page Title */}
      <div className="border-b border-zinc-850 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create New Portfolio</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Select your data source and visual design language.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Creation Mode Selector */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Step 1: Choose Starting Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode 1: BuildLog + GitHub */}
          <button
            type="button"
            onClick={() => setCreationMode('buildlog')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              creationMode === 'buildlog'
                ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⚡</span>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  Recommended
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Start from BuildLog</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Automatically import your profile, skills, projects, and connected GitHub data with factual scoring.
              </p>
            </div>
          </button>

          {/* Mode 2: Template Starter */}
          <button
            type="button"
            onClick={() => setCreationMode('template')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              creationMode === 'template'
                ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-bold text-white text-sm">Template Starter</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Start with one of the 20 styled templates and pre-populated sample showcase content.
              </p>
            </div>
          </button>

          {/* Mode 3: Manual Scratch */}
          <button
            type="button"
            onClick={() => setCreationMode('manual')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              creationMode === 'manual'
                ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-bold text-white text-sm">Manual Scratch</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Build completely by hand with custom section inputs from scratch.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Portfolio Title & Slug */}
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Step 2: Title &amp; Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Portfolio Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Systems Engineer Portfolio"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Portfolio URL Slug</label>
            <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-400">
              <span className="font-mono text-xs text-zinc-600">/p/username/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
                placeholder="systems-portfolio"
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none pl-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Step 3: Choose Visual Template (20 Styles)
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            Selected: {TEMPLATES_REGISTRY.find((t) => t.id === selectedTemplate)?.name || 'Minimal'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
          {TEMPLATES_REGISTRY.map((t) => {
            const isSel = selectedTemplate.toLowerCase() === t.id.toLowerCase();

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSel
                    ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.accentColor }} />
                  <span className="font-bold text-white text-xs">{t.name}</span>
                </div>
                <span className="text-[10px] text-zinc-400 block font-mono">[{t.category}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={handleCreate}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-8 py-3 text-sm font-bold text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          {loading ? (
            <span>Processing and creating portfolio...</span>
          ) : (
            <>
              <span>Create &amp; Open Editor →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
