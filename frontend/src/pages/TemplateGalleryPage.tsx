import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TEMPLATES_REGISTRY } from '../components/portfolio/templates/TemplateRegistry';

export const TemplateGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Clean', 'Developer', 'Bold', 'Creative', 'Professional', 'Academic'];

  const filtered = TEMPLATES_REGISTRY.filter((t) => {
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-850 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Portfolio Template Gallery</h1>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-300">
              20 Bespoke Layouts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Every template is crafted for distinct engineering personas—from minimalist noir and retro terminal consoles to editorial broadsheets and systems architecture.
          </p>
        </div>

        <Link
          to="/portfolio/new"
          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-purple-600/20"
        >
          Create Portfolio
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by persona, keyword, or tag..."
          className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 w-full sm:w-72"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="group flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 transition shadow-lg hover:shadow-2xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full inline-block ring-2 ring-zinc-800"
                    style={{ backgroundColor: t.accentColor }}
                  />
                  <h3 className="font-extrabold text-white text-lg group-hover:text-purple-300 transition">
                    {t.name}
                  </h3>
                </div>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300">
                  {t.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed min-h-[3.5rem] mb-4">
                {t.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {t.tags.map((tag, ti) => (
                  <span
                    key={ti}
                    className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Supported Features */}
              <div className="border-t border-zinc-800/80 pt-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Specialized Modules:
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {t.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-2">
                      <span className="text-purple-400">›</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                Normalized ID: <code className="text-zinc-300">{t.id}</code>
              </span>

              <button
                type="button"
                onClick={() => navigate(`/portfolio/new?template=${t.id}`)}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-purple-600/20"
              >
                Use Template →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
