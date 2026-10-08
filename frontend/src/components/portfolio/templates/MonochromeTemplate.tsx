import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const MonochromeTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black p-4 sm:p-12">
      <div className="mx-auto max-w-4xl space-y-20">
        {/* Stark Header */}
        <header className="border-b border-white/20 pb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">{profile.name}</h1>
            <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">{profile.headline || 'Software Engineer'}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-neutral-400">
            {hero.availability_badge && (
              <span className="border border-white/40 px-2 py-0.5 text-white">
                {hero.availability_badge}
              </span>
            )}
            <a href="#work" className="hover:text-white transition">Index</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="space-y-8">
          <div className="text-xs uppercase font-mono tracking-widest text-neutral-500">
            STATEMENT // 01
          </div>

          <h2 className="text-4xl sm:text-7xl font-extrabold uppercase tracking-tighter leading-[0.95]">
            {hero.headline}
          </h2>

          <p className="text-lg sm:text-xl text-neutral-400 font-light leading-relaxed max-w-2xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 text-xs font-mono uppercase tracking-widest">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#work'}
                className="bg-white text-black px-8 py-3.5 font-bold hover:bg-neutral-200 transition"
              >
                {hero.primary_cta_text} →
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="border border-white text-white px-8 py-3.5 hover:bg-white hover:text-black transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Narrative / About */}
        <section className="border-t border-white/20 pt-16 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 font-mono text-xs uppercase tracking-widest text-neutral-500">
            PERSPECTIVE // 02
          </div>
          <div className="md:col-span-8 space-y-6">
            <h3 className="text-2xl font-bold uppercase">{about.title || 'Background'}</h3>
            <p className="text-neutral-300 leading-relaxed text-base whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>
        </section>

        {/* Projects / Works */}
        <section id="work" className="border-t border-white/20 pt-16 space-y-12">
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">SELECTED REPERTORY // 03</div>
            <span className="font-mono text-xs text-neutral-500">{projects?.length || 0} WORKS</span>
          </div>

          <div className="divide-y divide-white/20">
            {projects?.map((proj, idx) => (
              <div key={idx} className="py-8 space-y-4 group">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h4 className="text-2xl sm:text-3xl font-extrabold uppercase group-hover:underline">
                    {proj.title}
                  </h4>
                  <span className="font-mono text-xs text-neutral-500">0{idx + 1}</span>
                </div>

                <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">{proj.description}</p>

                {proj.impact && (
                  <div className="text-xs font-mono text-neutral-300 border-l border-white pl-3">
                    {proj.impact}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 font-mono text-xs">
                  <div className="flex flex-wrap gap-2 text-neutral-500">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti}>[{tech}]</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-white hover:underline">
                        SOURCE ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-white hover:underline">
                        LIVE ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="border-t border-white/20 pt-16 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">CAPABILITIES // 04</div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="border border-white/30 px-3 py-1 font-mono text-xs text-neutral-200">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="border-t border-white/20 pt-16 space-y-8">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">CHRONICLE // 05</div>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h5 className="font-bold text-lg uppercase">{exp.role} — {exp.company}</h5>
                    {exp.description && <p className="text-xs text-neutral-400 mt-1 max-w-xl">{exp.description}</p>}
                  </div>
                  <span className="font-mono text-xs text-neutral-500">{exp.start_date} — {exp.end_date || 'NOW'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Contact */}
        <footer id="contact" className="border-t border-white/20 pt-16 pb-8 space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">DISPATCH // 06</div>
          <h4 className="text-3xl sm:text-5xl font-black uppercase">COMMUNICATION</h4>
          <p className="text-neutral-400 text-sm max-w-md">
            {contact.message || 'Direct queries and technical requests to the address below.'}
          </p>

          <div className="flex flex-wrap gap-6 font-mono text-xs uppercase pt-2">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="text-white hover:underline">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white">
                GITHUB ↗
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white">
                LINKEDIN ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
