import React, { useState } from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const TerminalTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, education, achievements, social_links, contact } = data;
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'exp' | 'skills' | 'contact'>('all');

  const username = profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') : 'dev';

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#58a6ff] font-mono selection:bg-[#238636] selection:text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f85149] inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#d29922] inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#2ea043] inline-block" />
            <span className="ml-3 text-xs text-[#8b949e]">bash — {username}@buildlog-shell: ~</span>
          </div>
          <div className="text-xs text-[#8b949e]">v2.4-portfolio</div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 sm:p-10 space-y-10 text-sm text-[#c9d1d9]">
          {/* Welcome Prompt & Banner */}
          <div>
            <div className="text-[#8b949e] mb-2"># System initialized. Type 'help' or browse modules below.</div>
            <p className="text-xs text-[#7ee787] leading-tight mb-4 whitespace-pre">
{`  ____            _   _        _ _       
 |  _ \\ ___  _ __| |_| |_ __ _| (_) __ _ 
 | |_) / _ \\| '__| __| __/ _\` | | |/ _\` |
 |  __/ (_) | |  | |_| || (_| | | | (_| |
 |_|   \\___/|_|   \\__|\\__\\__,_|_|_|\\__,_|`}
            </p>
            <div className="flex items-center gap-2 text-[#7ee787] font-semibold text-base sm:text-lg">
              <span>{username}@buildlog:~$</span>
              <span className="text-white">whoami --verbose</span>
            </div>
            <div className="mt-3 pl-4 border-l-2 border-[#238636] space-y-1 text-xs sm:text-sm">
              <div className="text-white font-bold text-lg">{profile.name}</div>
              <div className="text-[#8b949e]">{profile.headline || hero.headline}</div>
              {profile.location && <div className="text-[#8b949e]">Location: {profile.location}</div>}
              {hero.availability_badge && (
                <div className="text-[#7ee787] flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-[#2ea043] animate-ping" />
                  STATUS: {hero.availability_badge}
                </div>
              )}
            </div>
          </div>

          {/* Bio / Readme */}
          <div>
            <div className="flex items-center gap-2 text-[#7ee787] font-semibold">
              <span>{username}@buildlog:~$</span>
              <span className="text-white">cat README.md</span>
            </div>
            <div className="mt-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-5">
              <h2 className="text-white font-bold text-base mb-2">## {about.title || 'About Me'}</h2>
              <p className="text-[#8b949e] leading-relaxed whitespace-pre-line text-sm">
                {about.content || profile.long_bio || profile.short_bio || hero.subheadline}
              </p>
              {about.highlights && about.highlights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#30363d]">
                  <span className="text-xs text-[#7ee787] uppercase tracking-wider font-bold">Key Highlights:</span>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-[#c9d1d9]">
                    {about.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation Filter */}
          <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 text-xs overflow-x-auto">
            <span className="text-[#8b949e]">Filter:</span>
            {(['all', 'projects', 'exp', 'skills', 'contact'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition uppercase ${
                  activeTab === tab
                    ? 'bg-[#238636] text-white font-bold'
                    : 'bg-[#21262d] text-[#8b949e] hover:text-white'
                }`}
              >
                [{tab}]
              </button>
            ))}
          </div>

          {/* Skills Section */}
          {(activeTab === 'all' || activeTab === 'skills') && skills && skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[#7ee787] font-semibold mb-3">
                <span>{username}@buildlog:~$</span>
                <span className="text-white">ls -la ./skills/</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs"
                  >
                    <span className="text-white font-medium">{skill.name}</span>
                    <span className="text-[#7ee787] text-[10px]">
                      {skill.proficiency ? `${skill.proficiency}%` : skill.category || 'tech'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {(activeTab === 'all' || activeTab === 'projects') && projects && projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[#7ee787] font-semibold mb-3">
                <span>{username}@buildlog:~$</span>
                <span className="text-white">find ./projects -type f -exec info {'{}'} +</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-lg border border-[#30363d] bg-[#0d1117] p-4 transition hover:border-[#58a6ff]"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-white text-base">{p.title}</h3>
                        {p.featured && (
                          <span className="text-[10px] bg-[#238636]/30 text-[#7ee787] border border-[#238636] px-1.5 py-0.5 rounded">
                            ★ featured
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-[#8b949e] line-clamp-3">{p.description}</p>
                      {p.problem && (
                        <div className="mt-2 text-[11px] text-[#7ee787]">
                          <span className="font-bold">problem:</span> {p.problem}
                        </div>
                      )}
                      {p.solution && (
                        <div className="mt-1 text-[11px] text-[#58a6ff]">
                          <span className="font-bold">solution:</span> {p.solution}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#21262d]">
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.technologies.map((t, ti) => (
                            <span
                              key={ti}
                              className="rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#8b949e]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        {p.github_url && (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#58a6ff] hover:underline"
                          >
                            [src-code]
                          </a>
                        )}
                        {p.demo_url && (
                          <a
                            href={p.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7ee787] hover:underline"
                          >
                            [live-demo ↗]
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {(activeTab === 'all' || activeTab === 'exp') && experience && experience.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[#7ee787] font-semibold mb-3">
                <span>{username}@buildlog:~$</span>
                <span className="text-white">git log --stat ./experience/</span>
              </div>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-white text-sm">
                        commit {exp.role} @ {exp.company}
                      </span>
                      <span className="text-[#8b949e]">
                        {exp.start_date} → {exp.end_date || 'HEAD'}
                      </span>
                    </div>
                    {exp.description && <p className="mt-2 text-[#8b949e]">{exp.description}</p>}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1 list-disc list-inside text-[#c9d1d9]">
                        {exp.achievements.map((a, ai) => (
                          <li key={ai}>{a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Achievements */}
          {((education && education.length > 0) || (achievements && achievements.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education && education.length > 0 && (
                <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 text-xs">
                  <div className="text-[#7ee787] font-bold mb-2">/etc/education.conf</div>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="text-white font-semibold">{edu.degree} in {edu.field}</div>
                      <div className="text-[#8b949e]">{edu.institution} ({edu.start_date} - {edu.end_date || 'Present'})</div>
                      {edu.grade && <div className="text-[#7ee787]">GPA: {edu.grade}</div>}
                    </div>
                  ))}
                </div>
              )}

              {achievements && achievements.length > 0 && (
                <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 text-xs">
                  <div className="text-[#7ee787] font-bold mb-2">/var/log/achievements.log</div>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="text-white font-semibold">★ {ach.title}</div>
                      <div className="text-[#8b949e]">{ach.organization} {ach.date && `• ${ach.date}`}</div>
                      {ach.description && <div className="text-[#8b949e] mt-1">{ach.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact & Social Section */}
          <div>
            <div className="flex items-center gap-2 text-[#7ee787] font-semibold mb-3">
              <span>{username}@buildlog:~$</span>
              <span className="text-white">ping -c 1 {social_links.email || 'contact'}</span>
            </div>
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                {social_links.github && (
                  <a href={social_links.github} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">
                    github.com/{social_links.github.split('/').pop()}
                  </a>
                )}
                {social_links.linkedin && (
                  <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">
                    linkedin.com/in/...
                  </a>
                )}
                {social_links.twitter && (
                  <a href={social_links.twitter} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">
                    x.com/{social_links.twitter.split('/').pop()}
                  </a>
                )}
                {social_links.email && (
                  <a href={`mailto:${social_links.email}`} className="text-[#7ee787] hover:underline">
                    mailto:{social_links.email}
                  </a>
                )}
              </div>
              {contact.cta_label && (
                <a
                  href={`mailto:${contact.email || social_links.email || ''}`}
                  className="rounded bg-[#238636] px-4 py-1.5 font-bold text-white hover:bg-[#2ea043] transition"
                >
                  {contact.cta_label}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-[#30363d] bg-[#0d1117] px-4 py-2 flex items-center justify-between text-[11px] text-[#8b949e]">
          <div>STATUS: READY</div>
          <div>ENCODING: UTF-8</div>
          <div>POWERED BY BUILDLOG</div>
        </div>
      </div>
    </div>
  );
};
