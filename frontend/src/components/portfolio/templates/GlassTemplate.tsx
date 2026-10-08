import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';
export const GlassTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative p-4 sm:p-8">
      {/* Background Glows for glass refraction */}
      <div className="fixed top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="fixed bottom-1/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Glass Navigation Header */}
        <header className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:px-6 backdrop-blur-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white font-bold">
                {(profile.name || 'G').charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-white">{profile.name}</div>
              <div className="text-xs text-gray-400">{profile.headline}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {hero.availability_badge && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                ● {hero.availability_badge}
              </span>
            )}
            <a href="#projects" className="text-gray-300 hover:text-white transition">Projects</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
          </div>
        </header>

        {/* Hero Card */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300 mb-6">
              {profile.location || 'Distributed'}
            </span>
            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {hero.headline}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed">
              {hero.subheadline || profile.short_bio}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {hero.primary_cta_text && (
                <a
                  href={hero.primary_cta_url || '#projects'}
                  className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition shadow-lg"
                >
                  {hero.primary_cta_text}
                </a>
              )}
              {hero.secondary_cta_text && (
                <a
                  href={hero.secondary_cta_url || '#contact'}
                  className="rounded-xl border border-white/5 bg-transparent px-6 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  {hero.secondary_cta_text}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About & Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-xl">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">Background</h2>
            <h3 className="text-2xl font-bold text-white mb-4">{about.title || 'About'}</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-4">Pillars</h2>
              <ul className="space-y-3 text-xs text-gray-300">
                {about.highlights?.map((h, i) => (
                  <li key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 text-[11px] text-gray-500">ENGINEER PROFILE</div>
          </div>
        </section>

        {/* Skills Pills */}
        {skills && skills.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-xl">
            <h3 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-4">Competencies</h3>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-md hover:border-cyan-400/40 transition"
                >
                  {skill.name} {skill.proficiency ? `(${skill.proficiency}%)` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects Grid */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-white">Featured Projects</h3>
            <span className="text-xs text-gray-400 font-mono">{projects?.length || 0} ITEMS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl shadow-xl flex flex-col justify-between hover:border-white/20 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-mono text-cyan-400">0{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] text-cyan-300">
                        Featured
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white group-hover:text-cyan-200 transition">{proj.title}</h4>
                  <p className="mt-3 text-sm text-gray-300 leading-relaxed">{proj.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t, ti) => (
                        <span key={ti} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">
                        Repository ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-white hover:text-cyan-300">
                        Live Preview ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Cards */}
        {experience && experience.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-xl space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-wider text-cyan-400">Work Experience</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-white">{exp.role} <span className="text-cyan-300">@ {exp.company}</span></span>
                    <span className="text-xs text-gray-400 font-mono">{exp.start_date} — {exp.end_date || 'Present'}</span>
                  </div>
                  {exp.description && <p className="mt-2 text-xs text-gray-300 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Glass Footer */}
        <footer id="contact" className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center backdrop-blur-2xl shadow-xl">
          <h3 className="text-2xl font-bold text-white">Get in Touch</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            {contact.message || 'Always happy to talk tech stack, distributed architectures, or engineering leadership.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-medium">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-white hover:bg-white/20 transition">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-gray-300 hover:text-white transition">
                GitHub
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-gray-300 hover:text-white transition">
                LinkedIn
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
