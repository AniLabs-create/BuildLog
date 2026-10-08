import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const NoirTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Ambient background aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-1/2 left-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {/* Top Header */}
        <header className="mb-24 flex items-center justify-between border-b border-zinc-800/80 pb-8">
          <div className="flex items-center gap-4">
            {profile.avatar && (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-amber-500/30 shadow-lg" />
            )}
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-white">{profile.name || 'Developer'}</span>
              <p className="font-mono text-xs text-amber-400/80 tracking-widest uppercase">{profile.headline || 'Software Craftsman'}</p>
            </div>
          </div>
          <nav className="flex items-center gap-6 font-mono text-xs tracking-wider uppercase text-zinc-400">
            <a href="#work" className="hover:text-amber-300 transition">Selected Work</a>
            <a href="#about" className="hover:text-amber-300 transition">Biography</a>
            <a href="#contact" className="hover:text-amber-300 transition">Connect</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mb-32">
          {hero.availability_badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono text-amber-300 mb-8 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              {hero.availability_badge}
            </div>
          )}
          <h1 className="font-serif text-4xl sm:text-7xl font-normal tracking-tight text-white leading-[1.08]">
            {hero.headline}
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-zinc-400 font-light leading-relaxed max-w-3xl">
            {hero.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href={hero.primary_cta_url || '#work'}
              className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.25)] transition hover:brightness-110"
            >
              {hero.primary_cta_text || 'View Selected Work'}
            </a>
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-amber-500/40 hover:text-white"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Selected Work */}
        <section id="work" className="mb-32 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-12 border-b border-zinc-850 pb-4">
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">Curated Projects</h2>
            <span className="font-mono text-xs text-amber-400/70 tracking-widest uppercase">Archive / 01</span>
          </div>

          <div className="space-y-12">
            {projects.map((project, idx) => (
              <div
                key={project.id || idx}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/70 to-zinc-950 p-8 sm:p-10 shadow-2xl transition-all hover:border-amber-500/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <span className="font-mono text-xs text-amber-400/80 tracking-widest uppercase">Project 0{idx + 1}</span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 px-3.5 py-2 font-mono text-xs text-zinc-300 transition hover:border-amber-500/40 hover:text-white">
                        Code ↗
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noreferrer" className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-3.5 py-2 font-mono text-xs text-amber-300 transition hover:bg-amber-500/25">
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>

                {project.impact && (
                  <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300 font-mono">
                    ✦ {project.impact}
                  </div>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-zinc-850">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 font-mono text-xs text-zinc-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Expertise */}
        {skills.length > 0 && (
          <section className="mb-32">
            <h2 className="font-serif text-3xl font-bold text-white mb-8 border-b border-zinc-850 pb-4">
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {skills.map((skill) => (
                <div key={skill.name} className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 transition hover:border-zinc-750">
                  <p className="font-semibold text-white text-sm">{skill.name}</p>
                  <p className="font-mono text-xs text-amber-400/80 mt-1">{skill.category}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Biography */}
        <section id="about" className="mb-32 scroll-mt-20">
          <h2 className="font-serif text-3xl font-bold text-white mb-8 border-b border-zinc-850 pb-4">
            {about.title || 'Biography'}
          </h2>
          <div className="prose prose-invert max-w-none font-light text-zinc-300 text-base leading-relaxed">
            <p>{about.content || profile.short_bio}</p>
          </div>
        </section>

        {/* Contact Footer */}
        <footer id="contact" className="border-t border-zinc-800 pt-16">
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-10 text-center sm:p-16 shadow-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">{contact.cta_title || 'Initiate Contact'}</h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto text-sm font-light">{contact.cta_subtitle}</p>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-lg transition hover:brightness-110"
              >
                {contact.email}
              </a>
            )}
            <div className="mt-10 flex justify-center gap-8 font-mono text-xs text-zinc-400 tracking-wider">
              {social_links.github && <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:text-amber-300 transition">GITHUB</a>}
              {social_links.linkedin && <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-amber-300 transition">LINKEDIN</a>}
              {social_links.twitter && <a href={social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-amber-300 transition">TWITTER</a>}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
