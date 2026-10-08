import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const FounderTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Founder Top Bar */}
        <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/50" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                {(profile.name || 'F').charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xl font-extrabold text-white">{profile.name}</div>
              <div className="text-xs text-indigo-400 font-medium">{profile.headline || 'Founder & Product Engineer'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {hero.availability_badge && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-emerald-400 font-medium">
                ● {hero.availability_badge}
              </span>
            )}
            <a href="#pitch" className="text-slate-400 hover:text-white transition">The Story</a>
            <a href="#ventures" className="text-slate-400 hover:text-white transition">Ventures</a>
            <a href="#contact" className="text-slate-400 hover:text-white transition">Connect</a>
          </div>
        </header>

        {/* Elevator Pitch & Hero */}
        <section id="pitch" className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-14 space-y-8 shadow-2xl">
          <div className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/30 px-4 py-1 text-xs font-semibold text-indigo-300">
            🚀 Venture Track Record &amp; Builds
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {hero.headline}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-light">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#ventures'}
                className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-7 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Narrative / About Founder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">Founder Narrative</h2>
            <h3 className="text-2xl font-bold text-white">{about.title || 'Building Zero to One'}</h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-4">Milestones</h2>
              <ul className="space-y-3 text-xs text-slate-300">
                {about.highlights?.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              OPERATING ETHOS: SPEED &amp; RIGOR
            </div>
          </div>
        </section>

        {/* Ventures / Projects */}
        <section id="ventures" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-2xl font-bold text-white">Ventures &amp; Products Shipped</h3>
            <span className="text-xs text-slate-400 font-mono">{projects?.length || 0} PORTFOLIO COMPANIES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between hover:border-indigo-500/40 transition space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-mono text-indigo-400">VENTURE 0{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] text-indigo-300 font-bold">
                        ACTIVE PRODUCT
                      </span>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-white">{proj.title}</h4>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{proj.description}</p>

                  {proj.problem && (
                    <div className="mt-4 rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
                      <strong className="text-indigo-400 block mb-1">MARKET NEED:</strong>
                      {proj.problem}
                    </div>
                  )}
                  {proj.impact && (
                    <div className="mt-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                      <strong>TRACTION:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies?.slice(0, 3).map((t, ti) => (
                      <span key={ti} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        Code
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold">
                        Live Product ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Track Record / Experience */}
        {experience && experience.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Leadership History</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/60 pb-4 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-white">{exp.role}</span>
                    <span className="text-indigo-400"> @ {exp.company}</span>
                    {exp.description && <p className="text-xs text-slate-400 mt-1">{exp.description}</p>}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{exp.start_date} — {exp.end_date || 'Present'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Founder Footer */}
        <footer id="contact" className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-950 p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-3xl font-extrabold text-white">Let's Discuss the Future</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {contact.message || 'Always open to investor dialogues, strategic co-founders, or enterprise pilots.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white hover:bg-indigo-500 transition">
                {social_links.email}
              </a>
            )}
            {social_links.twitter && (
              <a href={social_links.twitter} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-slate-200 hover:text-white transition">
                X / Twitter
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-slate-200 hover:text-white transition">
                LinkedIn
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
