import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

/**
 * ValueComparisonSection Component
 *
 * Articulates the core difference between git commit repositories and BuildLog:
 * "GitHub shows what you shipped. BuildLog shows how you grew."
 */
export const ValueComparisonSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="philosophy" className="border-t border-zinc-850/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Why We Built This
          </p>
          <blockquote className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white sm:leading-tight">
            &ldquo;GitHub shows what you shipped.
            <br />
            <span className="text-zinc-400">BuildLog shows how you grew.&rdquo;</span>
          </blockquote>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Anyone can follow a YouTube tutorial and push finished code to GitHub.
            What recruiters and judges actually care about is how you think, debug, and learn when things break.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* GitHub Column */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-5">
              <span className="font-mono text-sm font-semibold text-zinc-400">
                Traditional Git Commits
              </span>
              <span className="text-xs text-zinc-500 font-mono">The Code</span>
            </div>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-zinc-600 font-mono mt-0.5">&minus;</span>
                <span>Cryptic messages like <code>git commit -m &quot;fix bug&quot;</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-zinc-600 font-mono mt-0.5">&minus;</span>
                <span>Shows final diffs, hiding the 5 hours of debugging behind it</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-zinc-600 font-mono mt-0.5">&minus;</span>
                <span>Zero record of what concepts you mastered along the way</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-zinc-600 font-mono mt-0.5">&minus;</span>
                <span>Easy to copy-paste without demonstrating real understanding</span>
              </li>
            </ul>
          </div>

          {/* BuildLog Column */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <span className="font-mono text-sm font-semibold text-white">
                BuildLog Journey
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                The Growth
              </span>
            </div>
            <ul className="space-y-4 text-sm text-zinc-200">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">&#10003;</span>
                <span>Structured daily logs answering what broke and what was fixed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">&#10003;</span>
                <span>Explicit proof of concepts learned and skills acquired</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">&#10003;</span>
                <span>Verified calendar streaks reflecting consistent engineering discipline</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">&#10003;</span>
                <span>A portfolio page you can proudly send to hackathon judges and recruiters</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="mt-16 text-center max-w-xl mx-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to show how you grow?
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
            Join students, hackathon builders, and independent developers tracking their daily progress.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/signup')}
          >
            Start Building — It&apos;s Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ValueComparisonSection;
