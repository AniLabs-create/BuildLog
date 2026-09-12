import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getProject } from '../services/projects';
import { getProjectLogs, updateBuildLog } from '../services/buildLogs';
import { getErrorMessage } from '../utils/errors';
import type { Project } from '../types';

/**
 * EditBuildLogPage
 *
 * Edits an existing build log's four prompts. Route:
 * /projects/:id/log/:logId/edit — owner only (backend enforces too).
 */
export const EditBuildLogPage: React.FC = () => {
  const { id, logId } = useParams<{ id: string; logId: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const numericLogId = Number(logId);

  const [project, setProject] = useState<Project | null>(null);
  const [built, setBuilt] = useState('');
  const [learned, setLearned] = useState('');
  const [problems, setProblems] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLog() {
      if (isNaN(projectId) || isNaN(numericLogId)) {
        setError('Invalid project or log ID.');
        setLoading(false);
        return;
      }

      try {
        const [projectData, logs] = await Promise.all([
          getProject(projectId),
          getProjectLogs(projectId),
        ]);
        const log = logs.find((l) => l.id === numericLogId);
        if (!log) {
          setError('Build log not found.');
          setLoading(false);
          return;
        }
        setProject(projectData);
        setBuilt(log.built);
        setLearned(log.learned);
        setProblems(log.problems);
        setNextSteps(log.nextSteps);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load the build log.'));
      } finally {
        setLoading(false);
      }
    }

    loadLog();
  }, [projectId, numericLogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!built.trim() || !learned.trim() || !problems.trim() || !nextSteps.trim()) {
      setError('Please fill in all four prompts before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await updateBuildLog(numericLogId, {
        built: built.trim(),
        learned: learned.trim(),
        problems: problems.trim(),
        next_steps: nextSteps.trim(),
      });
      navigate(`/projects/${projectId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update the build log.'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading build log...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="font-mono text-rose-400 mb-4">{error}</p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500';
  const labelClass = 'block text-xs font-mono font-medium text-zinc-300 mb-1.5';

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">Dashboard</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-zinc-300 transition">
          {project?.name ?? 'Project'}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">Edit Log</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Edit Build Log</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Update any part of your {project?.name ?? 'project'} log.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="editBuilt" className={labelClass}>🚀 WHAT DID YOU BUILD?</label>
            <textarea id="editBuilt" rows={2} value={built} onChange={(e) => setBuilt(e.target.value)} className={`${inputClass} resize-none`} required />
          </div>
          <div>
            <label htmlFor="editLearned" className={labelClass}>🧠 WHAT DID YOU LEARN?</label>
            <textarea id="editLearned" rows={2} value={learned} onChange={(e) => setLearned(e.target.value)} className={`${inputClass} resize-none`} required />
          </div>
          <div>
            <label htmlFor="editProblems" className={labelClass}>🐛 WHAT PROBLEMS DID YOU FACE?</label>
            <textarea id="editProblems" rows={2} value={problems} onChange={(e) => setProblems(e.target.value)} className={`${inputClass} resize-none`} required />
          </div>
          <div>
            <label htmlFor="editNext" className={labelClass}>⏭ WHAT'S NEXT?</label>
            <textarea id="editNext" rows={2} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} className={`${inputClass} resize-none`} required />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-850">
            <Link to={`/projects/${projectId}`}>
              <Button type="button" variant="ghost" size="md">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBuildLogPage;
