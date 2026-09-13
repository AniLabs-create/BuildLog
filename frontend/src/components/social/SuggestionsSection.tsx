import React, { useState } from 'react';
import { socialApi } from '../../services/social';
import { useAuth } from '../../hooks/useAuth';
import { LogStarButton } from './LogStarButton';
import { CommentThread } from './CommentThread';
import { getErrorMessage } from '../../utils/errors';
import type { SuggestionItem } from '../../types';

interface SuggestionsSectionProps {
  projectId: number;
  suggestions: SuggestionItem[];
  /** Only the project owner can change statuses */
  isOwner: boolean;
  canParticipate: boolean;
  projectOwnerId: number;
  onChanged?: () => void;
}

const STATUS_STYLES: Record<SuggestionItem['status'], string> = {
  Open: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  Planned: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  Implemented: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  Rejected: 'border-zinc-700 bg-zinc-800 text-zinc-400',
};

/**
 * SuggestionsSection Component
 *
 * 💡 User suggestions for a project, displayed separately from discussion
 * comments. The project owner moves suggestions between
 * Open / Planned / Implemented / Rejected; authors can delete their own.
 */
export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  projectId,
  suggestions,
  isOwner,
  canParticipate,
  projectOwnerId,
  onChanged,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Array<{ id: number; content: string; author: { username?: string | null }; star_count: number }>>>({}); // prettier-ignore

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await socialApi.addSuggestion(projectId, content.trim());
      setContent('');
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Suggestion failed.'));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (id: number, status: SuggestionItem['status']) => {
    setBusy(true);
    try {
      await socialApi.setSuggestionStatus(id, status);
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Status update failed.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);
    try {
      await socialApi.deleteSuggestion(id);
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Delete failed.'));
    } finally {
      setBusy(false);
    }
  };

  const toggleComments = async (id: number) => {
    if (expandedComments === id) {
      setExpandedComments(null);
      return;
    }
    try {
      const list = await socialApi.listComments('suggestion', id);
      setComments((prev) => ({ ...prev, [id]: list }));
      setExpandedComments(id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not load comments.'));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {suggestions.length === 0 && (
        <p className="font-mono text-xs text-zinc-600">
          No suggestions yet. 💡 Got an idea for this project? Share it below.
        </p>
      )}

      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-lg">💡</span>
              <div className="min-w-0">
                <p className="text-sm text-zinc-200 leading-relaxed">{suggestion.content}</p>
                <p className="mt-1 font-mono text-[11px] text-zinc-600">
                  @{suggestion.author.username ?? 'unknown'}
                  {' • '}
                  {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[suggestion.status]}`}
            >
              {suggestion.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-850 pt-3">
            <LogStarButton
              targetType="suggestion"
              targetId={suggestion.id}
              count={suggestion.star_count}
              starred={suggestion.starred_by_me}
            />
            <button
              onClick={() => toggleComments(suggestion.id)}
              className="cursor-pointer rounded-md border border-zinc-750 px-2 py-0.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              💬 Comments{suggestion.comment_count > 0 ? ` (${suggestion.comment_count})` : ''}
            </button>

            {isOwner && (
              <select
                value={suggestion.status}
                onChange={(e) => setStatus(suggestion.id, e.target.value as SuggestionItem['status'])}
                disabled={busy}
                className="ml-auto cursor-pointer rounded-md border border-zinc-750 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Planned">Planned</option>
                <option value="Implemented">Implemented</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}
            {user && user.username === suggestion.author.username && (
              <button
                onClick={() => remove(suggestion.id)}
                disabled={busy}
                className={`${isOwner ? '' : 'ml-auto'} cursor-pointer font-mono text-[11px] text-zinc-600 hover:text-rose-400 transition`}
              >
                Delete
              </button>
            )}
          </div>

          {expandedComments === suggestion.id && (
            <div className="mt-3 border-t border-zinc-850 pt-3">
              <CommentThread
                targetType="suggestion"
                targetId={suggestion.id}
                comments={
                  (comments[suggestion.id] || []).map((c) => ({
                    id: c.id,
                    target_type: 'suggestion' as const,
                    target_id: suggestion.id,
                    content: c.content,
                    created_at: '',
                    star_count: c.star_count,
                    author: c.author,
                  }))
                }
                canComment={canParticipate}
                projectOwnerId={projectOwnerId}
                onChanged={() => toggleComments(suggestion.id)}
              />
            </div>
          )}
        </div>
      ))}

      {canParticipate && (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="💡 Suggest an improvement..."
            maxLength={2000}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !content.trim()}
            className="cursor-pointer rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
          >
            {busy ? '...' : 'Suggest'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SuggestionsSection;
