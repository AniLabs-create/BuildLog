import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const StudioTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#111113] text-neutral-100 font-sans antialiased selection:bg-[#ff5533]/30 selection:text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-20 space-y-24">
        {/* Studio Minimal Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-8">
          <div className="flex items-center gap-4">
            {profile.avatar && (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-full object-cover grayscale" />
            )}
            <div>
              <div className="text-xl font-bold tracking-tight text-white">{profile.name}</div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest">{profile.headline || 'Independent Studio'}</div>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-xs uppercase tracking-widest font-semibold text-neutral-400">
            <a href="#work" className="hover:text-white transition">Work</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
        </header>

        {/* Hero Showcase */}
        <section className="space-y-8">
          {hero.availability_badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-xs font-medium text-[#ff5533]">
              <span className="h-2 w-2 rounded-full bg-[#ff5533]" />
              {hero.availability_badge}
            </div>
          )}

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95]">
            {hero.headline}
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-neutral-400 font-light leading-relaxed">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#work'}
                className="rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#ff5533] hover:text-white transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-full border border-neutral-700 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:border-white hover:text-white transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Selected Works / Large Cards */}
        <section id="work" className="space-y-12">
          <div className="flex items-baseline justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">Selected Works</h2>
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500">
              {projects?.length || 0} Case Studies
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="group rounded-3xl border border-neutral-800 bg-neutral-900/30 p-8 sm:p-12 hover:border-neutral-600 transition space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs uppercase font-mono tracking-widest text-[#ff5533]">0{idx + 1} — Project</div>
                  {proj.featured && (
                    <span className="text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#ff5533]/10 text-[#ff5533] px-3 py-1 border border-[#ff5533]/20">
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white group-hover:text-[#ff5533] transition">
                    {proj.title}
                  </h3>
                  <p className="text-neutral-400 text-base leading-relaxed max-w-3xl">
                    {proj.description}
                  </p>
                </div>

                {proj.impact && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300 font-mono">
                    <span className="text-[#ff5533] font-bold">OUTCOME // </span> {proj.impact}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="text-xs text-neutral-400 font-mono">
                        #{tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-xs uppercase font-bold tracking-wider">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition">
                        Source ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-white hover:text-[#ff5533] transition">
                        Live Case ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative / About Studio */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-neutral-800 pt-16">
          <div className="lg:col-span-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#ff5533] mb-2">Practice &amp; Method</h3>
            <h4 className="text-3xl font-bold text-white">{about.title || 'About The Craft'}</h4>
          </div>

          <div className="lg:col-span-8 space-y-6 text-neutral-300 text-base leading-relaxed">
            <p className="whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>

            {skills && skills.length > 0 && (
              <div className="pt-8 border-t border-neutral-800">
                <h5 className="text-xs uppercase font-mono tracking-widest text-neutral-500 mb-4">Core Disciplines</h5>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span key={idx} className="rounded-full border border-neutral-800 px-4 py-1.5 text-xs text-neutral-300 hover:border-neutral-600 transition">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Experience Log */}
        {experience && experience.length > 0 && (
          <section className="space-y-8 border-t border-neutral-800 pt-16">
            <h3 className="text-2xl font-bold text-white">Experience &amp; Engagements</h3>
            <div className="divide-y divide-neutral-800">
              {experience.map((exp, idx) => (
                <div key={idx} className="py-6 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{exp.role} <span className="text-neutral-500">at</span> {exp.company}</h4>
                    {exp.description && <p className="text-xs text-neutral-400 mt-1 max-w-xl">{exp.description}</p>}
                  </div>
                  <span className="text-xs font-mono text-neutral-500">{exp.start_date} — {exp.end_date || 'Present'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Studio Footer */}
        <footer id="contact" className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-10 sm:p-16 text-center space-y-6">
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Have a project in mind?</h3>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm">
            {contact.message || 'Currently reviewing new product design and architecture engagements for this quarter.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {social_links.email && (
              <a
                href={`mailto:${social_links.email}`}
                className="rounded-full bg-[#ff5533] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
              >
                Inquire: {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="rounded-full border border-neutral-700 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-white transition">
                GitHub
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-neutral-700 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-white transition">
                LinkedIn
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
