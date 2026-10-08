import React from 'react';
import type { PortfolioEducation } from '../../../types/portfolio';

interface EducationEditorProps {
  education: PortfolioEducation[];
  onChangeEducation: (education: PortfolioEducation[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onChangeEducation,
}) => {
  const addEducation = () => {
    const item: PortfolioEducation = {
      institution: 'University Name',
      degree: 'B.Tech',
      field: 'Computer Science',
      start_date: '2020',
      end_date: '2024',
      achievements: [],
    };
    onChangeEducation([item, ...education]);
  };

  const removeEducation = (idx: number) => {
    onChangeEducation(education.filter((_, i) => i !== idx));
  };

  const updateEducation = (idx: number, updated: PortfolioEducation) => {
    const list = [...education];
    list[idx] = updated;
    onChangeEducation(list);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Education &amp; Credentials ({education.length})
        </h4>
        <button
          type="button"
          onClick={addEducation}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 transition"
        >
          + Add Education
        </button>
      </div>

      <div className="space-y-4">
        {education.map((edu, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Institution #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="text-zinc-500 hover:text-red-400 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, { ...edu, institution: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Degree &amp; Major</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(idx, { ...edu, degree: e.target.value })}
                    placeholder="Degree (e.g. B.S.)"
                    className="w-1/2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={edu.field || ''}
                    onChange={(e) => updateEducation(idx, { ...edu, field: e.target.value })}
                    placeholder="Field (e.g. CS)"
                    className="w-1/2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Dates</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={edu.start_date || ''}
                    onChange={(e) => updateEducation(idx, { ...edu, start_date: e.target.value })}
                    placeholder="Start"
                    className="w-1/2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={edu.end_date || ''}
                    onChange={(e) => updateEducation(idx, { ...edu, end_date: e.target.value })}
                    placeholder="End"
                    className="w-1/2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Grade / Honors</label>
                <input
                  type="text"
                  value={edu.grade || ''}
                  onChange={(e) => updateEducation(idx, { ...edu, grade: e.target.value })}
                  placeholder="e.g. 3.9 GPA / Summa Cum Laude"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
