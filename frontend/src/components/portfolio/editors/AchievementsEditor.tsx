import React from 'react';
import type { PortfolioAchievement } from '../../../types/portfolio';

interface AchievementsEditorProps {
  achievements: PortfolioAchievement[];
  onChangeAchievements: (achievements: PortfolioAchievement[]) => void;
}

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({
  achievements,
  onChangeAchievements,
}) => {
  const addAchievement = () => {
    const item: PortfolioAchievement = {
      title: 'Hackathon Winner / Grant Award',
      organization: 'Tech Foundation',
      date: '2024',
      description: 'First place out of 100+ competing engineering teams.',
    };
    onChangeAchievements([item, ...achievements]);
  };

  const removeAchievement = (idx: number) => {
    onChangeAchievements(achievements.filter((_, i) => i !== idx));
  };

  const updateAchievement = (idx: number, updated: PortfolioAchievement) => {
    const list = [...achievements];
    list[idx] = updated;
    onChangeAchievements(list);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Achievements &amp; Honors ({achievements.length})
        </h4>
        <button
          type="button"
          onClick={addAchievement}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 transition"
        >
          + Add Honor
        </button>
      </div>

      <div className="space-y-4">
        {achievements.map((ach, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Award #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeAchievement(idx)}
                className="text-zinc-500 hover:text-red-400 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={ach.title}
                  onChange={(e) => updateAchievement(idx, { ...ach, title: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Date</label>
                <input
                  type="text"
                  value={ach.date || ''}
                  onChange={(e) => updateAchievement(idx, { ...ach, date: e.target.value })}
                  placeholder="e.g. 2024"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Organization</label>
                <input
                  type="text"
                  value={ach.organization || ''}
                  onChange={(e) => updateAchievement(idx, { ...ach, organization: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">URL (optional)</label>
                <input
                  type="text"
                  value={ach.url || ''}
                  onChange={(e) => updateAchievement(idx, { ...ach, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Description</label>
              <textarea
                rows={2}
                value={ach.description || ''}
                onChange={(e) => updateAchievement(idx, { ...ach, description: e.target.value })}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
