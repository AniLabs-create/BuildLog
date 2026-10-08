import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const CyberTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#08090d] text-[#c0caf5] font-mono selection:bg-[#00f0ff] selection:text-black p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* HUD Top Bar */}
        <header className="border border-[#00f0ff]/40 bg-[#0e1117] p-4 relative shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#00f0ff]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#00f0ff]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00f0ff]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00f0ff]" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-10 w-10 border border-[#00f0ff] object-cover" />
              ) : (
                <div className="h-10 w-10 border border-[#00f0ff] bg-[#00f0ff]/10 flex items-center justify-center text-white font-bold">
                  {(profile.name || 'C').charAt(0)}
                </div>
              )}
              <div>
                <div className="text-white font-bold text-sm tracking-widest uppercase">
                  {profile.name} // <span className="text-[#00f0ff]">{profile.headline || 'NETRUNNER'}</span>
                </div>
                <div className="text-[10px] text-[#ff0055] uppercase tracking-wider">
                  SECURITY CLEARANCE: LVL-4 • NODE: {profile.location || 'NIGHT_CITY'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {hero.availability_badge && (
                <span className="border border-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 text-[10px] text-[#00f0ff] uppercase animate-pulse">
                  [STATUS: {hero.availability_badge}]
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Hero HUD Terminal */}
        <section className="border border-[#ff0055]/50 bg-[#0a0d14] p-8 sm:p-12 relative shadow-[0_0_20px_rgba(255,0,85,0.15)]">
          <div className="absolute top-0 right-0 bg-[#ff0055] text-black text-[10px] font-bold px-3 py-0.5 uppercase">
            SYS_INIT // PROTOCOL
          </div>

          <div className="text-[#00f0ff] text-xs uppercase mb-3 tracking-widest">
            &gt; OVERRIDE SEQUENCE ENGAGED
          </div>

          <h1 className="text-3xl sm:text-6xl font-black uppercase text-white tracking-tight leading-none">
            {hero.headline}
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#a9b1d6] leading-relaxed max-w-3xl border-l-2 border-[#ff0055] pl-4">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="bg-[#00f0ff] text-black font-black uppercase px-6 py-2.5 text-xs tracking-widest hover:bg-white transition shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                {hero.primary_cta_text} &gt;&gt;
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="border border-[#ff0055] bg-[#ff0055]/10 text-[#ff0055] font-bold uppercase px-6 py-2.5 text-xs tracking-widest hover:bg-[#ff0055] hover:text-white transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Profile & Narrative */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-[#30363d] bg-[#0c0f17] p-6 relative">
            <div className="text-xs text-[#00f0ff] uppercase tracking-wider mb-2">// DIRECTIVE_CORE</div>
            <h2 className="text-xl font-bold text-white uppercase mb-4">{about.title || 'ARCHITECTURAL TELEMETRY'}</h2>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="border border-[#30363d] bg-[#0c0f17] p-6 space-y-4">
            <div className="text-xs text-[#ff0055] uppercase tracking-wider">// TELEMETRY_LOGS</div>
            <ul className="space-y-2 text-xs">
              {about.highlights?.map((h, i) => (
                <li key={i} className="border-l-2 border-[#00f0ff] pl-2 text-slate-300">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Skills HUD Array */}
        {skills && skills.length > 0 && (
          <section className="border border-[#30363d] bg-[#0c0f17] p-6">
            <div className="text-xs text-[#00f0ff] uppercase tracking-wider mb-4">// LOADED_SUBSYSTEMS ({skills.length})</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {skills.map((s, idx) => (
                <div key={idx} className="border border-[#1f2430] bg-[#141824] p-2 flex justify-between items-center hover:border-[#00f0ff] transition">
                  <span className="text-white">{s.name}</span>
                  <span className="text-[10px] text-[#00f0ff] font-mono">{s.proficiency ? `${s.proficiency}%` : 'ONLINE'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Grid */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <div className="text-white text-lg font-black uppercase">// DEPLOYED_APPARATUS</div>
            <div className="text-[10px] text-[#00f0ff]">INDEXING: 001..0{projects?.length || 0}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="border border-[#1f2430] bg-[#0c0f17] p-6 flex flex-col justify-between hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#ff0055]">NODE_0{idx + 1}</span>
                    {proj.featured && (
                      <span className="border border-[#00f0ff] bg-[#00f0ff]/10 px-1.5 py-0.2 text-[9px] text-[#00f0ff] uppercase">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold uppercase text-white">{proj.title}</h3>
                  <p className="mt-2 text-xs text-[#8b949e] leading-relaxed">{proj.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f2430] space-y-3">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {proj.technologies?.map((t, ti) => (
                      <span key={ti} className="bg-[#141824] px-1.5 py-0.5 text-[#a9b1d6]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold pt-1">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-[#00f0ff] hover:underline">
                        GIT_REPO ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-[#ff0055] hover:underline">
                        HOSTED_PORT ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Log */}
        {experience && experience.length > 0 && (
          <section className="border border-[#30363d] bg-[#0c0f17] p-6 space-y-4">
            <div className="text-xs text-[#ff0055] uppercase tracking-wider">// CHRONO_SERVICE_LOG</div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-[#00f0ff] pl-4 text-xs">
                  <div className="flex flex-wrap justify-between text-white font-bold">
                    <span>{exp.role} @ {exp.company}</span>
                    <span className="text-[#8b949e] font-mono">{exp.start_date} — {exp.end_date || 'ACTIVE'}</span>
                  </div>
                  {exp.description && <p className="mt-1 text-[#8b949e]">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cyber Footer */}
        <footer id="contact" className="border border-[#00f0ff]/40 bg-[#0e1117] p-8 text-center space-y-4">
          <div className="text-xs text-[#ff0055] uppercase tracking-widest">// DIRECT_TRANSMISSION</div>
          <h3 className="text-2xl font-black uppercase text-white">OPEN COMM CHANNEL</h3>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">
            {contact.message || 'Ready to deploy architectural solutions or secure backend infrastructure.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs pt-2">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="border border-[#00f0ff] bg-[#00f0ff]/10 px-4 py-2 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition">
                ADDR: {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="border border-[#30363d] px-4 py-2 text-white hover:border-[#00f0ff] transition">
                GITHUB ↗
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="border border-[#30363d] px-4 py-2 text-white hover:border-[#00f0ff] transition">
                LINKEDIN ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
