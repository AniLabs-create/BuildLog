import React, { useState } from 'react';
import { toggleDemoPro } from '../../services/entitlements';

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  featureName?: string;
}

export const ProPaywallModal: React.FC<ProPaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
  featureName = 'Portfolio AI',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlockDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await toggleDemoPro(true);
      onUnlocked();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to activate Demo Pro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-purple-600/30 blur-[90px] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1.5 rounded-full bg-zinc-800/60"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            BUILDLOG PORTFOLIO PRO
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {featureName} is a Pro feature.
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Upgrade to unlock AI-powered portfolio creation and redesign.
            </p>
          </div>

          {/* Feature List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Included with Portfolio Pro:
            </div>
            <ul className="space-y-2 text-xs text-zinc-200">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>AI Portfolio Agent</strong> — chat, edit sections, and restructure content</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>AI Copy Rewriting</strong> — polish headlines, bios, and impact metrics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>AI Design &amp; Styling</strong> — instant template selection and palette tuning</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Unlimited Portfolios</strong> — create specialized versions for different roles</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Factual Resume Import</strong> — GitHub, LeetCode, and BuildLog synchronization</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Demo Unlock Button */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleUnlockDemo}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Activating Demo Pro...</span>
              ) : (
                <>
                  <span>[Unlock Pro — Demo]</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-500">
              Simulated development tier. Real Stripe checkout can replace this flag without refactoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
