import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { PortfolioItem } from '../types/portfolio';
import { listPortfolios, deletePortfolio, togglePublishPortfolio } from '../services/portfolios';
import { getEntitlements } from '../services/entitlements';
import type { EntitlementResponse } from '../types/portfolio';
import { ProPaywallModal } from '../components/portfolio/ProPaywallModal';
import { getTemplateById } from '../components/portfolio/templates/TemplateRegistry';

export const PortfolioDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, ent] = await Promise.all([
        listPortfolios(),
        getEntitlements().catch(() => null),
      ]);
      setPortfolios(list);
      setEntitlements(ent);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Failed to delete: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const updated = await togglePublishPortfolio(id);
      setPortfolios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p))
      );
    } catch (err: any) {
      alert(`Failed to update publish state: ${err?.response?.data?.detail || err?.message}`);
    }
  };

  const isPro = entitlements?.tier === 'pro';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8 animate-fadeIn">
      {/* Top Header / Vision Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              BuildLog Portfolio
            </h1>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                isPro
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isPro ? 'PRO TIER' : 'FREE TIER'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Create high-impact personal developer websites using your BuildLog builds, GitHub repositories, and 20 bespoke templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/portfolio/templates"
            className="rounded-xl border border-zinc-750 bg-zinc-900/60 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition"
          >
            Explore 20 Templates
          </Link>
          <Link
            to="/portfolio/new"
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2 text-xs font-bold text-white transition shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <span>+ Create Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Pro Entitlement Callout if Free */}
      {!isPro && (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-zinc-900 to-zinc-900 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="text-purple-400">✨</span>
              <span>Portfolio AI is available in Pro</span>
            </div>
            <p className="text-xs text-zinc-400">
              Upgrade to unlock AI-powered portfolio creation, rewriting, copy optimization, and instant redesigns.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPaywall(true)}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition shadow-md"
          >
            [Unlock Pro — Demo]
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Portfolio Grid or Empty State */}
      {portfolios.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/60 text-2xl text-purple-400">
            📂
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">You haven't created a portfolio yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly turn your BuildLog projects and GitHub repositories into a polished portfolio site.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              to="/portfolio/new"
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-purple-600/20"
            >
              Build Your First Portfolio
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((item) => {
            const templateMeta = getTemplateById(item.template_id || 'minimal');

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition shadow-lg group"
              >
                <div>
                  {/* Status & Template Chips */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        item.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.status === 'published' ? 'bg-emerald-400' : 'bg-zinc-500'
                        }`}
                      />
                      {item.status === 'published' ? 'Published' : 'Draft'}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] text-zinc-300 font-mono">
                      <span
                        className="h-2 w-2 rounded-full inline-block"
                        style={{ backgroundColor: templateMeta.accentColor }}
                      />
                      {templateMeta.name}
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                    {item.title}
                  </h3>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Slug: /{item.slug}
                  </div>

                  {/* Meta stats */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>
                      {item.projectCount || 0} Projects • {item.skillsCount || 0} Skills
                    </span>
                    <span>Updated {new Date(item.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/portfolio/${item.id}/edit`}
                      className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 font-semibold text-white transition"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/portfolio/${item.id}/preview`}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white transition"
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item.id)}
                      className="text-[11px] text-zinc-400 hover:text-white underline ml-1"
                    >
                      {item.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'published' && user?.username && (
                      <Link
                        to={`/p/${user.username}/${item.slug}`}
                        target="_blank"
                        className="text-purple-400 hover:underline text-[11px] font-mono"
                      >
                        Public Link ↗
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-zinc-500 hover:text-red-400 p-1 text-[11px]"
                      title="Delete Portfolio"
                    >
                      {deletingId === item.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paywall Modal */}
      <ProPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => {
          loadData();
        }}
      />
    </div>
  );
};
