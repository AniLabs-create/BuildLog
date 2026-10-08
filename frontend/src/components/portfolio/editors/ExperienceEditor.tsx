import React from 'react';
import type { PortfolioExperience } from '../../../types/portfolio';

interface ExperienceEditorProps {
  experience: PortfolioExperience[];
  onChangeExperience: (experience: PortfolioExperience[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  onChangeExperience,
}) => {
  const addExperience = () => {
    const item: PortfolioExperience = {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      start_date: '2023',
      end_date: 'Present',
      is_current: false,
      description: 'Architecting scalable services and leading technical designs.',
      achievements: ['Increased system throughput by 40%'],
      technologies: [],
    };
    onChangeExperience([item, ...experience]);
  };

  const removeExperience = (idx: number) => {
    onChangeExperience(experience.filter((_, i) => i !== idx));
  };

  const updateExperience = (idx: number, updated: PortfolioExperience) => {
    const list = [...experience];
    list[idx] = updated;
    onChangeExperience(list);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Work Experience ({experience.length})
        </h4>
        <button
          type="button"
          onClick={addExperience}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 transition"
        >
          + Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experience.map((exp, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Position #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                className="text-zinc-500 hover:text-red-400 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Role / Title</label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => updateExperience(idx, { ...exp, role: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, { ...exp, company: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Start Date</label>
                <input
                  type="text"
                  value={exp.start_date || ''}
                  onChange={(e) => updateExperience(idx, { ...exp, start_date: e.target.value })}
                  placeholder="e.g. Jan 2022"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">End Date</label>
                <input
                  type="text"
                  value={exp.end_date || ''}
                  onChange={(e) => updateExperience(idx, { ...exp, end_date: e.target.value })}
                  placeholder="e.g. Present"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Role Description</label>
              <textarea
                rows={2}
                value={exp.description || ''}
                onChange={(e) => updateExperience(idx, { ...exp, description: e.target.value })}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
