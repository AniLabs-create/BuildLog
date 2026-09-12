import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { createProject } from '../services/projects';
import { getErrorMessage } from '../utils/errors';
import type { ProjectStatus, ProfileVisibility } from '../types';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Building');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError('Please provide a project name and description.');
      return;
    }

    // Split comma-separated tech stack into an array of clean strings
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const created = await createProject({
        name: name.trim(),
        description: description.trim(),
        status,
        tech_stack: techStack,
        github_url: githubUrl.trim() || undefined,
        demo_url: demoUrl.trim() || undefined,
        visibility,
      });

      navigate(`/projects/${created.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create project.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Breadcrumb navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-zinc-300">New Project</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create a New Project
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Track what you build, problems you hit, and how the codebase evolves.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="projectName"
              className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
            >
              PROJECT NAME *
            </label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SmartShortlist, DevPulse, MiniCompiler"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="projectDescription"
              className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
            >
              DESCRIPTION *
            </label>
            <textarea
              id="projectDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project do? What core problem are you solving?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="projectStatus"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                STATUS
              </label>
              <select
                id="projectStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="Idea">Idea</option>
                <option value="Building">Building</option>
                <option value="Completed">Completed</option>
                <option value="Deployed">Deployed</option>
                <option value="Abandoned">Abandoned</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="projectTech"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                TECH STACK (comma-separated)
              </label>
              <input
                id="projectTech"
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                GITHUB URL (optional)
              </label>
              <input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="demoUrl"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                LIVE DEMO URL (optional)
              </label>
              <input
                id="demoUrl"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.vercel.app"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="projectVisibility"
              className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
            >
              VISIBILITY
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  visibility === 'public'
                    ? 'border-emerald-500/50 bg-emerald-500/5 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                🌐 Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  visibility === 'private'
                    ? 'border-emerald-500/50 bg-emerald-500/5 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                🔒 Private (only you)
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-850">
            <Link to="/dashboard">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
