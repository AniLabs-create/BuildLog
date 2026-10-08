import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

export const CreativeTemplate: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile, hero, about, skills, projects, experience, social_links, contact } = data;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 font-sans selection:bg-pink-300 selection:text-pink-900 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Creative Top Navigation */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-pink-400" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-300 text-white font-black text-xl shadow-md">
                {(profile.name || 'C').charAt(0)}
              </div>
            )}
            <div>
              <div className="font-extrabold text-slate-900 text-lg">{profile.name}</div>
              <div className="text-xs text-rose-500 font-bold">{profile.headline || 'Creative Developer & Designer'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hero.availability_badge && (
              <span className="rounded-full bg-pink-100 border border-pink-200 px-3.5 py-1 text-xs font-bold text-pink-700">
                ✨ {hero.availability_badge}
              </span>
            )}
            <a
              href={`mailto:${contact.email || social_links.email || ''}`}
              className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-sm"
            >
              Say Hello 👋
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative rounded-[2.5rem] bg-gradient-to-br from-rose-100/70 via-amber-100/50 to-teal-100/60 p-8 sm:p-16 border border-white shadow-xl space-y-8 overflow-hidden">
          <div className="inline-block rounded-full bg-white/80 px-4 py-1 text-xs font-extrabold text-rose-600 shadow-sm backdrop-blur-sm">
            🎨 Portfolio &amp; Digital Playbook
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
            {hero.headline}
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 max-w-2xl leading-relaxed font-normal">
            {hero.subheadline || profile.short_bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {hero.primary_cta_text && (
              <a
                href={hero.primary_cta_url || '#projects'}
                className="rounded-full bg-rose-500 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition"
              >
                {hero.primary_cta_text}
              </a>
            )}
            {hero.secondary_cta_text && (
              <a
                href={hero.secondary_cta_url || '#contact'}
                className="rounded-full bg-white px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 shadow-md hover:bg-slate-50 transition"
              >
                {hero.secondary_cta_text}
              </a>
            )}
          </div>
        </section>

        {/* Playful About */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl bg-white p-8 sm:p-10 border border-slate-200/60 shadow-sm space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-rose-500">Curiosity &amp; Focus</span>
            <h2 className="text-3xl font-extrabold text-slate-900">{about.title || 'About Me'}</h2>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
              {about.content || profile.long_bio || profile.short_bio}
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-tr from-amber-50 to-rose-50 p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-600 mb-4 block">Key Superpowers</span>
              <ul className="space-y-3 text-xs font-bold text-slate-700">
                {about.highlights?.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 shadow-sm">
                    <span>🌟</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 text-xs text-slate-400 font-bold uppercase">
              LOCATION: {profile.location || 'THE CLOUD'}
            </div>
          </div>
        </section>

        {/* Playful Skills Candy Pills */}
        {skills && skills.length > 0 && (
          <section className="rounded-3xl bg-white p-8 border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-rose-500">Creative Stack</h3>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-700 transition px-4 py-2 text-xs font-bold text-slate-700 cursor-default"
                >
                  {s.name} {s.proficiency ? `• ${s.proficiency}%` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects Cards with Color Tags */}
        <section id="projects" className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-slate-900">Featured Inventions</h3>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{projects?.length || 0} Projects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects?.map((proj, idx) => (
              <div
                key={idx}
                className="group rounded-3xl bg-white p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="rounded-full bg-rose-50 text-rose-600 font-extrabold px-3 py-1">
                      PROJECT #{idx + 1}
                    </span>
                    {proj.featured && (
                      <span className="rounded-full bg-amber-100 text-amber-800 font-extrabold px-3 py-1">
                        ★ FAVORITE
                      </span>
                    )}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-rose-500 transition">{proj.title}</h4>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{proj.description}</p>

                  {proj.impact && (
                    <div className="mt-4 rounded-2xl bg-teal-50 border border-teal-200/60 p-3 text-xs font-medium text-teal-800">
                      <strong>✨ Magic Touch:</strong> {proj.impact}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies?.slice(0, 3).map((t, ti) => (
                      <span key={ti} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900">
                        Code
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-rose-500 hover:text-rose-600">
                        Launch ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Cards */}
        {experience && experience.length > 0 && (
          <section className="rounded-3xl bg-white p-8 sm:p-10 border border-slate-200/60 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-slate-900">Journey &amp; Adventures</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-50 p-5 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900">{exp.role} <span className="text-rose-500">@ {exp.company}</span></h4>
                    {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
                  </div>
                  <span className="text-xs font-bold text-slate-400">{exp.start_date} — {exp.end_date || 'Present'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Creative Footer */}
        <footer id="contact" className="rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-14 text-center space-y-4">
          <h3 className="text-3xl sm:text-4xl font-black">Let's make cool things happen</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {contact.message || 'Drop a line to talk ideas, collaborations, or creative engineering.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs font-bold">
            {social_links.email && (
              <a href={`mailto:${social_links.email}`} className="rounded-full bg-rose-500 px-6 py-2.5 text-white hover:bg-rose-400 transition">
                {social_links.email}
              </a>
            )}
            {social_links.github && (
              <a href={social_links.github} target="_blank" rel="noreferrer" className="rounded-full bg-slate-800 px-6 py-2.5 text-white hover:bg-slate-700 transition">
                GitHub
              </a>
            )}
            {social_links.twitter && (
              <a href={social_links.twitter} target="_blank" rel="noreferrer" className="rounded-full bg-slate-800 px-6 py-2.5 text-white hover:bg-slate-700 transition">
                Twitter
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
