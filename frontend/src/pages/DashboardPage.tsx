import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { StreakCard } from '../components/dashboard/StreakCard';
import { Timeline } from '../components/timeline/Timeline';
import { ProjectStatus } from '../components/ProjectStatus';
import { useAuth } from '../hooks/useAuth';
import { getProjects } from '../services/projects';
import { getDashboardSummary } from '../services/stats';
import type { DashboardSummary } from '../services/stats';
import { getIntegrationsStatus } from '../services/integrations';
import { getErrorMessage } from '../utils/errors';
import type { Project, IntegrationsStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [projectsData, summaryData, integrationsData] = await Promise.all([
          getProjects(),
          getDashboardSummary(),
          getIntegrationsStatus().catch(() => null),
        ]);
        setProjects(projectsData);
        setSummary(summaryData);
        setIntegrations(integrationsData);
      } catch (err: unknown) {
        console.error('Failed to load dashboard:', err);
        setError(getErrorMessage(err, 'Failed to load dashboard data.'));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading your developer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-850 pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            Developer Dashboard
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Good evening, {user?.displayName || user?.username}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Keep your momentum alive by tracking what you build and learn today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/projects/new')}
          >
            + New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StreakCard
          currentStreak={summary?.currentStreak ?? 0}
          longestStreak={summary?.longestStreak ?? 0}
        />
        <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-5 flex flex-col justify-between">
          <p className="font-mono text-xs text-zinc-500 uppercase">Active Projects</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-white">
              {summary?.projectCount ?? projects.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Tracked on BuildLog</p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-5 flex flex-col justify-between">
          <p className="font-mono text-xs text-zinc-500 uppercase">Total Build Logs</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-emerald-400">
              {summary?.logCount ?? 0}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Documented steps of growth</p>
          </div>
        </div>
      </div>

      {/* Developer identity row (real synced integration stats) */}
      {integrations && (integrations.github || integrations.leetcode) && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {integrations.github && (
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-4">
              <p className="font-mono text-[11px] text-zinc-500 uppercase">GitHub</p>
              <p className="mt-1.5 text-sm text-zinc-300">
                @{integrations.github.username} · {integrations.github.stats?.repositories ?? 0} repositories
                {(integrations.github.stats?.stars ?? 0) > 0 && ` · ⭐ ${integrations.github.stats?.stars}`}
              </p>
            </div>
          )}
          {integrations.leetcode && (
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-4">
              <p className="font-mono text-[11px] text-zinc-500 uppercase">LeetCode</p>
              <p className="mt-1.5 text-sm text-zinc-300">
                @{integrations.leetcode.username}
                {integrations.leetcode.stats?.solved !== undefined &&
                  ` · ${integrations.leetcode.stats.solved} solved`}
                {integrations.leetcode.stats?.ranking !== undefined &&
                  ` · #${integrations.leetcode.stats.ranking}`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Projects Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Your Projects</h2>
            <Link
              to="/projects/new"
              className="text-xs font-mono text-zinc-400 hover:text-white transition"
            >
              + Add Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
              <p className="text-2xl mb-2">📁</p>
              <h3 className="text-base font-semibold text-white">
                No projects tracked yet
              </h3>
              <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
                Create your first project to start logging daily building progress.
              </p>
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/projects/new')}
                >
                  Create First Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-base font-semibold text-white hover:text-zinc-300 transition"
                        >
                          {project.name}
                        </Link>
                        <ProjectStatus status={project.status} />
                        {project.source === 'github' && (
                          <span className="rounded border border-purple-500/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-purple-400">
                            GitHub
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => navigate(`/projects/${project.id}/log/new`)}
                    >
                      + Log
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-850/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-zinc-800/90 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-zinc-500 hover:text-zinc-300 font-mono text-[11px] transition"
                    >
                      View Logs &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline Column */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Timeline</h2>
            <span className="text-xs font-mono text-zinc-500">Live</span>
          </div>

          <Timeline items={summary?.recentActivity ?? []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
