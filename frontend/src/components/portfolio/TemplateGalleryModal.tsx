import React, { useState } from 'react';
import { TEMPLATES_REGISTRY } from './templates/TemplateRegistry';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Choose from 20 Portfolio Templates</h3>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                20 Total
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Switching templates instantly restyles your portfolio while preserving 100% of your data.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
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
            placeholder="Search templates..."
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tpl) => {
            const isCurrent = tpl.id.toLowerCase() === selectedTemplateId.toLowerCase();

            return (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div>
                  {/* Card Visual Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tpl.accentColor }}
                      />
                      <span className="font-bold text-white text-base">{tpl.name}</span>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] text-zinc-300 font-mono">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 min-h-[3rem]">
                    {tpl.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tpl.tags.map((tag, ti) => (
                      <span
                        key={ti}
                        className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                    <span>Accent:</span>
                    <span
                      className="inline-block w-3 h-3 rounded border border-zinc-700"
                      style={{ backgroundColor: tpl.accentColor }}
                    />
                  </div>

                  {isCurrent ? (
                    <span className="rounded-xl bg-purple-600/30 border border-purple-500/50 px-4 py-1.5 text-xs font-bold text-purple-300">
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplate(tpl.id);
                        onClose();
                      }}
                      className="rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-1.5 text-xs transition"
                    >
                      Use Template
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
