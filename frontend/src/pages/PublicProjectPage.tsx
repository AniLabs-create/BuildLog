import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProjectStatus } from '../components/ProjectStatus';
import { BuildLogCard } from '../components/logs/BuildLogCard';
import { getPublicProject } from '../services/users';
import { getErrorMessage } from '../utils/errors';
import type { PublicProject } from '../types';

/**
 * PublicProjectPage
 *
 * The shareable project page at /u/:username/:projectSlug.
 * Designed to be sent to recruiters, judges, and teammates —
 * it tells the story of how the project was built, step by step.
 * Public — no login required.
 */
export const PublicProjectPage: React.FC = () => {
  const { username, projectSlug } = useParams<{
    username: string;
    projectSlug: string;
  }>();

  const [data, setData] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!username || !projectSlug) return;

      try {
        setLoading(true);
        const projectData = await getPublicProject(username, projectSlug);
        setData(projectData);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load this project.'));
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [username, projectSlug]);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert('Public link copied to clipboard!'))
      .catch(() => alert('Could not copy the link. Please copy it from the address bar.'));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading project journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isPrivateWall = (error || '').toLowerCase().includes('private');
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-4xl mb-4">{isPrivateWall ? '🔒' : '🔍'}</p>
        <h1 className="text-xl font-bold text-white">
          {isPrivateWall ? 'This content is private' : 'Project not found'}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
          {error || 'This project does not exist or has been removed.'}
        </p>
        {username && (
          <Link
            to={`/u/${username}`}
            className="mt-6 inline-block font-mono text-xs text-zinc-400 hover:text-white transition"
          >
            &larr; View @{username}'s profile
          </Link>
        )}
      </div>
    );
  }

  const { project, owner, logs } = data;
  const startedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/" className="hover:text-zinc-300 transition">
          BuildLog
        </Link>
        <span>/</span>
        <Link to={`/u/${owner.username}`} className="hover:text-zinc-300 transition">
          @{owner.username}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{project.name}</span>
      </div>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 p-6 sm:p-10 mb-10">
        {/* Subtle glow accent */}
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {project.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
                {project.description}
              </p>
            </div>
            <ProjectStatus status={project.status} className="shrink-0 self-start px-3 py-1 text-sm" />
          </div>

          {/* Tech stack */}
          {project.techStack.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-zinc-750 bg-zinc-800/80 px-2.5 py-1 font-mono text-xs text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links & meta row */}
          <div className="mt-8 pt-6 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3.01-.4c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Source Code
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live Demo
                </a>
              )}
              {!project.githubUrl && !project.demoUrl && (
                <span className="text-sm text-zinc-600 italic">No links added yet</span>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className="cursor-pointer rounded-md border border-zinc-750 px-3 py-1.5 font-mono text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              Copy public link
            </button>
          </div>
        </div>
      </div>

      {/* Developer strip */}
      <Link
        to={`/u/${owner.username}`}
        className="mb-10 flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600"
      >
        <div className="flex items-center gap-4">
          {owner.avatarUrl ? (
            <img
              src={owner.avatarUrl}
              alt={`${owner.username}'s avatar`}
              className="h-11 w-11 rounded-lg border border-zinc-750 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 font-mono text-lg font-bold text-zinc-300">
              {owner.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Built by</p>
            <p className="text-sm font-semibold text-white">@{owner.username}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          Started {startedDate} &rarr;
        </span>
      </Link>

      {/* Build journey */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Build Journey</h2>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          {logs.length === 0
            ? 'No entries yet'
            : `${logs.length} ${logs.length === 1 ? 'entry' : 'entries'} — read it top to bottom to see how this project grew`}
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <p className="text-2xl mb-2">🌱</p>
          <h3 className="text-base font-semibold text-white">This journey is just beginning</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
            No build logs have been written for this project yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="relative space-y-8 border-l border-zinc-800 pl-6 sm:pl-8">
          {logs.map((log) => {
            const dateStr = new Date(log.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={log.id} className="relative">
                {/* Timeline node */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-6 h-3.5 w-3.5 rounded-full bg-emerald-500/80 ring-4 ring-zinc-950" />

                <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {dateStr}
                </p>
                <BuildLogCard log={log} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicProjectPage;
