import React from 'react';

/**
 * Footer Component
 *
 * Minimalist developer-focused footer reinforcing the product vision
 * and providing links for developers, contributors, and learners.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-850 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-700/60">
                &gt;_
              </span>
              <span>
                Build<span className="text-zinc-400">Log</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm">
              The developer building platform. Track what you build, what you learn, and how you grow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 text-sm">
            <div>
              <p className="font-semibold text-zinc-300 mb-2">Platform</p>
              <ul className="space-y-1.5 text-zinc-500">
                <li><a href="#how-it-works" className="hover:text-zinc-300 transition">How it Works</a></li>
                <li><a href="#preview" className="hover:text-zinc-300 transition">Sample Log</a></li>
                <li><a href="#philosophy" className="hover:text-zinc-300 transition">Philosophy</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-zinc-300 mb-2">Community</p>
              <ul className="space-y-1.5 text-zinc-500">
                <li><span className="text-zinc-600">Students &amp; Hackathons</span></li>
                <li><span className="text-zinc-600">Independent Builders</span></li>
                <li><span className="text-zinc-600">Open Source</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600 gap-4">
          <p>&copy; {new Date().getFullYear()} BuildLog. &ldquo;GitHub shows what you shipped. BuildLog shows how you grew.&rdquo;</p>
          <div className="flex gap-4">
            <span>Built for developers</span>
            <span>&bull;</span>
            <span>No AI fluff</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
