import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getProject } from '../services/projects';
import { createBuildLog } from '../services/buildLogs';
import { getErrorMessage } from '../utils/errors';
import type { Project } from '../types';

export const CreateBuildLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [built, setBuilt] = useState('');
  const [learned, setLearned] = useState('');
  const [problems, setProblems] = useState('');
  const [nextSteps, setNextSteps] = useState('');
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
        const p = await getProject(projectId);
        setProject(p);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load project.'));
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!built.trim() || !learned.trim() || !problems.trim() || !nextSteps.trim()) {
      setError('Please fill in all four prompts before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await createBuildLog(projectId, {
        built: built.trim(),
        learned: learned.trim(),
        problems: problems.trim(),
        next_steps: nextSteps.trim(),
      });

      navigate(`/projects/${projectId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create build log.'));
    } finally {
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
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">
          Dashboard
        </Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-zinc-300 transition">
          {project?.name || 'Project'}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">New Log</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300 border border-zinc-700">
              {project?.name}
            </span>
            <span className="font-mono text-xs text-zinc-500">&bull; 1-Minute Daily Log</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            What did you build today?
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Keep it concise. Four simple prompts to document your growth.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Built */}
          <div>
            <label
              htmlFor="logBuilt"
              className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-2"
            >
              <span>🚀</span>
              <span>1. WHAT DID YOU BUILD? *</span>
            </label>
            <textarea
              id="logBuilt"
              rows={2}
              value={built}
              onChange={(e) => setBuilt(e.target.value)}
              placeholder="e.g. Added JWT authentication flow and protected API routes."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
              required
            />
          </div>

          {/* 2. Learned */}
          <div>
            <label
              htmlFor="logLearned"
              className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-2"
            >
              <span>🧠</span>
              <span>2. WHAT DID YOU LEARN? *</span>
            </label>
            <textarea
              id="logLearned"
              rows={2}
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="e.g. How token expiration headers work and how to handle 401s in fetch."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/60"
              required
            />
          </div>

          {/* 3. Problem */}
          <div>
            <label
              htmlFor="logProblem"
              className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider mb-2"
            >
              <span>🐛</span>
              <span>3. WHAT PROBLEMS DID YOU FACE? *</span>
            </label>
            <textarea
              id="logProblem"
              rows={2}
              value={problems}
              onChange={(e) => setProblems(e.target.value)}
              placeholder="e.g. CORS preflight errors blocked browser requests when custom headers were sent."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-rose-500/60 focus:outline-none focus:ring-1 focus:ring-rose-500/60"
              required
            />
          </div>

          {/* 4. Next */}
          <div>
            <label
              htmlFor="logNext"
              className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-2"
            >
              <span>⏭</span>
              <span>4. WHAT&apos;S NEXT? *</span>
            </label>
            <textarea
              id="logNext"
              rows={2}
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="e.g. Connect the project creation form and calculate the streak."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-850">
            <span className="text-xs font-mono text-zinc-500">
              🔥 Submitting keeps your streak alive!
            </span>
            <div className="flex items-center gap-3">
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
                {submitting ? 'Publishing...' : 'Publish Build Log'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBuildLogPage;
