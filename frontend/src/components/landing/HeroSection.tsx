import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

/**
 * HeroSection Component
 *
 * The primary value proposition headline for BuildLog.
 * Focuses on clarity, minimalist developer typography, and clean action triggers.
 */
export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Subtle background ambient glow for dark mode elegance */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-zinc-800/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6">
        {/* Category / Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1 text-xs font-medium text-zinc-400 mb-8 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          The developer building platform
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-white">
          Build it.
          <br />
          Log it.
          <br />
          <span className="text-zinc-500">Show your journey.</span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed font-normal">
          BuildLog helps developers track what they build, what they learn, and how they grow.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto font-semibold"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
          >
            Start Building
            <svg
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              const el = document.getElementById('preview');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Builds
          </Button>
        </div>

        {/* Micro-badge highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-semibold">&#10003;</span>
            <span>1-minute daily logs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-semibold">&#10003;</span>
            <span>Automated build streaks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-semibold">&#10003;</span>
            <span>Shareable proof of growth</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
