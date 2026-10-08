import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const ResumeTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, education, achievements, social_links } = data;

  return (
    <div className="min-h-screen bg-[#edeef0] text-slate-800 font-sans selection:bg-slate-300 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl bg-white shadow-lg border border-slate-300 overflow-hidden">
        {/* Header Ribbon */}
        <header className="bg-slate-900 text-white p-8 sm:p-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {profile.avatar && (
              <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-full object-cover border-2 border-slate-600" />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{profile.name}</h1>
              <p className="text-slate-300 text-base font-medium mt-1">{profile.headline || 'Software Engineering Professional'}</p>
              {profile.location && <p className="text-xs text-slate-400 mt-1">📍 {profile.location}</p>}
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 sm:text-right">
            {social_links.email && <div>✉️ <a href={`mailto:${social_links.email}`} className="hover:underline">{social_links.email}</a></div>}
            {social_links.github && <div>🐙 <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:underline">github.com/{social_links.github.split('/').pop()}</a></div>}
            {social_links.linkedin && <div>💼 <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn Profile</a></div>}
          </div>
        </header>

        {/* 2-Column Resume Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Main Column (8 cols): Summary, Experience, Projects */}
          <main className="md:col-span-8 p-6 sm:p-8 space-y-8">
            {/* Executive Summary */}
            <section>
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {about.content || profile.long_bio || profile.short_bio || hero.subheadline}
              </p>
            </section>

            {/* Experience */}
            {experience && experience.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-4">
                  Experience &amp; Career History
                </h2>
                <div className="space-y-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 text-base">{exp.role}</span>
                        <span className="text-xs font-semibold text-slate-500">{exp.start_date} — {exp.end_date || 'Present'}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600">{exp.company}</div>
                      {exp.description && <p className="text-xs text-slate-700 leading-relaxed pt-1">{exp.description}</p>}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pt-1">
                          {exp.achievements.map((ach, ai) => (
                            <li key={ai}>{ach}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Selected Projects */}
            {projects && projects.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-4">
                  Key Projects &amp; Contributions
                </h2>
                <div className="space-y-5">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                        <div className="text-xs flex gap-3">
                          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Code</a>}
                          {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Live Demo</a>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                      {proj.impact && <p className="text-xs text-slate-800 font-medium">Outcome: {proj.impact}</p>}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Technologies: {proj.technologies.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar Column (4 cols): Skills, Education, Achievements */}
          <aside className="md:col-span-4 p-6 sm:p-8 bg-slate-50 space-y-8">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Technical Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.field}</div>
                      <div className="text-slate-500">{edu.institution}</div>
                      <div className="text-slate-400 mt-0.5">{edu.start_date} – {edu.end_date || 'Present'}</div>
                      {edu.grade && <div className="text-slate-700 font-medium mt-0.5">GPA: {edu.grade}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Honors &amp; Awards
                </h2>
                <div className="space-y-3 text-xs">
                  {achievements.map((ach, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-slate-900">{ach.title}</div>
                      <div className="text-slate-600">{ach.organization} {ach.date && `(${ach.date})`}</div>
                      {ach.description && <div className="text-slate-500 mt-0.5">{ach.description}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Strengths */}
            {about.highlights && about.highlights.length > 0 && (
              <section>
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                  Key Strengths
                </h2>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {about.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {/* Footer */}
        <footer className="bg-slate-100 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Professional CV of {profile.name} • Formatted with BuildLog Portfolio
        </footer>
      </div>
    </div>
  );
};
