import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const AcademicTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, skills, projects, experience, education, achievements, social_links } = data;

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-[#222222] font-serif antialiased selection:bg-[#d4e2d4] selection:text-black py-12 px-4 sm:px-8">
      <div className="mx-auto max-w-4xl bg-white border border-[#e5e5e5] p-8 sm:p-16 shadow-sm">
        {/* Academic Header / CV Header */}
        <header className="border-b-2 border-black pb-8 text-center sm:text-left sm:flex sm:items-start sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{profile.name}</h1>
            <p className="text-base text-neutral-700 italic mt-1">{profile.headline || 'Research Scientist & Software Engineer'}</p>
            <p className="text-xs font-sans text-neutral-500 mt-2">
              {profile.location && `${profile.location} • `}
              Curriculum Vitae &amp; Selected Research Works
            </p>
          </div>

          <div className="mt-4 sm:mt-0 font-sans text-xs text-neutral-600 sm:text-right space-y-1">
            {social_links.email && (
              <div>
                <a href={`mailto:${social_links.email}`} className="text-blue-700 hover:underline">
                  {social_links.email}
                </a>
              </div>
            )}
            {social_links.github && (
              <div>
                <a href={social_links.github} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                  github.com/{social_links.github.split('/').pop()}
                </a>
              </div>
            )}
            {social_links.linkedin && (
              <div>
                <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Research Statement / Hero */}
        <section className="mt-8 border-b border-neutral-200 pb-8">
          <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-3">
            Research Statement &amp; Focus
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-neutral-900 font-serif">
            {hero.subheadline || hero.headline || profile.short_bio}
          </p>
        </section>

        {/* Education Section */}
        {education && education.length > 0 && (
          <section className="mt-8 border-b border-neutral-200 pb-8">
            <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-4">
              Academic Background
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-base text-black">{edu.institution}</span>
                    <div className="text-sm text-neutral-700 italic">
                      {edu.degree} in {edu.field}
                    </div>
                    {edu.grade && <div className="text-xs font-sans text-neutral-500">Grade / Honours: {edu.grade}</div>}
                  </div>
                  <span className="font-sans text-xs text-neutral-600">
                    {edu.start_date} – {edu.end_date || 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected Publications & Projects */}
        <section className="mt-8 border-b border-neutral-200 pb-8">
          <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-4">
            Selected Projects &amp; Software Artifacts
          </h2>
          <div className="space-y-6">
            {projects?.map((proj, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-base text-black">
                    [{idx + 1}] {proj.title}
                  </span>
                  <div className="font-sans text-xs flex gap-3">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                        [Source]
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                        [Demo / Preprint]
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-1 text-neutral-700 leading-relaxed">{proj.description}</p>

                {proj.problem && (
                  <p className="mt-1 text-xs text-neutral-600 italic">
                    <strong>Context:</strong> {proj.problem}
                  </p>
                )}
                {proj.impact && (
                  <p className="mt-1 text-xs text-neutral-800">
                    <strong>Results:</strong> {proj.impact}
                  </p>
                )}

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-2 font-sans text-[11px] text-neutral-500">
                    Keywords: {proj.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Experience & Appointments */}
        {experience && experience.length > 0 && (
          <section className="mt-8 border-b border-neutral-200 pb-8">
            <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-4">
              Professional &amp; Research Appointments
            </h2>
            <div className="space-y-5">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-bold text-black">{exp.role}</span>
                      <span className="text-neutral-700 italic"> — {exp.company}</span>
                    </div>
                    <span className="font-sans text-xs text-neutral-600">
                      {exp.start_date} – {exp.end_date || 'Present'}
                    </span>
                  </div>
                  {exp.description && <p className="mt-1 text-neutral-700 leading-relaxed text-xs">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Honors & Awards */}
        {achievements && achievements.length > 0 && (
          <section className="mt-8 border-b border-neutral-200 pb-8">
            <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-4">
              Honors, Grants &amp; Awards
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside text-neutral-800">
              {achievements.map((ach, idx) => (
                <li key={idx}>
                  <strong>{ach.title}</strong> — {ach.organization} {ach.date && `(${ach.date})`}
                  {ach.description && <span className="text-neutral-600 block pl-5 text-xs">{ach.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Skills & Methods */}
        {skills && skills.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs uppercase font-sans font-bold tracking-widest text-neutral-500 mb-3">
              Technical Methods &amp; Proficiencies
            </h2>
            <div className="font-sans text-xs text-neutral-700 leading-relaxed">
              {skills.map((s) => s.name).join(' • ')}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-neutral-200 text-center font-sans text-xs text-neutral-500">
          Curriculum Vitae of {profile.name} • Generated with BuildLog Research Engine
        </footer>
      </div>
    </div>
  );
};
