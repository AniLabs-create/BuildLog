import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const StudentTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, education, achievements, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0e131f] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Campus / Student Top Navigation */}
        <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-sky-400" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-slate-950 font-black text-xl">
                {(profile.name || 'S').charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-white">{profile.name}</div>
              <div className="text-xs text-sky-400 font-medium">
                {profile.headline || 'Computer Science Student & Aspiring Software Engineer'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {education && education.length > 0 && (
              <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 text-sky-300 font-medium">
                🎓 {education[0].institution}
              </span>
            )}
            {hero.availability_badge && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-emerald-400 font-medium">
                ● {hero.availability_badge}
              </span>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 space-y-6">
          <span className="inline-block rounded-full bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 text-xs font-semibold text-sky-300">
            🚀 Junior Developer • Hackathon Builder
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {hero.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Education & About */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-400">My Story</h2>
            <h3 className="text-xl font-bold text-white">{about.title || 'Learning by Building'}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-400">Education</h2>
            {education?.map((edu, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="font-bold text-white">{edu.institution}</div>
                <div className="text-sky-300">{edu.degree} in {edu.field}</div>
                <div className="text-slate-400">{edu.start_date} – {edu.end_date || 'Present'}</div>
                {edu.grade && <div className="text-slate-300 font-mono">GPA: {edu.grade}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Projects / Hackathon Builds */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white">Hackathons &amp; Personal Projects</h3>
            <span className="text-xs text-slate-400 font-mono">{projects?.length || 0} Builds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-sky-500/40 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-sky-400 font-mono">BUILD #{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] text-sky-300 font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white">{proj.title}</h4>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
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
                        Repo
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300">
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hackathon Wins / Achievements */}
        {achievements && achievements.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-sky-400">Honors &amp; Hackathon Wins</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-1">
                  <div className="font-bold text-white text-sm">🏆 {ach.title}</div>
                  <div className="text-sky-300">{ach.organization} {ach.date && `• ${ach.date}`}</div>
                  {ach.description && <p className="text-slate-400 pt-1">{ach.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Wall */}
        {skills && skills.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-sky-400">Languages &amp; Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="rounded-lg border border-slate-800 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact Footer */}
        <footer id="contact" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Let's Connect</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {contact.message || 'Open to internship opportunities, junior engineering roles, and open-source collaborations.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="text-sky-400 hover:underline">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                GitHub ↗
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                LinkedIn ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
