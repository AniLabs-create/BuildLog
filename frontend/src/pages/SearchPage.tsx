import React, { useState, useEffect } from 'react';
import { UserCard } from '../components/social/UserCard';
import { searchUsers } from '../services/follows';
import { getErrorMessage } from '../utils/errors';
import type { UserSummary, FollowState } from '../types';

/**
 * SearchPage (/search)
 *
 * Find developers by username or display name. The query hits the
 * backend search endpoint (database LIKE query) — never a local filter.
 */
export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(trimmed);
        setResults(data);
        setSearched(true);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Search failed.'));
      } finally {
        setLoading(false);
      }
    }, 350); // debounce while typing

    return () => clearTimeout(timer);
  }, [query]);

  const handleFollowChanged = (username: string, newState: FollowState) => {
    setResults((prev) =>
      prev.map((u) => (u.username === username ? { ...u, followState: newState } : u))
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
        Discover
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Find developers
      </h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Search by username or display name, then follow builders you find interesting.
      </p>

      <div className="mt-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search developers... e.g. nizam"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          autoFocus
        />
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <h3 className="text-base font-semibold text-white">No developers found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Nothing matches "{query}". Try a different name or handle.
            </p>
          </div>
        )}

        {results.map((user) => (
          <UserCard key={user.id} user={user} onFollowChanged={handleFollowChanged} />
        ))}

        {!searched && !loading && (
          <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-10 text-center">
            <p className="font-mono text-sm text-zinc-500">
              Type at least 2 characters to search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
