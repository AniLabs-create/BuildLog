import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const SwissTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#111111] font-sans antialiased selection:bg-[#ff3b30] selection:text-white">
      {/* Top Banner Grid */}
      <div className="border-b-2 border-black">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="h-4 w-4 bg-[#ff3b30] inline-block" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              {profile.name || 'INDEX'} / {profile.headline || 'PORTFOLIO'}
            </span>
          </div>
          <div className="font-mono text-xs text-neutral-600">
            LOC: {profile.location || 'GLOBAL'} — STATUS: {hero.availability_badge || 'AVAILABLE'}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Massive Hero Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-2 border-black bg-white mb-16 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="lg:col-span-8 p-8 sm:p-14 border-b-2 lg:border-b-0 lg:border-r-2 border-black flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ff3b30] mb-4 block">
                [ 01. PRINCIPAL IDENTITY ]
              </span>
              <h1 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.95] text-black">
                {hero.headline || profile.name}
              </h1>
              <p className="mt-8 text-lg sm:text-xl font-medium leading-relaxed text-neutral-800 max-w-2xl">
                {hero.subheadline || profile.short_bio}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 font-mono text-xs uppercase font-bold">
              {hero.primary_cta_text && (
                <a
                  href={hero.primary_cta_url || '#projects'}
                  className="px-6 py-3 bg-black text-white hover:bg-[#ff3b30] transition"
                >
                  {hero.primary_cta_text} →
                </a>
              )}
              {hero.secondary_cta_text && (
                <a
                  href={hero.secondary_cta_url || '#contact'}
                  className="px-6 py-3 border-2 border-black bg-white text-black hover:bg-neutral-100 transition"
                >
                  {hero.secondary_cta_text}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 p-8 sm:p-10 bg-[#ebebe6] flex flex-col justify-between">
            {profile.avatar && (
              <div className="relative mb-6">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-64 object-cover border-2 border-black filter grayscale contrast-125"
                />
                <div className="absolute bottom-2 right-2 bg-black text-white font-mono text-[10px] px-2 py-0.5">
                  FIG. 1.0
                </div>
              </div>
            )}
            <div className="space-y-3 font-mono text-xs">
              <div className="border-t border-black pt-2 flex justify-between">
                <span className="font-bold">CREATOR</span>
                <span>{profile.name}</span>
              </div>
              <div className="border-t border-black pt-2 flex justify-between">
                <span className="font-bold">ROLE</span>
                <span>{profile.headline}</span>
              </div>
              <div className="border-t border-black pt-2 flex justify-between">
                <span className="font-bold">PROJECTS</span>
                <span>{projects?.length || 0} WORKS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: About & Focus */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-4 font-mono">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff3b30] block mb-2">
              [ 02. SYSTEM BACKGROUND ]
            </span>
            <h2 className="text-3xl font-black tracking-tight uppercase">{about.title || 'APPROACH & SYSTEM'}</h2>
          </div>

          <div className="lg:col-span-8 bg-white border-2 border-black p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <p className="text-base sm:text-lg leading-relaxed text-neutral-800 whitespace-pre-line mb-6">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
            {about.highlights && about.highlights.length > 0 && (
              <div className="border-t-2 border-black pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {about.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#ff3b30] mt-0.5">0{i + 1}</span>
                    <span className="text-sm font-medium text-neutral-800">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 03: Skills Matrix */}
        {skills && skills.length > 0 && (
          <section className="mb-16">
            <div className="font-mono mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff3b30] block mb-1">
                [ 03. CAPABILITIES ]
              </span>
              <h2 className="text-3xl font-black uppercase">CORE COMPETENCIES</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="border-2 border-black bg-white p-3 flex flex-col justify-between hover:bg-[#ff3b30] hover:text-white transition group"
                >
                  <span className="font-mono text-[10px] text-neutral-500 group-hover:text-white">0{i + 1}</span>
                  <span className="font-bold text-sm mt-2">{s.name}</span>
                  <span className="font-mono text-[10px] uppercase text-neutral-600 group-hover:text-white mt-1">
                    {s.proficiency ? `${s.proficiency}%` : s.category || 'skill'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 04: Projects Grid */}
        <section id="projects" className="mb-16">
          <div className="font-mono mb-6 flex flex-wrap items-baseline justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff3b30] block mb-1">
                [ 04. PRODUCTION REGISTRY ]
              </span>
              <h2 className="text-3xl font-black uppercase">SELECTED WORKS</h2>
            </div>
            <span className="text-xs font-mono text-neutral-600">INDEX: 01 — {projects?.length || 0}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="border-2 border-black bg-white flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition"
              >
                <div className="p-6 border-b-2 border-black">
                  <div className="flex items-center justify-between font-mono text-xs mb-3">
                    <span className="bg-black text-white px-2 py-0.5 font-bold">PRJ-0{idx + 1}</span>
                    {proj.featured && (
                      <span className="bg-[#ff3b30] text-white px-2 py-0.5 font-bold uppercase">FEATURED</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-3">{proj.title}</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed mb-4">{proj.description}</p>
                  {proj.impact && (
                    <div className="font-mono text-xs bg-neutral-100 p-2.5 border-l-4 border-black">
                      <strong>OUTCOME:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="bg-neutral-200 px-2 py-0.5 text-neutral-800">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs font-bold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="hover:text-[#ff3b30]">
                        SRC ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="hover:text-[#ff3b30]">
                        DEMO ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 05: Experience & Timeline */}
        {experience && experience.length > 0 && (
          <section className="mb-16">
            <div className="font-mono mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff3b30] block mb-1">
                [ 05. EXPERIENCE CHRONOLOGY ]
              </span>
              <h2 className="text-3xl font-black uppercase">CAREER LOG</h2>
            </div>
            <div className="border-2 border-black bg-white divide-y-2 divide-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 font-mono">
                    <span className="text-xs text-neutral-500 font-bold block">PERIOD</span>
                    <span className="font-bold text-sm text-black">
                      {exp.start_date} — {exp.end_date || 'CURRENT'}
                    </span>
                    <span className="block text-xs text-neutral-600 mt-2">{exp.company}</span>
                  </div>
                  <div className="md:col-span-8">
                    <h3 className="text-xl font-black uppercase text-black mb-2">{exp.role}</h3>
                    {exp.description && <p className="text-neutral-700 text-sm leading-relaxed mb-3">{exp.description}</p>}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-1 font-mono text-xs text-neutral-800 list-disc list-inside">
                        {exp.achievements.map((ach, ai) => (
                          <li key={ai}>{ach}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer & Contact */}
        <footer id="contact" className="border-2 border-black bg-black text-white p-8 sm:p-12 shadow-[8px_8px_0px_rgba(255,59,48,1)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <span className="font-mono text-xs font-bold uppercase text-[#ff3b30] block mb-2">[ 06. CONTACT ]</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">LET'S BUILD TOGETHER.</h2>
              <p className="mt-4 text-neutral-400 max-w-xl text-sm">
                {contact.message || 'Open to technical advisory, senior architecture roles, and breakthrough engineering initiatives.'}
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col justify-between font-mono text-xs space-y-4">
              <div className="space-y-2">
                {social_links.email && (
                  <a href={`mailto:${social_links.email}`} className="block text-[#ff3b30] hover:underline font-bold">
                    EMAIL: {social_links.email}
                  </a>
                )}
                {social_links.github && (
                  <a href={social_links.github} target="_blank" rel="noreferrer" className="block text-neutral-300 hover:text-white">
                    GITHUB ↗
                  </a>
                )}
                {social_links.linkedin && (
                  <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="block text-neutral-300 hover:text-white">
                    LINKEDIN ↗
                  </a>
                )}
                {social_links.twitter && (
                  <a href={social_links.twitter} target="_blank" rel="noreferrer" className="block text-neutral-300 hover:text-white">
                    X / TWITTER ↗
                  </a>
                )}
              </div>
              <div className="text-[10px] text-neutral-600 uppercase">
                DESIGN SYSTEM: SWISS / INTERNATIONAL TYPOGRAPHIC STYLE
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
