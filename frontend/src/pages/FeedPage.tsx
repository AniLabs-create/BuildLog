import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomeFeed } from '../services/feed';
import { getErrorMessage } from '../utils/errors';
import type { FeedItem } from '../types';

/**
 * FeedPage (/home)
 *
 * The developer activity feed: newest activities from the current user
 * and everyone they follow. Deliberately a "changelog" feel — no likes,
 * no comments, just building progress.
 */
export const FeedPage: React.FC = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        setItems(await getHomeFeed());
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load your feed.'));
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const typeIcon: Record<string, string> = {
    project_created: '🚀',
    project_completed: '✅',
    project_deployed: '🌍',
    new_build_log: '🚀',
  };

  const sourceBadge: Record<string, { label: string; className: string }> = {
    buildlog: { label: 'BuildLog', className: 'border-zinc-700 text-zinc-400' },
    github: { label: 'GitHub', className: 'border-purple-500/40 text-purple-400' },
    leetcode: { label: 'LeetCode', className: 'border-amber-500/40 text-amber-400' },
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
        Home
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Building activity
      </h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        What you and the developers you follow are building right now.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
            <p className="text-2xl mb-2">🛠️</p>
            <h3 className="text-base font-semibold text-white">Your feed is quiet</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
              Log your first build or follow developers from{' '}
              <Link to="/search" className="text-zinc-300 underline hover:text-white">
                Search
              </Link>{' '}
              to fill this feed with building activity.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 transition hover:border-zinc-700"
              >
                <div className="flex items-start gap-3.5">
                  {item.actor.avatarUrl ? (
                    <img
                      src={item.actor.avatarUrl}
                      alt={`${item.actor.username}'s avatar`}
                      className="h-10 w-10 shrink-0 rounded-lg border border-zinc-750 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 font-mono text-base font-bold text-zinc-300">
                      {item.actor.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <Link
                        to={`/u/${item.actor.username}`}
                        className="font-semibold text-white hover:text-zinc-300 transition"
                      >
                        {item.actor.displayName || item.actor.username}
                      </Link>{' '}
                      {item.source === 'buildlog' ? (
                        <>
                          <span className="text-zinc-400">{item.actionText}</span>{' '}
                          {item.project &&
                            (item.project.slug ? (
                              <Link
                                to={`/u/${item.actor.username}/${item.project.slug}`}
                                className="font-semibold text-zinc-200 hover:text-white transition"
                              >
                                {item.project.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-zinc-500 italic">
                                {item.project.name}
                              </span>
                            ))}
                        </>
                      ) : (
                        item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-zinc-200 hover:text-white transition"
                          >
                            {item.actionText}
                          </a>
                        ) : (
                          <span className="font-semibold text-zinc-200">{item.actionText}</span>
                        )
                      )}
                    </p>

                    {item.builtText && (
                      <p className="mt-2 text-sm text-zinc-300 pl-3 border-l border-emerald-500/30 leading-relaxed">
                        🚀 {item.builtText}
                      </p>
                    )}

                    <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-zinc-600">
                      <span>{item.icon || typeIcon[item.type] || '•'}</span>
                      <span>{dateStr}</span>
                      {sourceBadge[item.source] && (
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${sourceBadge[item.source].className}`}
                        >
                          {sourceBadge[item.source].label}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FeedPage;
