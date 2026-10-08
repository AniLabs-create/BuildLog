import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const MinimalTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, social_links, contact, theme } = data;
  const primaryColor = theme.primary_color || '#10b981';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Navigation */}
        <header className="mb-20 flex items-center justify-between border-b border-zinc-850 pb-6">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover border border-zinc-750" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-850 font-mono text-sm font-bold text-white">
                {(profile.name || 'D').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="font-semibold text-white tracking-tight">{profile.name || 'Developer'}</span>
              <p className="text-xs text-zinc-400">{profile.headline || 'Software Engineer'}</p>
            </div>
          </div>
          <nav className="flex items-center gap-5 text-xs text-zinc-400">
            <a href="#projects" className="hover:text-white transition">Projects</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mb-24">
          {hero.availability_badge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {hero.availability_badge}
            </span>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.1]">
            {hero.headline}
          </h1>
          <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {hero.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:text-white"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Featured Projects */}
        <section id="projects" className="mb-24 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-8 border-b border-zinc-850 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Featured Projects</h2>
            <span className="font-mono text-xs text-zinc-500">{projects.length} Works</span>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No projects listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {projects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className={`group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all hover:border-zinc-700 ${
                    project.featured ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {project.problem && (
                    <div className="mt-4 rounded-lg bg-zinc-950/60 p-3 text-xs text-zinc-400 border border-zinc-850">
                      <span className="font-semibold text-zinc-300">Challenge: </span>
                      {project.problem}
                    </div>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-4 pt-4 border-t border-zinc-850/80 text-xs font-mono">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition">
                        Source &rarr;
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                        Live Demo &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className="mb-24">
            <h2 className="text-xl font-bold tracking-tight text-white mb-6 border-b border-zinc-850 pb-3">
              Technical Proficiencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300"
                >
                  <span className="font-medium text-white">{skill.name}</span>
                  {skill.proficiency && (
                    <span className="ml-1.5 text-[10px] font-mono text-zinc-500">({skill.proficiency})</span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        <section id="about" className="mb-24 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 border-b border-zinc-850 pb-3">
            {about.title || 'About Me'}
          </h2>
          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-sm">
            <p>{about.content || profile.short_bio}</p>
          </div>
          {about.highlights && about.highlights.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              {about.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {h}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Contact & Footer */}
        <footer id="contact" className="border-t border-zinc-850 pt-12">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-white">{contact.cta_title || "Let's build together"}</h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">{contact.cta_subtitle}</p>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Send Message ({contact.email})
              </a>
            )}
            <div className="mt-8 flex justify-center gap-6 text-xs text-zinc-400 font-mono">
              {social_links.github && (
                <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a>
              )}
              {social_links.linkedin && (
                <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition">LinkedIn</a>
              )}
              {social_links.twitter && (
                <a href={social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-white transition">Twitter / X</a>
              )}
            </div>
          </div>
          <p className="mt-8 text-center font-mono text-[11px] text-zinc-600">
            Powered by BuildLog Portfolio
          </p>
        </footer>
      </div>
    </div>
  );
};
