import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const EditorialTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, education, achievements, social_links, contact } = data;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] font-serif antialiased selection:bg-[#c4a482]/30 selection:text-black">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-12">
        {/* Newspaper Top Header */}
        <header className="border-b-4 border-black pb-4 text-center">
          <div className="flex flex-wrap items-center justify-between border-b border-black/30 pb-2 text-[11px] font-sans uppercase tracking-widest text-[#666]">
            <span>Vol. {new Date().getFullYear() % 100} — Special Edition</span>
            <span>{today}</span>
            <span>{profile.location || 'Global Dispatch'}</span>
          </div>

          <h1 className="mt-4 font-serif text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-black">
            {profile.name || 'The Dispatch'}
          </h1>
          <p className="mt-2 text-sm sm:text-base font-sans tracking-widest uppercase text-neutral-600">
            {profile.headline || 'Engineer • Builder • Architect'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-6 border-t border-black/30 pt-2 text-xs font-sans uppercase tracking-wider text-neutral-700">
            <a href="#about" className="hover:text-black hover:underline">Editorial</a>
            <span>•</span>
            <a href="#projects" className="hover:text-black hover:underline">Selected Works</a>
            <span>•</span>
            <a href="#experience" className="hover:text-black hover:underline">Career Chronicle</a>
            <span>•</span>
            <a href="#contact" className="hover:text-black hover:underline">Correspond</a>
          </div>
        </header>

        {/* Lead Headline & Hero */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-black pb-12">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {hero.availability_badge && (
                <div className="inline-block border border-black px-2 py-0.5 text-[10px] font-sans uppercase font-bold tracking-widest bg-neutral-100 mb-4">
                  Bulletin: {hero.availability_badge}
                </div>
              )}
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-black">
                {hero.headline || 'Engineering resilient software for the next computing era.'}
              </h2>
              <p className="mt-6 text-lg sm:text-xl leading-relaxed text-neutral-800 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                {hero.subheadline || profile.short_bio}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 font-sans text-xs uppercase tracking-wider font-bold">
              {hero.primary_cta_text && (
                <a
                  href={hero.primary_cta_url || '#projects'}
                  className="border-2 border-black bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
                >
                  {hero.primary_cta_text} →
                </a>
              )}
              {hero.secondary_cta_text && (
                <a
                  href={hero.secondary_cta_url || '#contact'}
                  className="border-2 border-black bg-transparent px-6 py-3 text-black transition hover:bg-black/5"
                >
                  {hero.secondary_cta_text}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-300 pt-6 lg:pt-0 lg:pl-8 flex flex-col items-center text-center">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-48 h-56 object-cover border-2 border-black filter grayscale contrast-125 shadow-md mb-4"
              />
            )}
            <blockquote className="italic text-sm text-neutral-700 font-serif border-y border-neutral-300 py-3 my-2">
              "{about.highlights?.[0] || 'Code is a medium for thought and human expression.'}"
            </blockquote>
            <p className="text-xs font-sans text-neutral-500 uppercase tracking-wider mt-2">
              Photo: Archive / BuildLog Profile
            </p>
          </div>
        </section>

        {/* Multi-Column Section: About & Skills */}
        <section id="about" className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 border-b-2 border-black pb-12">
          <div className="md:col-span-8">
            <h3 className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500 mb-2">
              Perspective & Background
            </h3>
            <h4 className="text-2xl font-bold mb-4">{about.title || 'The Philosophy'}</h4>
            <div className="text-neutral-800 leading-relaxed text-base space-y-4 columns-1 sm:columns-2 gap-6">
              <p className="whitespace-pre-line">
                {about.content || profile.long_bio || profile.short_bio}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-neutral-300 pt-6 md:pt-0 md:pl-6">
            <h3 className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500 mb-4">
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2 font-sans text-xs">
              {skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="border border-black px-2.5 py-1 bg-white font-medium hover:bg-black hover:text-white transition"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Works / Projects */}
        <section id="projects" className="mt-12 border-b-2 border-black pb-12">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500">Portfolio</span>
              <h3 className="text-3xl font-bold">Selected Works & Case Studies</h3>
            </div>
            <span className="font-sans text-xs text-neutral-500 uppercase">
              {projects?.length || 0} Features Documented
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects?.map((proj, idx) => (
              <article key={idx} className="border border-black bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-sans text-neutral-500 border-b border-neutral-200 pb-2 mb-3">
                    <span>Exhibit 0{idx + 1}</span>
                    {proj.featured && <span className="font-bold text-black uppercase">★ Highlight</span>}
                  </div>
                  <h4 className="text-2xl font-bold mb-2 text-black">{proj.title}</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed mb-4">{proj.description}</p>
                  {proj.impact && (
                    <div className="bg-neutral-50 border-l-2 border-black p-2.5 text-xs text-neutral-800 font-sans italic mb-4">
                      <strong>Impact:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-4 font-sans text-[11px]">
                    {proj.technologies?.map((tech, ti) => (
                      <span key={ti} className="bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 font-sans text-xs uppercase font-bold tracking-wider pt-2 border-t border-neutral-200">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="hover:underline">
                        Source Code ↗
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="hover:underline">
                        Live Preview ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Experience & Career Timeline */}
        {experience && experience.length > 0 && (
          <section id="experience" className="mt-12 border-b-2 border-black pb-12">
            <h3 className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500 mb-2">Chronicle</h3>
            <h4 className="text-3xl font-bold mb-8">Professional Experience</h4>
            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-black pl-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h5 className="text-xl font-bold text-black">{exp.role} <span className="font-normal text-neutral-600">at</span> {exp.company}</h5>
                    <span className="font-sans text-xs uppercase font-semibold text-neutral-500">
                      {exp.start_date} — {exp.end_date || 'Present'}
                    </span>
                  </div>
                  {exp.description && <p className="mt-2 text-neutral-700 text-sm leading-relaxed">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-neutral-800 font-sans list-disc list-inside">
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

        {/* Education & Honours */}
        {((education && education.length > 0) || (achievements && achievements.length > 0)) && (
          <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-b-2 border-black pb-12">
            {education && education.length > 0 && (
              <div>
                <h4 className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500 mb-4">Academic Credentials</h4>
                <div className="space-y-4 font-sans">
                  {education.map((edu, idx) => (
                    <div key={idx} className="border border-neutral-300 p-4 bg-white">
                      <div className="font-bold text-sm text-black">{edu.degree} in {edu.field}</div>
                      <div className="text-xs text-neutral-600">{edu.institution} ({edu.start_date} – {edu.end_date || 'Present'})</div>
                      {edu.grade && <div className="text-xs text-neutral-800 mt-1">Honours / Grade: {edu.grade}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements && achievements.length > 0 && (
              <div>
                <h4 className="font-sans text-xs uppercase font-bold tracking-widest text-neutral-500 mb-4">Honours & Distinctions</h4>
                <div className="space-y-4 font-sans">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="border border-neutral-300 p-4 bg-white">
                      <div className="font-bold text-sm text-black">{ach.title}</div>
                      <div className="text-xs text-neutral-600">{ach.organization} • {ach.date}</div>
                      {ach.description && <div className="text-xs text-neutral-700 mt-1">{ach.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Correspondence / Footer */}
        <footer id="contact" className="mt-12 pt-6 text-center font-sans">
          <h4 className="text-xl font-bold font-serif uppercase tracking-wider mb-2">Correspond With The Author</h4>
          <p className="text-xs text-neutral-600 mb-6 max-w-md mx-auto">
            {contact.message || 'Available for technical consultations, engineering leadership, and speaking engagements.'}
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase font-bold tracking-wider mb-8">
            {social_links.email && <a href={`mailto:${social_links.email}`} className="hover:underline">{social_links.email}</a>}
            {social_links.github && <a href={social_links.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
            {social_links.linkedin && <a href={social_links.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
            {social_links.twitter && <a href={social_links.twitter} target="_blank" rel="noreferrer" className="hover:underline">X / Twitter</a>}
          </div>

          <div className="border-t border-black/30 pt-4 text-[10px] text-neutral-500 uppercase tracking-widest">
            © {new Date().getFullYear()} {profile.name}. Printed via BuildLog Portfolio Engine.
          </div>
        </footer>
      </div>
    </div>
  );
};
