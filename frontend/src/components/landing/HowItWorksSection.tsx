import React from 'react';

/**
 * HowItWorksSection Component
 *
 * Explains the lightweight 3-step developer workflow:
 * 1. Build your feature
 * 2. Log in 60 seconds
 * 3. Showcase your growth
 */
export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Build your feature',
      description:
        'Code whatever you are building — a hackathon project, an open-source tool, or a weekend experiment.',
      badge: 'Write Code',
    },
    {
      number: '02',
      title: 'Log it in 1 minute',
      description:
        'Answer 4 quick prompts: What did you build? What did you learn? What broke? What is next? Fast and zero friction.',
      badge: 'Reflect',
    },
    {
      number: '03',
      title: 'Show how you grew',
      description:
        'BuildLog automatically stitches your logs into a visual timeline and verified streak that recruiters and peers can explore.',
      badge: 'Portfolio',
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-zinc-850/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
            The Workflow
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple enough to do daily.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Most developer portfolios get abandoned because updating them is tedious. BuildLog takes 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-extrabold text-zinc-600">
                  {step.number}
                </span>
                <span className="rounded bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-0.5 font-mono text-xs text-zinc-300">
                  {step.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
