import React from 'react';
import type { BuildLog } from '../../types';

interface BuildLogCardProps {
  log: BuildLog;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

/**
 * BuildLogCard Component
 *
 * Displays a single build log entry with the four core prompts:
 * - 🚀 Built
 * - 🧠 Learned
 * - 🐛 Problem
 * - ⏭ Next
 */
export const BuildLogCard: React.FC<BuildLogCardProps> = ({ log, onDelete, onEdit }) => {
  const formattedDate = new Date(log.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 transition hover:border-zinc-700">
      {/* Top bar with date and actions */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
        <span className="font-mono text-xs text-zinc-400">
          {formattedDate}
        </span>
        <span className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(log.id)}
              className="text-xs text-zinc-500 hover:text-white transition cursor-pointer"
              title="Edit this log"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(log.id)}
              className="text-xs text-zinc-500 hover:text-rose-400 transition cursor-pointer"
              title="Delete this log"
            >
              Delete
            </button>
          )}
        </span>
      </div>

      {/* The 4 core prompts */}
      <div className="space-y-4 text-sm">
        {/* Built */}
        <div>
          <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            🚀 Built
          </span>
          <p className="text-zinc-200 pl-4 border-l border-emerald-500/30 leading-relaxed">
            {log.built}
          </p>
        </div>

        {/* Learned */}
        <div>
          <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
            🧠 Learned
          </span>
          <p className="text-zinc-200 pl-4 border-l border-cyan-500/30 leading-relaxed">
            {log.learned}
          </p>
        </div>

        {/* Problem */}
        <div>
          <span className="font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
            🐛 Problem
          </span>
          <p className="text-zinc-200 pl-4 border-l border-rose-500/30 leading-relaxed">
            {log.problems}
          </p>
        </div>

        {/* Next */}
        <div>
          <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
            ⏭ Next
          </span>
          <p className="text-zinc-200 pl-4 border-l border-amber-500/30 leading-relaxed">
            {log.nextSteps}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuildLogCard;
