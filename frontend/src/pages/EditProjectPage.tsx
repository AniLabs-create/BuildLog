import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getProject, updateProject, deleteProject } from '../services/projects';
import { getErrorMessage } from '../utils/errors';
import type { ProjectStatus, ProfileVisibility } from '../types';

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Building');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (isNaN(projectId)) {
        setError('Invalid project ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const project = await getProject(projectId);
        setName(project.name);
        setDescription(project.description);
        setStatus(project.status);
        setTechStackInput(project.techStack.join(', '));
        setGithubUrl(project.githubUrl || '');
        setDemoUrl(project.demoUrl || '');
        setVisibility(project.visibility || 'public');
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load project details.'));
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError('Please provide a project name and description.');
      return;
    }

    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await updateProject(projectId, {
        name: name.trim(),
        description: description.trim(),
        status,
        tech_stack: techStack,
        github_url: githubUrl.trim() || undefined,
        demo_url: demoUrl.trim() || undefined,
        visibility,
      });

      navigate(`/projects/${projectId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update project.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this project? All associated build logs will be permanently deleted.'
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteProject(projectId);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete project.'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">
          Dashboard
        </Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-zinc-300 transition">
          {name || 'Project'}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">Edit</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Edit Project
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Update details or tech stack for this project.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-mono text-rose-500 hover:text-rose-400 border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Delete Project
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="editName"
              className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
            >
              PROJECT NAME *
            </label>
            <input
              id="editName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="editDesc"
              className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
            >
              DESCRIPTION *
            </label>
            <textarea
              id="editDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="editStatus"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                STATUS
              </label>
              <select
                id="editStatus"
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
                htmlFor="editTech"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                TECH STACK (comma-separated)
              </label>
              <input
                id="editTech"
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="editGithub"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                GITHUB URL
              </label>
              <input
                id="editGithub"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="editDemo"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                LIVE DEMO URL
              </label>
              <input
                id="editDemo"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
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
            <Link to={`/projects/${projectId}`}>
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
