import React, { useState } from 'react';
import type { PortfolioSkill } from '../../../types/portfolio';

interface SkillsEditorProps {
  skills: PortfolioSkill[];
  onChangeSkills: (skills: PortfolioSkill[]) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onChangeSkills }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    onChangeSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: newCategory.trim() || 'General',
        proficiency: 90,
      },
    ]);
    setNewSkillName('');
    setNewCategory('');
  };

  const removeSkill = (index: number) => {
    onChangeSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Skills &amp; Capabilities ({skills.length})
        </h4>
      </div>

      {/* Add New Skill Input Row */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
        <span className="font-semibold text-zinc-300 block">Add New Skill</span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-zinc-400 mb-1">Skill Name</label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. TypeScript, Kubernetes, PyTorch"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-zinc-400 mb-1">Category (Optional)</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Backend, Cloud, Frontend"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={addSkill}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 transition"
            >
              + Add Skill
            </button>
          </div>
        </div>
      </div>

      {/* Existing Skills List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
          >
            <div>
              <span className="font-bold text-white text-xs">{skill.name}</span>
              {skill.category && (
                <span className="ml-2 text-[10px] text-zinc-400 font-mono">
                  [{skill.category}]
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeSkill(idx)}
              className="text-zinc-500 hover:text-red-400 p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
