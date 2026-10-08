import React, { useEffect, useState } from 'react';
import type { PortfolioVersionItem, PortfolioData } from '../../types/portfolio';
import { listPortfolioVersions, restorePortfolioVersion } from '../../services/portfolios';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: number;
  onVersionRestored: (data: PortfolioData) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  portfolioId,
  onVersionRestored,
}) => {
  const [versions, setVersions] = useState<PortfolioVersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, portfolioId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPortfolioVersions(portfolioId);
      setVersions(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: number) => {
    if (!window.confirm('Restore this version? Any unsaved edits will be superseded by the restored snapshot.')) {
      return;
    }
    setRestoringId(versionId);
    try {
      const restored = await restorePortfolioVersion(portfolioId, versionId);
      onVersionRestored(restored);
      onClose();
    } catch (err: any) {
      alert(`Failed to restore version: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Version History</h3>
              <p className="text-xs text-zinc-400">Restore earlier snapshots without losing historical revisions</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading && (
            <div className="py-12 text-center text-xs text-zinc-400 font-mono">
              Loading revision timeline...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
              {error}
            </div>
          )}

          {!loading && versions.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500">
              No saved versions recorded yet. Versions are created on manual save or AI actions.
            </div>
          )}

          {!loading &&
            versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400">
                      v{(v as any).versionNum || (v as any).version_number || 1}
                    </span>
                    <span className="text-xs font-medium text-white">
                      {v.message || (v as any).change_summary || 'Automatic Snapshot'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {new Date((v as any).createdAt || (v as any).created_at || Date.now()).toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={restoringId === v.id}
                  onClick={() => handleRestore(v.id)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-purple-600 hover:border-purple-600 hover:text-white px-4 py-2 text-xs font-semibold text-zinc-300 transition disabled:opacity-50"
                >
                  {restoringId === v.id ? 'Restoring...' : 'Restore Snapshot'}
                </button>
              </div>
            ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2 text-xs font-semibold text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
