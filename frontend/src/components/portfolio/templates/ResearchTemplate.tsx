import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const ResearchTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Research Lab Header */}
        <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-lg object-cover ring-1 ring-teal-500/40" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 font-mono font-bold text-teal-400">
                μ
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-white tracking-tight">{profile.name}</div>
              <div className="text-xs text-slate-400 font-mono">{profile.headline || 'Machine Learning & Systems Researcher'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-teal-300">
              LAB // {profile.location || 'Distributed'}
            </span>
            {hero.availability_badge && (
              <span className="rounded bg-slate-800 border border-slate-700 px-2.5 py-1 text-slate-300">
                {hero.availability_badge}
              </span>
            )}
          </div>
        </header>

        {/* Abstract & Hero */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs text-teal-400">
            <span>[ABSTRACT]</span>
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {hero.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-lg bg-teal-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase tracking-wider hover:bg-teal-400 transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-6 py-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Methodology & Focus */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <h2 className="text-xs font-mono uppercase text-teal-400">01. Research Agenda</h2>
            <h3 className="text-xl font-bold text-white">{about.title || 'Core Hypotheses'}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <h2 className="text-xs font-mono uppercase text-teal-400">02. Benchmark Highlights</h2>
            <ul className="space-y-2 text-xs text-slate-300">
              {about.highlights?.map((h, i) => (
                <li key={i} className="border-l border-teal-500/40 pl-2">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Projects / Empirical Studies */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white">Empirical Deployments &amp; Research Systems</h3>
            <span className="text-xs font-mono text-slate-500">{projects?.length || 0} Artifacts</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-teal-400">EXP-0{idx + 1}</span>
                    <h4 className="text-xl font-bold text-white">{proj.title}</h4>
                  </div>
                  {proj.featured && (
                    <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                      FLAGSHIP EXPERIMENT
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{proj.description}</p>

                {/* Problem - Solution - Impact Matrix */}
                {(proj.problem || proj.solution || proj.impact) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    {proj.problem && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <strong className="text-rose-400 font-mono block mb-1">CHALLENGE:</strong>
                        <span className="text-slate-300">{proj.problem}</span>
                      </div>
                    )}
                    {proj.solution && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <strong className="text-sky-400 font-mono block mb-1">METHOD:</strong>
                        <span className="text-slate-300">{proj.solution}</span>
                      </div>
                    )}
                    {proj.impact && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <strong className="text-teal-400 font-mono block mb-1">EVALUATION:</strong>
                        <span className="text-slate-300">{proj.impact}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                        [Code Repo]
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        [Evaluation Live]
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Stack */}
        {skills && skills.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase text-teal-400">Technical Apparatus &amp; Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="rounded-md border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                  {s.name} {s.proficiency ? `(${s.proficiency}%)` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact Footer */}
        <footer id="contact" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Collaboration &amp; Inquiry</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {contact.message || 'Open to research collaborations, benchmark consultations, and engineering advisory.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono pt-2">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="text-teal-400 hover:underline">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                github ↗
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                linkedin ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
