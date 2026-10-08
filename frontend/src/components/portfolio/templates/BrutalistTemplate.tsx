import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const BrutalistTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#fffdf0] text-black font-mono selection:bg-[#ffdf00] selection:text-black p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Brutalist Header */}
        <header className="flex flex-wrap items-center justify-between border-4 border-black bg-[#ffdf00] p-6 shadow-[8px_8px_0px_#000]">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 border-4 border-black object-cover bg-white shadow-[4px_4px_0px_#000]"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white text-2xl font-black shadow-[4px_4px_0px_#000]">
                {(profile.name || 'B').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">{profile.name}</h1>
              <p className="text-xs sm:text-sm font-bold uppercase bg-black text-white px-2 py-0.5 inline-block mt-1">
                {profile.headline || 'SOFTWARE CRAFTSPERSON'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_#000]">
              📍 {profile.location || 'INTERNET'}
            </span>
            {hero.availability_badge && (
              <span className="border-2 border-black bg-[#00ff66] px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000]">
                ⚡ {hero.availability_badge}
              </span>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="border-4 border-black bg-white p-8 sm:p-12 shadow-[10px_10px_0px_#000]">
          <div className="inline-block border-2 border-black bg-[#ff6b6b] text-white px-3 py-1 text-xs font-black uppercase mb-6 shadow-[3px_3px_0px_#000]">
            ⚡ SYSTEM MANIFESTO
          </div>
          <h2 className="text-3xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            {hero.headline}
          </h2>
          <p className="mt-6 text-base sm:text-lg font-bold leading-relaxed text-neutral-800 max-w-3xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="border-4 border-black bg-[#00e5ff] px-8 py-3.5 text-base font-black uppercase tracking-wider shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000] transition active:translate-x-1.5 active:translate-y-1.5"
              >
                {hero.primary_cta_text} ➔
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="border-4 border-black bg-[#ffdf00] px-8 py-3.5 text-base font-black uppercase tracking-wider shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000] transition active:translate-x-1.5 active:translate-y-1.5"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* About Box */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border-4 border-black bg-[#e2f0d9] p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
            <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-3 mb-4">
              {about.title || 'RAW DISCLOSURE'}
            </h3>
            <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line text-neutral-900">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="border-4 border-black bg-[#fce5cd] p-6 shadow-[8px_8px_0px_#000] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2 mb-4">HIGHLIGHTS</h3>
              <ul className="space-y-2 text-xs font-bold">
                {about.highlights?.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000]">
                    <span>🔥</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 border-t-2 border-black pt-3 text-[11px] font-bold uppercase text-neutral-600">
              STATUS: AUDITED &amp; FACTUAL
            </div>
          </div>
        </section>

        {/* Skills Wall */}
        {skills && skills.length > 0 && (
          <section className="border-4 border-black bg-[#d9d2e9] p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center justify-between">
              <span>ARSENAL / TECH STACK</span>
              <span className="text-sm bg-black text-white px-2 py-0.5">{skills.length} WEAPONS</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="border-3 border-black bg-white px-3 py-1.5 text-xs font-black shadow-[3px_3px_0px_#000] hover:bg-[#ffdf00] transition cursor-default"
                >
                  {skill.name} {skill.proficiency ? `• ${skill.proficiency}%` : ''}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Grid */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-4 border-black bg-[#ff6b6b] text-white p-4 shadow-[8px_8px_0px_#000]">
            <h3 className="text-2xl sm:text-3xl font-black uppercase">WORKS / SHIPMENTS</h3>
            <span className="text-sm font-bold bg-black text-white px-3 py-1">PRODUCTION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_#000] transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
                    <span className="text-xs font-black bg-black text-white px-2 py-0.5">#{idx + 1}</span>
                    {proj.featured && (
                      <span className="text-xs font-black bg-[#ffdf00] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_#000]">
                        ★ FLAGSHIP
                      </span>
                    )}
                  </div>
                  <h4 className="text-2xl font-black uppercase text-black">{proj.title}</h4>
                  <p className="mt-3 text-sm font-medium text-neutral-800 leading-normal">{proj.description}</p>

                  {proj.problem && (
                    <div className="mt-3 border-2 border-black bg-[#ffebee] p-2 text-xs font-bold">
                      <strong>PROBLEM:</strong> {proj.problem}
                    </div>
                  )}
                  {proj.solution && (
                    <div className="mt-2 border-2 border-black bg-[#e8f5e9] p-2 text-xs font-bold">
                      <strong>SOLUTION:</strong> {proj.solution}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-black space-y-4">
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t, ti) => (
                        <span key={ti} className="border border-black bg-neutral-100 px-2 py-0.5 text-[11px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="border-2 border-black bg-white px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:bg-black hover:text-white transition"
                      >
                        CODE ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="border-2 border-black bg-[#00ff66] px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:bg-black hover:text-[#00ff66] transition"
                      >
                        LIVE ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience & Timeline */}
        {experience && experience.length > 0 && (
          <section className="border-4 border-black bg-[#c9daf8] p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6">FIELD EXPERIENCE</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-3 border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-black pb-2 mb-2">
                    <span className="text-lg font-black">{exp.role} @ {exp.company}</span>
                    <span className="text-xs font-bold bg-black text-white px-2 py-0.5">
                      {exp.start_date} — {exp.end_date || 'NOW'}
                    </span>
                  </div>
                  {exp.description && <p className="text-xs font-medium text-neutral-800">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Brutalist Contact Footer */}
        <footer id="contact" className="border-4 border-black bg-[#000] text-white p-8 sm:p-12 shadow-[10px_10px_0px_#ffdf00]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="text-xs font-black bg-[#ff6b6b] text-white px-2 py-1 uppercase">DIRECT WIRE</span>
              <h3 className="text-3xl sm:text-5xl font-black uppercase mt-3 text-[#ffdf00]">INITIATE CONTACT</h3>
              <p className="mt-3 text-xs sm:text-sm font-mono text-neutral-300 max-w-md">
                {contact.message || 'Ready to talk software, scale, contracts, or architectural challenges.'}
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {social_links.email && (
                <a
                  href={`mailto:${social_links.email}`}
                  className="block border-2 border-white bg-white text-black px-4 py-2 font-black shadow-[4px_4px_0px_#ffdf00] hover:bg-[#ffdf00] transition"
                >
                  ✉️ {social_links.email}
                </a>
              )}
              {social_links.github && (
                <a
                  href={social_links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-2 border-white bg-black text-white px-4 py-2 font-black hover:bg-neutral-800 transition"
                >
                  🐙 GITHUB REPOSITORY ↗
                </a>
              )}
              {social_links.linkedin && (
                <a
                  href={social_links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-2 border-white bg-black text-white px-4 py-2 font-black hover:bg-neutral-800 transition"
                >
                  💼 LINKEDIN PROFILE ↗
                </a>
              )}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase flex justify-between">
            <span>© {new Date().getFullYear()} {profile.name}</span>
            <span>BUILT WITH BUILDLOG</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
