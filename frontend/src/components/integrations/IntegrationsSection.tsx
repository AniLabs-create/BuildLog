import React, { useState, useEffect, useCallback } from 'react';
import {
  githubIntegration,
  leetcodeIntegration,
  getIntegrationsStatus,
} from '../../services/integrations';
import { getErrorMessage } from '../../utils/errors';
import type { IntegrationsStatus } from '../../types';
import { GitHubIcon } from '../auth/GitHubButton';

interface IntegrationsSectionProps {
  /** Compact variant for the onboarding wizard */
  compact?: boolean;
  /** Called when a connection changes (so parents can refresh) */
  onChanged?: () => void;
  /**
   * Called right before the browser redirects to GitHub's authorize page
   * (the redirect leaves the page, so parents can persist form state).
   */
  onBeforeRedirect?: () => Promise<void>;
}

function timeAgo(iso?: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) === 1 ? '' : 's'} ago`;
}

const btnGhost =
  'cursor-pointer rounded-md border border-zinc-750 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50 disabled:pointer-events-none';

/**
 * IntegrationsSection
 *
 * Settings → Integrations (and the onboarding "Connect your accounts" step).
 * Shows connection state for GitHub and LeetCode with connect / sync /
 * disconnect actions, a LeetCode username form, and a solution-push form.
 * All data comes from real syncs — nothing is faked.
 */
export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  compact = false,
  onChanged,
  onBeforeRedirect,
}) => {
  const [status, setStatus] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'github' | 'leetcode' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // LeetCode connect form
  const [lcUsername, setLcUsername] = useState('');
  const [lcFormOpen, setLcFormOpen] = useState(false);

  // Push-solution form
  const [pushOpen, setPushOpen] = useState(false);
  const [repos, setRepos] = useState<Array<{ id: number; name: string }>>([]);
  const [pushRepoId, setPushRepoId] = useState('');
  const [pushPath, setPushPath] = useState('');
  const [pushCode, setPushCode] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushResult, setPushResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus(await getIntegrationsStatus());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load integrations.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (provider: 'github' | 'leetcode', fn: () => Promise<void>) => {
    setBusy(provider);
    setError(null);
    setNotice(null);
    try {
      await fn();
      await load();
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Integration action failed.'));
    } finally {
      setBusy(null);
    }
  };

  const connectGitHub = async () => {
    try {
      await onBeforeRedirect?.();
      const url = await githubIntegration.getConnectUrl();
      window.location.href = url; // browser goes to GitHub and comes back
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not start GitHub connection.'));
    }
  };

  const connectLeetCode = () =>
    run('leetcode', async () => {
      await leetcodeIntegration.connect(lcUsername.trim());
      setLcFormOpen(false);
      setLcUsername('');
      setNotice('✓ LeetCode connected.');
    });

  const syncGitHub = () =>
    run('github', async () => {
      const summary = await githubIntegration.sync();
      setNotice(`✓ GitHub synced — repositories: ${summary.repositories}, new: ${summary.created}, activity: +${summary.new_activity}`);
    });

  const syncLeetCode = () =>
    run('leetcode', async () => {
      const result = await leetcodeIntegration.sync();
      setNotice(`✓ LeetCode synced — ${result.new_activity} new solved-problem entries.`);
    });

  const openPushForm = () =>
    run('github', async () => {
      const list = await githubIntegration.getRepositories();
      setRepos(list.map((r) => ({ id: r.id, name: r.name })));
      if (list.length > 0) setPushRepoId(String(list[0].id));
      setPushOpen(true);
    });

  const pushSolution = async () => {
    setBusy('github');
    setError(null);
    try {
      const result = await githubIntegration.pushSolution({
        external_id: pushRepoId,
        path: pushPath.trim(),
        content: pushCode,
        commit_message: pushMessage.trim() || 'Add solution via BuildLog',
      });
      setPushResult(result.commit_url || 'Pushed!');
      setNotice(`✓ Pushed to ${result.repository}/${result.path}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Push failed.'));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
      </div>
    );
  }

  const github = status?.github;
  const leetcode = status?.leetcode;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          {notice}
        </div>
      )}

      {/* GitHub card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <GitHubIcon className="mt-0.5 h-6 w-6 text-zinc-200" />
            <div>
              <p className="text-sm font-semibold text-white">GitHub</p>
              {github ? (
                <p className="mt-0.5 font-mono text-xs text-zinc-500">
                  Connected as @{github.username}
                  {github.stats?.repositories !== undefined &&
                    ` • ${github.stats.repositories} repos`}
                  {github.stats?.stars !== undefined &&
                    github.stats.stars > 0 &&
                    ` • ⭐ ${github.stats.stars}`}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {compact
                    ? 'Import repositories, activity and projects.'
                    : 'Import your repositories and developer activity.'}
                </p>
              )}
            </div>
          </div>
          {github ? (
            <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              ✓ Connected
            </span>
          ) : (
            <button onClick={connectGitHub} className={`${btnGhost} font-semibold`}>
              Connect GitHub
            </button>
          )}
        </div>

        {github && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-850 pt-4">
            <span className="mr-auto font-mono text-[11px] text-zinc-600">
              Last synced: {timeAgo(github.last_synced_at)}
            </span>
            <button onClick={syncGitHub} disabled={busy === 'github'} className={btnGhost}>
              {busy === 'github' ? 'Syncing GitHub...' : 'Sync Now'}
            </button>
            <button onClick={openPushForm} disabled={busy === 'github'} className={btnGhost}>
              Push Solution
            </button>
            <button
              onClick={() => run('github', async () => { await githubIntegration.disconnect(); setPushOpen(false); })}
              disabled={busy === 'github'}
              className={`${btnGhost} hover:border-rose-500/50 hover:text-rose-400`}
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Push-solution form */}
        {github && pushOpen && (
          <div className="mt-4 space-y-3 rounded-lg border border-zinc-850 bg-zinc-950 p-4">
            <p className="text-xs font-semibold text-zinc-300">Push a solution to a repository</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={pushRepoId}
                onChange={(e) => setPushRepoId(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
              >
                {repos.length === 0 && <option value="">No synced repositories — run Sync Now</option>}
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input
                value={pushPath}
                onChange={(e) => setPushPath(e.target.value)}
                placeholder="path: python/two-sum.py"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <input
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              placeholder="Commit message: Add Two Sum solution"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
            <textarea
              value={pushCode}
              onChange={(e) => setPushCode(e.target.value)}
              rows={5}
              placeholder="Paste your solution code..."
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={pushSolution}
                disabled={busy === 'github' || !pushRepoId || !pushPath.trim() || !pushCode.trim()}
                className="cursor-pointer rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
              >
                {busy === 'github' ? 'Pushing...' : 'Push to GitHub'}
              </button>
              {pushResult && (
                <a href={pushResult} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 underline">
                  View commit
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LeetCode card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/15 text-xs font-bold text-amber-400 border border-amber-500/30">
              LC
            </span>
            <div>
              <p className="text-sm font-semibold text-white">LeetCode</p>
              {leetcode ? (
                <div className="mt-0.5 font-mono text-xs text-zinc-500">
                  <p>
                    Connected as @{leetcode.username}
                    {leetcode.stats?.solved !== undefined && ` • ${leetcode.stats.solved} solved`}
                    {leetcode.stats?.ranking !== undefined && ` • #${leetcode.stats.ranking}`}
                  </p>
                  {leetcode.stats?.easy !== undefined && (
                    <p className="mt-0.5 text-zinc-600">
                      Easy {leetcode.stats.easy} · Medium {leetcode.stats.medium} · Hard {leetcode.stats.hard}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {compact
                    ? 'Show your coding progress and achievements.'
                    : 'Show your coding progress on BuildLog. Public profile only — no password needed.'}
                </p>
              )}
            </div>
          </div>
          {leetcode ? (
            <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              ✓ Connected
            </span>
          ) : lcFormOpen ? (
            <span className="font-mono text-xs text-zinc-500">...</span>
          ) : (
            <button onClick={() => setLcFormOpen(true)} className={`${btnGhost} font-semibold`}>
              Connect LeetCode
            </button>
          )}
        </div>

        {lcFormOpen && !leetcode && (
          <div className="mt-4 flex flex-col gap-2 rounded-lg border border-zinc-850 bg-zinc-950 p-4 sm:flex-row">
            <input
              value={lcUsername}
              onChange={(e) => setLcUsername(e.target.value)}
              placeholder="LeetCode username, e.g. nizamuddin"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
            <button
              onClick={connectLeetCode}
              disabled={busy === 'leetcode' || !lcUsername.trim()}
              className="cursor-pointer rounded-md bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
            >
              {busy === 'leetcode' ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        )}

        {leetcode && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-850 pt-4">
            <span className="mr-auto font-mono text-[11px] text-zinc-600">
              Last synced: {timeAgo(leetcode.last_synced_at)}
            </span>
            {leetcode.stats?.profile_url && (
              <a
                href={leetcode.stats.profile_url}
                target="_blank"
                rel="noreferrer"
                className={btnGhost}
              >
                View Profile
              </a>
            )}
            <button onClick={syncLeetCode} disabled={busy === 'leetcode'} className={btnGhost}>
              {busy === 'leetcode' ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => run('leetcode', async () => { await leetcodeIntegration.disconnect(); })}
              disabled={busy === 'leetcode'}
              className={`${btnGhost} hover:border-rose-500/50 hover:text-rose-400`}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsSection;
