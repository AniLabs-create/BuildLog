import React from 'react';

/**
 * BuildLogCardPreview Component
 *
 * An interactive, visual demonstration of the core BuildLog unit.
 * Recruiter & visitor facing: immediately shows the structured 4-part format:
 * - 🚀 Built
 * - 🧠 Learned
 * - 🐛 Problem
 * - ⏭ Next
 */
export const BuildLogCardPreview: React.FC = () => {
  return (
    <section id="preview" className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
            The Core Concept
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            What a Build Log looks like
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            No endless essays. Just 60 seconds at the end of each coding session.
          </p>
        </div>

        {/* Realistic BuildLog Entry Preview Container */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-all hover:border-zinc-700">
          {/* Top metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 font-mono text-sm font-bold text-white">
                SS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">SmartShortlist</span>
                  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                    Building
                  </span>
                </div>
                <p className="text-xs text-zinc-500">By @nizam &bull; September 12</p>
              </div>
            </div>

            {/* Streak & Activity Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                <span>🔥</span> 7 day streak
              </span>
            </div>
          </div>

          {/* The 4 Core BuildLog Prompts */}
          <div className="mt-6 space-y-5 text-sm">
            {/* 1. Built */}
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-850/80 p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                <span>🚀</span>
                <span>Built</span>
              </div>
              <p className="text-zinc-200 pl-6 leading-relaxed">
                Added PDF extraction API with automated text parsing and confidence scoring.
              </p>
            </div>

            {/* 2. Learned */}
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-850/80 p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
                <span>🧠</span>
                <span>Learned</span>
              </div>
              <p className="text-zinc-200 pl-6 leading-relaxed">
                How PDF binary streams decode embedded text fonts and the difference between rasterized scans vs vectorized text.
              </p>
            </div>

            {/* 3. Problem */}
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-850/80 p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                <span>🐛</span>
                <span>Problem</span>
              </div>
              <p className="text-zinc-200 pl-6 leading-relaxed">
                Scanned PDFs don&apos;t contain selectable text layers, causing the standard parser to return empty strings.
              </p>
            </div>

            {/* 4. Next */}
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-850/80 p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                <span>⏭</span>
                <span>Next</span>
              </div>
              <p className="text-zinc-200 pl-6 leading-relaxed">
                Add OCR fallback pipeline using background worker queues for large files.
              </p>
            </div>
          </div>

          {/* Tech Stack Pills & Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono">stack:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 font-mono text-[11px]">
                  Python
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 font-mono text-[11px]">
                  FastAPI
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 font-mono text-[11px]">
                  React
                </span>
              </div>
            </div>
            <span className="text-zinc-500 font-mono">1 min write-up &bull; verified build</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildLogCardPreview;
