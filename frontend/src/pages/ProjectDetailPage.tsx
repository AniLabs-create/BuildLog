import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BuildLogCard } from '../components/logs/BuildLogCard';
import { ProjectStatus } from '../components/ProjectStatus';
import { useAuth } from '../hooks/useAuth';
import { getProject } from '../services/projects';
import { getProjectLogs, deleteBuildLog } from '../services/buildLogs';
import { getErrorMessage } from '../utils/errors';
import type { Project, BuildLog } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (isNaN(projectId)) {
        setError('Invalid project ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [projectData, logsData] = await Promise.all([
          getProject(projectId),
          getProjectLogs(projectId),
        ]);
        setProject(projectData);
        setLogs(logsData);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load project details.'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  const handleEditLog = (logId: number) => {
    navigate(`/projects/${projectId}/log/${logId}/edit`);
  };

  // Only the project owner may edit the project or add/delete logs.
  const isOwner = user?.id === project?.userId;

  const handleDeleteLog = async (logId: number) => {
    if (!window.confirm('Are you sure you want to delete this build log?')) {
      return;
    }

    try {
      await deleteBuildLog(logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete log.'));
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

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="font-mono text-rose-400 mb-4">{error || 'Project not found'}</p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{project.name}</span>
      </div>

      {/* Project Header Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {project.name}
              </h1>
              <ProjectStatus status={project.status} />
            </div>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>

          {isOwner && (
            <div className="flex items-center gap-3 shrink-0">
              <Link to={`/projects/${project.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit Project
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/projects/${project.id}/log/new`)}
              >
                + New Build Log
              </Button>
            </div>
          )}
        </div>

        {/* Tech Stack & External Links */}
        <div className="mt-6 pt-5 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 font-mono">Tech Stack:</span>
            {project.techStack.length > 0 ? (
              project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                >
                  {tech}
                </span>
              ))
            ) : (
              <span className="text-zinc-600 italic">No stack specified</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-white transition flex items-center gap-1.5"
              >
                <span>GitHub &rarr;</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5"
              >
                <span>Live Demo &rarr;</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Build Logs Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Build Journey
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Chronological logs ({logs.length} entries)
            </p>
          </div>

          {isOwner && logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${project.id}/log/new`)}
            >
              + Add Log
            </Button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
            <p className="text-2xl mb-2">🚀</p>
            <h3 className="text-base font-semibold text-white">
              No build logs yet
            </h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
              Spend 60 seconds logging what you built, what you learned, and what broke today.
            </p>
            {isOwner && (
              <div className="mt-6">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/projects/${project.id}/log/new`)}
                >
                  Create First Build Log
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <BuildLogCard
                key={log.id}
                log={log}
                onDelete={isOwner ? handleDeleteLog : undefined}
                onEdit={isOwner ? handleEditLog : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
