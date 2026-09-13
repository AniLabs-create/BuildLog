import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/Button';
import { ProjectStatus } from '../components/ProjectStatus';
import { LogStarButton } from '../components/social/LogStarButton';
import { CommentThread } from '../components/social/CommentThread';
import { SuggestionsSection } from '../components/social/SuggestionsSection';
import { useAuth } from '../hooks/useAuth';
import { socialApi } from '../services/social';
import { githubIntegration } from '../services/integrations';
import { getErrorMessage } from '../utils/errors';
import type { ProjectDetail } from '../types';

/**
 * ProjectDetailPage (/projects/:id)
 *
 * Owner/management + social view for a project:
 * - header with Log Stars (BuildLog's own reaction) and GitHub info
 * - README rendered from the synced GitHub markdown
 * - build logs with Log Stars + comment threads
 * - discussion comments and 💡 suggestions with owner-controlled statuses
 *
 * GitHub stars (⭐, synced) and BuildLog Log Stars (🔥, social) are always
 * shown as separate concepts.
 */
export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projectId = Number(id);

  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [openLogComments, setOpenLogComments] = useState<number | null>(null);
  const [logComments, setLogComments] = useState<Record<number, Array<{
    id: number;
    content: string;
    star_count: number;
    author: { username?: string | null };
  }>>>({});

  const load = async () => {
    try {
      setLoading(true);
      setDetail(await socialApi.getProjectDetail(projectId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load project details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNaN(projectId)) {
      setError('Invalid project ID.');
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const isOwner = user && detail && detail.project.userId === user.id;

  const handleSync = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const summary = await githubIntegration.sync();
      setSyncNotice(`✓ Synced — ${summary.repositories} repositories (new: ${summary.created})`);
      await load();
    } catch (err: unknown) {
      setSyncNotice(getErrorMessage(err, 'Sync failed.'));
    } finally {
      setSyncing(false);
    }
  };

  const toggleLogComments = async (logId: number) => {
    if (openLogComments === logId) {
      setOpenLogComments(null);
      return;
    }
    try {
      const list = await socialApi.listComments('build_log', logId);
      setLogComments((prev) => ({ ...prev, [logId]: list }));
      setOpenLogComments(logId);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not load comments.'));
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

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="font-mono text-rose-400 mb-4">{error || 'Project not found'}</p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const { project, owner, log_star, logs, comments, suggestions } = detail;
  const isGithub = project.source === 'github';
  const canInteract = !!user;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/dashboard" className="hover:text-zinc-300 transition">Dashboard</Link>
        <span>/</span>
        <span className="text-zinc-300">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {isGithub && (
                <span className="rounded border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                  GitHub
                </span>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{project.name}</h1>
              <ProjectStatus status={project.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              {isGithub && project.githubOwner ? `owner: ${project.githubOwner} · ` : ''}
              by @{owner.username}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Log Stars (BuildLog social) — distinct from GitHub stars */}
          <div className="shrink-0">
            <LogStarButton
              targetType="project"
              targetId={project.id}
              count={log_star.count}
              starred={log_star.starred_by_me}
              size="md"
            />
          </div>
        </div>

        {/* GitHub stats panel — synced numbers, read-only */}
        {isGithub && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-zinc-850 bg-zinc-950/60 px-4 py-3 text-sm">
            <span className="text-zinc-300">⭐ {project.stars} GitHub stars</span>
            <span className="text-zinc-400">🍴 {project.forks} forks</span>
            <span className="text-zinc-500">
              {project.visibility === 'private' ? '🔒 private' : '🌐 public'}
            </span>
            <span className="ml-auto font-mono text-xs text-zinc-600">
              last synced:{' '}
              {project.lastSyncedAt
                ? new Date(project.lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'never'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-850 pt-5">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">View on GitHub ↗</Button>
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">Live Demo ↗</Button>
            </a>
          )}
          {isOwner && (
            <>
              <Button variant="primary" size="sm" onClick={() => navigate(`/projects/${project.id}/log/new`)}>
                + New Build Log
              </Button>
              <Link to={`/projects/${project.id}/edit`}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
              {isGithub && (
                <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing}>
                  {syncing ? 'Syncing...' : '⟳ Sync Now'}
                </Button>
              )}
            </>
          )}
        </div>
        {syncNotice && <p className="mt-3 font-mono text-xs text-emerald-400">{syncNotice}</p>}

        {/* Tech stack / topics */}
        {project.techStack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-zinc-800/90 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* README (GitHub-sourced, rendered markdown) */}
      {isGithub && project.readmeContent && (
        <div className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-white">README</h2>
          <div className="max-w-none text-sm text-zinc-300 prose prose-invert prose-headings:text-white prose-a:text-emerald-400 prose-code:text-zinc-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.readmeContent}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Build logs */}
      <div className="mb-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Build Logs</h2>
            <p className="mt-0.5 font-mono text-xs text-zinc-500">
              GitHub shows what was shipped — these logs show how it was built
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
            <p className="text-2xl mb-2">🚀</p>
            <h3 className="text-base font-semibold text-white">No build logs yet</h3>
            {isOwner && (
              <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate(`/projects/${project.id}/log/new`)}>
                Create First Build Log
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {logs.map((log) => (
              <div key={log.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
                  <span className="font-mono text-xs text-zinc-400">
                    {new Date(log.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <LogStarButton
                    targetType="build_log"
                    targetId={log.id}
                    count={log.star_count}
                    starred={log.starred_by_me}
                  />
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">🚀 Built</span>
                    <p className="text-zinc-200 pl-4 border-l border-emerald-500/30 leading-relaxed">{log.built}</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">🧠 Learned</span>
                    <p className="text-zinc-200 pl-4 border-l border-cyan-500/30 leading-relaxed">{log.learned}</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">🐛 Problem</span>
                    <p className="text-zinc-200 pl-4 border-l border-rose-500/30 leading-relaxed">{log.problems}</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">⏭ Next</span>
                    <p className="text-zinc-200 pl-4 border-l border-amber-500/30 leading-relaxed">{log.next_steps}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-850 pt-3">
                  <button
                    onClick={() => toggleLogComments(log.id)}
                    className="cursor-pointer font-mono text-xs text-zinc-400 hover:text-white transition"
                  >
                    💬 Comments{log.comment_count > 0 ? ` (${log.comment_count})` : ''}
                  </button>
                  {openLogComments === log.id && (
                    <div className="mt-3">
                      <CommentThread
                        targetType="build_log"
                        targetId={log.id}
                        comments={(logComments[log.id] || []).map((c) => ({
                          id: c.id,
                          target_type: 'build_log' as const,
                          target_id: log.id,
                          content: c.content,
                          created_at: '',
                          star_count: c.star_count,
                          author: c.author,
                        }))}
                        canComment={canInteract}
                        projectOwnerId={project.userId}
                        onChanged={() => toggleLogComments(log.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-bold text-white mb-1">💡 Suggestions</h2>
        <p className="mb-5 font-mono text-xs text-zinc-500">
          Feature ideas from the community — the project owner marks them Planned / Implemented.
        </p>
        <SuggestionsSection
          projectId={project.id}
          suggestions={suggestions}
          isOwner={!!isOwner}
          canParticipate={canInteract}
          projectOwnerId={project.userId}
          onChanged={load}
        />
      </div>

      {/* Discussion */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-bold text-white mb-1">Discussion</h2>
        <p className="mb-5 font-mono text-xs text-zinc-500">Comments on this project</p>
        <CommentThread
          targetType="project"
          targetId={project.id}
          comments={comments}
          canComment={canInteract}
          projectOwnerId={project.userId}
          onChanged={load}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
