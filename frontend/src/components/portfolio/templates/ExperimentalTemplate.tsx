import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const ExperimentalTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-200 font-sans selection:bg-amber-400 selection:text-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Sticky Identity & Hero Pane */}
          <aside className="lg:col-span-5 lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] flex flex-col justify-between py-4">
            <div className="space-y-8">
              {/* Profile Head */}
              <div className="flex items-center gap-4">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400/50" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-black font-black text-2xl">
                    {(profile.name || 'X').charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name}</h1>
                  <p className="text-xs font-mono text-amber-400 mt-0.5">{profile.headline || 'Creative Technologist'}</p>
                </div>
              </div>

              {/* Status Badge */}
              {hero.availability_badge && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  {hero.availability_badge}
                </div>
              )}

              {/* Hero Statement */}
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]">
                  {hero.headline}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {hero.subheadline || profile.short_bio}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {hero.primary_cta_text && (
                  <a
                    href={hero.primary_cta_url || '#projects'}
                    className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-300 transition"
                  >
                    {hero.primary_cta_text}
                  </a>
                )}
                {hero.secondary_cta_text && (
                  <a
                    href={hero.secondary_cta_url || '#contact'}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition"
                  >
                    {hero.secondary_cta_text}
                  </a>
                )}
              </div>
            </div>

            {/* Left Column Bottom Social Links */}
            <div className="pt-8 border-t border-zinc-850 flex items-center gap-4 text-xs font-mono text-zinc-400">
              {social_links.github && (
                <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">
                  GH ↗
                </a>
              )}
              {social_links.linkedin && (
                <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">
                  IN ↗
                </a>
              )}
              {social_links.twitter && (
                <a href={social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">
                  X ↗
                </a>
              )}
              {social_links.email && (
                <a href={`mailto:${social_links.email}`} className="hover:text-amber-400 transition">
                  MAIL ↗
                </a>
              )}
            </div>
          </aside>

          {/* Right Column: Scrollable Feed */}
          <main className="lg:col-span-7 space-y-16">
            {/* About Section */}
            <section id="about" className="rounded-3xl border border-zinc-850 bg-zinc-900/40 p-8 space-y-4">
              <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">01 // MANIFESTO</span>
              <h3 className="text-2xl font-bold text-white">{about.title || 'About & Vision'}</h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {about.content || profile.long_bio || profile.short_bio}
              </p>

              {about.highlights && about.highlights.length > 0 && (
                <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-300">
                      <span className="text-amber-400 font-bold">›</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Skills Array */}
            {skills && skills.length > 0 && (
              <section className="rounded-3xl border border-zinc-850 bg-zinc-900/40 p-8 space-y-4">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">02 // ARSENAL</span>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs text-zinc-300 font-mono"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Feed */}
            <section id="projects" className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">03 // SELECTED WORKS</span>
                <span className="text-xs font-mono text-zinc-500">{projects?.length || 0} ITEMS</span>
              </div>

              <div className="space-y-6">
                {projects?.map((proj, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-zinc-850 bg-zinc-900/50 p-7 space-y-4 hover:border-amber-400/40 transition group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-400">PRJ #{idx + 1}</span>
                      {proj.featured && (
                        <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] text-amber-300 font-mono">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <h4 className="text-2xl font-bold text-white group-hover:text-amber-400 transition">{proj.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{proj.description}</p>

                    {proj.impact && (
                      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-300 font-mono">
                        <strong className="text-amber-400">OUTCOME:</strong> {proj.impact}
                      </div>
                    )}

                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1 font-mono text-[10px] text-zinc-500">
                        {proj.technologies?.map((tech, ti) => (
                          <span key={ti} className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                            SRC ↗
                          </a>
                        )}
                        {proj.demo_url && (
                          <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                            DEMO ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience Feed */}
            {experience && experience.length > 0 && (
              <section className="space-y-6">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">04 // TRAJECTORY</span>
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-5 space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between text-sm">
                        <span className="font-bold text-white">{exp.role} <span className="text-amber-400">@ {exp.company}</span></span>
                        <span className="text-xs font-mono text-zinc-500">{exp.start_date} — {exp.end_date || 'Present'}</span>
                      </div>
                      {exp.description && <p className="text-xs text-zinc-400 leading-relaxed pt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Card */}
            <footer id="contact" className="rounded-3xl border border-zinc-850 bg-gradient-to-br from-zinc-900 to-black p-8 text-center space-y-4">
              <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">05 // TRANSMIT</span>
              <h3 className="text-2xl font-bold text-white">Let's connect &amp; engineer</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {contact.message || 'Always open to new projects, technical conversations, and high-impact engineering roles.'}
              </p>

              <div className="pt-2">
                {social_links.email && (
                  <a
                    href={`mailto:${social_links.email}`}
                    className="inline-block rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold uppercase text-black hover:bg-amber-300 transition"
                  >
                    Email: {social_links.email}
                  </a>
                )}
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};
