import React, { useState } from 'react';
import type { PortfolioProjectItem } from '../../../types/portfolio';

interface ProjectsEditorProps {
  projects: PortfolioProjectItem[];
  onChangeProjects: (projects: PortfolioProjectItem[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onChangeProjects }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addProject = () => {
    const newProj: PortfolioProjectItem = {
      title: 'New Featured Project',
      slug: 'new-featured-project',
      description: 'Comprehensive description of the application architecture, problem domain, and implementation details.',
      technologies: ['TypeScript', 'FastAPI'],
      featured: true,
    };
    onChangeProjects([newProj, ...projects]);
    setEditingIndex(0);
  };

  const removeProject = (idx: number) => {
    onChangeProjects(projects.filter((_, i) => i !== idx));
    if (editingIndex === idx) setEditingIndex(null);
  };

  const updateProject = (idx: number, updated: PortfolioProjectItem) => {
    const list = [...projects];
    list[idx] = updated;
    onChangeProjects(list);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const list = [...projects];
    const temp = list[idx - 1];
    list[idx - 1] = list[idx];
    list[idx] = temp;
    onChangeProjects(list);
    if (editingIndex === idx) setEditingIndex(idx - 1);
  };

  const moveDown = (idx: number) => {
    if (idx >= projects.length - 1) return;
    const list = [...projects];
    const temp = list[idx + 1];
    list[idx + 1] = list[idx];
    list[idx] = temp;
    onChangeProjects(list);
    if (editingIndex === idx) setEditingIndex(idx + 1);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Projects &amp; Case Studies ({projects.length})
          </h4>
          <p className="text-zinc-400 text-[11px]">Rank, feature, and edit technical details</p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 transition"
        >
          + Add Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((proj, idx) => {
          const isExpanded = editingIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition ${
                isExpanded
                  ? 'border-purple-500/50 bg-zinc-900/90 shadow-xl'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              {/* Card Header / Summary Row */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-500 text-[11px]">0{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(isExpanded ? null : idx)}
                    className="text-left font-bold text-white text-sm hover:text-purple-400 transition"
                  >
                    {proj.title}
                  </button>
                  {proj.featured && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.2 text-[10px] text-amber-400 font-bold">
                      ★ Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx >= projects.length - 1}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(isExpanded ? null : idx)}
                    className="rounded-lg bg-zinc-800 px-3 py-1 text-zinc-300 hover:text-white text-[11px]"
                  >
                    {isExpanded ? 'Collapse' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                    title="Delete Project"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isExpanded && (
                <div className="p-4 border-t border-zinc-800/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(idx, { ...proj, title: e.target.value })}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-5">
                      <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!proj.featured}
                          onChange={(e) => updateProject(idx, { ...proj, featured: e.target.checked })}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span>Featured Project (Flagship)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => updateProject(idx, { ...proj, description: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1">Problem Statement</label>
                      <input
                        type="text"
                        value={proj.problem || ''}
                        onChange={(e) => updateProject(idx, { ...proj, problem: e.target.value })}
                        placeholder="What challenge was solved?"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Technical Solution</label>
                      <input
                        type="text"
                        value={proj.solution || ''}
                        onChange={(e) => updateProject(idx, { ...proj, solution: e.target.value })}
                        placeholder="How was it architected?"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Impact / Metrics</label>
                      <input
                        type="text"
                        value={proj.impact || ''}
                        onChange={(e) => updateProject(idx, { ...proj, impact: e.target.value })}
                        placeholder="e.g. 10k users, 99.9% uptime"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies ? proj.technologies.join(', ') : ''}
                        onChange={(e) =>
                          updateProject(idx, {
                            ...proj,
                            technologies: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="React, TypeScript, FastAPI"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">GitHub Repo URL</label>
                      <input
                        type="text"
                        value={proj.github_url || ''}
                        onChange={(e) => updateProject(idx, { ...proj, github_url: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={proj.demo_url || ''}
                        onChange={(e) => updateProject(idx, { ...proj, demo_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
