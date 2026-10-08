import React, { useState } from 'react';
import type { PortfolioAbout } from '../../../types/portfolio';

interface AboutEditorProps {
  about: PortfolioAbout;
  onChangeAbout: (about: PortfolioAbout) => void;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({ about, onChangeAbout }) => {
  const [newHighlight, setNewHighlight] = useState('');

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    const current = about.highlights || [];
    onChangeAbout({
      ...about,
      highlights: [...current, newHighlight.trim()],
    });
    setNewHighlight('');
  };

  const removeHighlight = (idx: number) => {
    const current = about.highlights || [];
    onChangeAbout({
      ...about,
      highlights: current.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <label className="block text-zinc-400 mb-1">Section Title</label>
        <input
          type="text"
          value={about.title || ''}
          onChange={(e) => onChangeAbout({ ...about, title: e.target.value })}
          placeholder="About Me / Philosophy / Background"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-semibold"
        />
      </div>

      <div>
        <label className="block text-zinc-400 mb-1">Main Narrative / Content</label>
        <textarea
          rows={6}
          value={about.content || ''}
          onChange={(e) => onChangeAbout({ ...about, content: e.target.value })}
          placeholder="Write your background, journey, and technical focus..."
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-zinc-400">Key Highlights / Bullets</label>
        <div className="space-y-2">
          {about.highlights?.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={h}
                onChange={(e) => {
                  const updated = [...(about.highlights || [])];
                  updated[idx] = e.target.value;
                  onChangeAbout({ ...about, highlights: updated });
                }}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHighlight();
              }
            }}
            placeholder="Add a new highlight (e.g. 5+ years building distributed Go backends)..."
            className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
