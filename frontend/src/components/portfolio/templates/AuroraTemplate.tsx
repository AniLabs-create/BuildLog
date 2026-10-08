import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const AuroraTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden">
      {/* Aurora Ambient Background Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 -left-20 h-96 w-96 rounded-full bg-teal-500/15 blur-[150px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        {/* Navigation / Header */}
        <header className="mb-16 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/40" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-lg">
                {(profile.name || 'A').charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-white tracking-tight">{profile.name}</div>
              <div className="text-xs text-slate-400">{profile.headline}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            {hero.availability_badge && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-teal-300 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                {hero.availability_badge}
              </span>
            )}
            <a href="#projects" className="hover:text-purple-400 transition">Projects</a>
            <a href="#about" className="hover:text-purple-400 transition">About</a>
            <a href="#contact" className="hover:text-purple-400 transition">Contact</a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-24 text-center">
          <div className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-xs font-semibold text-purple-300 mb-6 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            ✨ {profile.location ? `${profile.location} • Portfolio` : 'Software Architecture'}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              {hero.headline}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] transition hover:opacity-95"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-7 py-3 text-sm font-medium text-slate-200 backdrop-blur-md transition hover:bg-white/[0.1] hover:text-white"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* About Card */}
        <section id="about" className="mb-20 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-8 sm:p-12 backdrop-blur-xl">
          <div className="max-w-3xl">
            <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-2">Narrative</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">{about.title || 'About & Philosophy'}</h3>
            <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line mb-8">
              {about.content || profile.long_bio || profile.short_bio}
            </p>

            {about.highlights && about.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-white/10">
                {about.highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Skills Orbit */}
        {skills && skills.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-4 text-center">Tech Stack &amp; Tools</h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="rounded-full border border-purple-500/20 bg-purple-950/30 px-4 py-2 text-xs font-medium text-purple-200 backdrop-blur-md transition hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  {skill.name} {skill.proficiency ? `• ${skill.proficiency}%` : ''}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Projects */}
        <section id="projects" className="mb-24">
          <div className="mb-10 text-center">
            <h2 className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-2">Portfolio Works</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">Highlighted Creations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 backdrop-blur-xl transition hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-purple-400">0{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-400/30 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
                        Featured
                      </span>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-white group-hover:text-purple-200 transition">{proj.title}</h4>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{proj.description}</p>

                  {proj.impact && (
                    <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-xs text-teal-300">
                      <strong>Impact:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-slate-400">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 transition">
                        Source ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 transition">
                        Live App ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Timeline */}
        {experience && experience.length > 0 && (
          <section className="mb-24">
            <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-8 text-center">Career Journey</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-lg font-bold text-white">{exp.role} · <span className="text-purple-300">{exp.company}</span></h4>
                    <span className="text-xs text-slate-400 font-mono">{exp.start_date} — {exp.end_date || 'Present'}</span>
                  </div>
                  {exp.description && <p className="mt-2 text-sm text-slate-300">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Footer */}
        <footer id="contact" className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-teal-900/30 p-8 sm:p-12 text-center backdrop-blur-xl">
          <h3 className="text-3xl font-extrabold text-white">Let's Connect</h3>
          <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
            {contact.message || 'Always excited to explore new challenges, architectural ventures, or collaborative opportunities.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {social_links.email && (
              <a
                href={`mailto:${social_links.email}`}
                className="rounded-xl bg-white px-6 py-2.5 text-xs font-semibold text-slate-900 shadow-lg hover:bg-slate-100 transition"
              >
                Email: {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a
                href={social_links.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                GitHub
              </a>
            )}
            {social_links.linkedin && (
              <a
                href={social_links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                LinkedIn
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
