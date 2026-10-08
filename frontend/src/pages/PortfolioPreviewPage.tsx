import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { PortfolioDetail } from '../types/portfolio';
import { getPortfolio, togglePublishPortfolio } from '../services/portfolios';
import { TemplateRenderer } from '../components/portfolio/templates';

type PreviewMode = 'fluid' | 'desktop' | 'tablet' | 'mobile';

export const PortfolioPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const portfolioId = Number(id);
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>('fluid');
  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    loadPortfolio();
  }, [portfolioId]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await getPortfolio(portfolioId);
      setPortfolio(data);
      setIsPublished(data.status === 'published');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!portfolio) return;
    setPublishing(true);
    try {
      const updated = await togglePublishPortfolio(portfolio.id!);
      setIsPublished(updated.status === 'published');
    } catch (err: any) {
      alert(`Publish error: ${err?.message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-center">
        <div className="space-y-4">
          <p className="text-red-400 text-sm">{error || 'Portfolio not found'}</p>
          <Link to="/portfolio" className="text-xs text-white underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Floating Preview Control Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/portfolio/${portfolio.id}/edit`}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-zinc-200 transition font-medium"
          >
            ← Back to Editor
          </Link>
          <span className="font-bold text-white hidden sm:inline">{portfolio.title}</span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase">[{portfolio.template_id}]</span>
        </div>

        {/* Viewport Modes */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 gap-1">
          <button
            type="button"
            onClick={() => setMode('fluid')}
            className={`px-2.5 py-1 rounded transition ${mode === 'fluid' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          >
            Fluid
          </button>
          <button
            type="button"
            onClick={() => setMode('desktop')}
            className={`px-2.5 py-1 rounded transition ${mode === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setMode('tablet')}
            className={`px-2.5 py-1 rounded transition ${mode === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          >
            Tablet
          </button>
          <button
            type="button"
            onClick={() => setMode('mobile')}
            className={`px-2.5 py-1 rounded transition ${mode === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          >
            Mobile
          </button>
        </div>

        {/* Publish & Public URL */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={publishing}
            onClick={handleTogglePublish}
            className={`rounded-lg px-3 py-1 font-bold transition text-xs ${
              isPublished
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {publishing ? '...' : isPublished ? 'Published ●' : 'Publish Now'}
          </button>

          {isPublished && user?.username && (
            <Link
              to={`/p/${user.username}/${portfolio.slug}`}
              target="_blank"
              className="rounded-lg bg-zinc-800 px-3 py-1 text-zinc-300 hover:text-white transition"
            >
              Public Link ↗
            </Link>
          )}
        </div>
      </header>

      {/* Render Frame */}
      <div className="flex-1 flex justify-center overflow-y-auto bg-zinc-950">
        <div
          className={`w-full transition-all duration-300 ${
            mode === 'desktop'
              ? 'max-w-6xl my-6 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden'
              : mode === 'tablet'
              ? 'max-w-[768px] my-6 rounded-2xl border-8 border-zinc-800 shadow-2xl overflow-hidden'
              : mode === 'mobile'
              ? 'max-w-[375px] my-6 rounded-3xl border-8 border-zinc-800 shadow-2xl overflow-hidden'
              : ''
          }`}
        >
          <TemplateRenderer data={portfolio} />
        </div>
      </div>
    </div>
  );
};
