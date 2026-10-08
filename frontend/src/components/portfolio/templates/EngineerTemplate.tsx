import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const EngineerTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono selection:bg-[#1f6feb] selection:text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Architecture Header */}
        <header className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded border border-[#30363d] object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded border border-[#30363d] bg-[#21262d] font-bold text-white">
                SYS
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{profile.name}</span>
                <span className="rounded bg-[#238636]/20 border border-[#238636] px-1.5 py-0.5 text-[10px] text-[#3fb950]">
                  PROD_READY
                </span>
              </div>
              <div className="text-xs text-[#8b949e]">{profile.headline || 'Principal Systems & Backend Architect'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {hero.availability_badge && (
              <span className="flex items-center gap-1.5 text-[#3fb950]">
                <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-ping" />
                {hero.availability_badge}
              </span>
            )}
            <span className="text-[#8b949e]">CLUSTER: {profile.location || 'US-EAST-1'}</span>
          </div>
        </header>

        {/* System Overview / Hero */}
        <section className="rounded-lg border border-[#30363d] bg-[#161b22] p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#8b949e] border-b border-[#30363d] pb-3">
            <span>SPECIFICATION // CORE_ENGINE</span>
            <span>UPTIME: 99.99%</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {hero.headline}
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed max-w-3xl">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded bg-[#238636] px-5 py-2.5 text-xs font-bold text-white uppercase hover:bg-[#2ea043] transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded border border-[#30363d] bg-[#21262d] px-5 py-2.5 text-xs font-bold text-white uppercase hover:bg-[#30363d] transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* System Topology: Skills */}
        {skills && skills.length > 0 && (
          <section className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>// INFRASTRUCTURE &amp; TECHNOLOGY STACK</span>
              <span className="text-[#8b949e]">{skills.length} MODULES LOADED</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((s, idx) => (
                <div key={idx} className="rounded border border-[#30363d] bg-[#0d1117] p-2.5 text-xs flex justify-between items-center">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-[10px] text-[#58a6ff]">{s.category || 'tech'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects / System Architecture Deployments */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <h2 className="text-lg font-bold text-white">// ARCHITECTURAL WORK &amp; REPOSITORIES</h2>
            <span className="text-xs text-[#8b949e]">{projects?.length || 0} DEPLOYMENTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 flex flex-col justify-between hover:border-[#58a6ff] transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-[#58a6ff] font-bold">SERVICE_0{idx + 1}</span>
                    {proj.featured && (
                      <span className="rounded bg-[#238636]/20 text-[#3fb950] border border-[#238636] px-1.5 py-0.5 text-[10px]">
                        HIGH_THROUGHPUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                  <p className="mt-2 text-xs text-[#8b949e] leading-relaxed">{proj.description}</p>

                  {proj.impact && (
                    <div className="mt-3 rounded border border-[#30363d] bg-[#0d1117] p-2.5 text-xs text-[#3fb950]">
                      <strong>METRIC:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#30363d] space-y-3">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="rounded bg-[#21262d] px-1.5 py-0.5 text-[#c9d1d9]">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold pt-1">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">
                        git clone ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-[#3fb950] hover:underline">
                        curl preview ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Trace */}
        {experience && experience.length > 0 && (
          <section className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">// DEPLOYMENT TIMELINE</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-[#58a6ff] pl-4 text-xs">
                  <div className="flex flex-wrap justify-between text-white font-bold">
                    <span>{exp.role} @ {exp.company}</span>
                    <span className="text-[#8b949e]">{exp.start_date} — {exp.end_date || 'HEAD'}</span>
                  </div>
                  {exp.description && <p className="mt-1 text-[#8b949e]">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Wire */}
        <footer id="contact" className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 text-center space-y-3">
          <div className="text-xs text-[#3fb950] uppercase tracking-wider">// TCP_CONNECTION</div>
          <h3 className="text-xl font-bold text-white">READY FOR ARCHITECTURAL DRILLS</h3>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">
            {contact.message || 'Available for high-scale backend architecture reviews and systems engineering.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs pt-2">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="text-[#58a6ff] hover:underline">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="text-[#c9d1d9] hover:text-white">
                GitHub ↗
              </a>
            )}
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-[#c9d1d9] hover:text-white">
                LinkedIn ↗
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
