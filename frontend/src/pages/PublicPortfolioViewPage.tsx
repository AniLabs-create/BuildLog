import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PortfolioPublicResponse } from '../types/portfolio';
import { getPublicPortfolio } from '../services/portfolios';
import { TemplateRenderer } from '../components/portfolio/templates';

export const PublicPortfolioViewPage: React.FC = () => {
  const { username, portfolioSlug } = useParams<{ username: string; portfolioSlug: string }>();

  const [portfolio, setPortfolio] = useState<PortfolioPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !portfolioSlug) return;
    loadPublicPortfolio();
  }, [username, portfolioSlug]);

  const loadPublicPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicPortfolio(username!, portfolioSlug!);
      setPortfolio(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'This portfolio is either unpublished, private, or does not exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="text-4xl">🔍</div>
          <h1 className="text-xl font-bold text-white">Portfolio Unavailable</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
          <div className="pt-4">
            <Link
              to="/"
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg"
            >
              Explore BuildLog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Template Content */}
      <TemplateRenderer data={portfolio.portfolio} />

      {/* Discreet Bottom Branding Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          to="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur-md hover:text-white hover:border-zinc-700 transition shadow-lg"
        >
          <span className="text-purple-400">⚡</span>
          <span>Built with BuildLog</span>
        </Link>
      </div>
    </div>
  );
};
