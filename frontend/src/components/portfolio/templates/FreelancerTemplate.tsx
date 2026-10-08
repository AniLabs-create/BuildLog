import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const FreelancerTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Navigation & Availability */}
        <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-500/50" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-xl">
                {(profile.name || 'F').charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-white">{profile.name}</div>
              <div className="text-xs text-amber-400 font-medium">{profile.headline || 'Senior Software Consultant'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {hero.availability_badge || 'Available for Contracts'}
            </span>
            <a
              href={`mailto:${contact.email || social_links.email || ''}`}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              Hire Me
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 sm:p-14 space-y-6">
          <div className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Freelance &amp; Engineering Advisory
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            {hero.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Services & Value Props */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-widest text-amber-400">Working Together</h2>
            <h3 className="text-2xl font-bold text-white">{about.title || 'How I Deliver Value'}</h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-4">Core Guarantees</h2>
              <ul className="space-y-3 text-xs text-slate-300">
                {about.highlights?.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">★</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 text-[11px] text-slate-500 font-mono">
              DIRECT ENGINEER-CLIENT ACCESS
            </div>
          </div>
        </section>

        {/* Selected Client Work / Projects */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-2xl font-bold text-white">Client Projects &amp; Case Studies</h3>
            <span className="text-xs text-slate-400 font-mono">{projects?.length || 0} Case Studies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7 flex flex-col justify-between hover:border-amber-500/40 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-amber-400 font-mono">CASE 0{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] text-amber-300 font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white">{proj.title}</h4>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{proj.description}</p>

                  {proj.impact && (
                    <div className="mt-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                      <strong>Client Result:</strong> {proj.impact}
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
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 font-bold">
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Toolkit */}
        {skills && skills.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-amber-400">Consulting Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="rounded-lg border border-slate-800 bg-slate-800/80 px-3.5 py-1.5 text-xs text-slate-200">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact Footer */}
        <footer id="contact" className="rounded-3xl border border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-8 sm:p-14 text-center space-y-4">
          <h3 className="text-3xl font-extrabold text-white">Let's discuss your next sprint</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {contact.message || 'Book an initial discovery call or send over your product specifications for an immediate estimate.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {social_links.email && (
              <a
                href={`mailto:${social_links.email}`}
                className="rounded-xl bg-amber-500 px-7 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-400 transition"
              >
                Send Brief: {social_links.email}
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition">
                LinkedIn ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
