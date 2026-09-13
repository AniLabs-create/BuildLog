import React, { useState } from 'react';
import { LogStarButton } from './LogStarButton';
import { socialApi } from '../../services/social';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errors';
import type { SocialComment, SocialTargetType } from '../../types';

interface CommentThreadProps {
  targetType: Exclude<SocialTargetType, 'comment'>;
  targetId: number;
  comments: SocialComment[];
  /** Whether the viewer may comment (public pages allow logged-out views) */
  canComment: boolean;
  /** Project owner id — owners may moderate comments */
  projectOwnerId: number;
  onChanged?: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * CommentThread Component
 *
 * Reusable comment list + form for projects, build logs, and suggestions.
 * Each comment has its own Log Star button; authors and the project owner
 * can delete comments.
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  targetType,
  targetId,
  comments,
  canComment,
  projectOwnerId,
  onChanged,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await socialApi.addComment(targetType, targetId, content.trim());
      setContent('');
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Comment failed.'));
    } finally {
      setBusy(false);
    }
  };

  const removeComment = async (id: number) => {
    try {
      await socialApi.deleteComment(id);
      onChanged?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Delete failed.'));
    }
  };

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="font-mono text-xs text-zinc-600">No comments yet.</p>
      )}

      {comments.map((comment) => {
        const canDelete = user && (user.id === projectOwnerId || comment.author.username === user.username);
        return (
          <div key={comment.id} className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-800 font-mono text-[10px] font-bold text-zinc-300">
                  {(comment.author.username ?? '?').charAt(0).toUpperCase()}
                </div>
                <p className="font-mono text-xs text-zinc-400">
                  @{comment.author.username}
                  <span className="mx-2 text-zinc-700">•</span>
                  {timeAgo(comment.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LogStarButton
                  targetType="comment"
                  targetId={comment.id}
                  count={comment.star_count}
                  starred={false}
                />
                {canDelete && (
                  <button
                    onClick={() => removeComment(comment.id)}
                    className="cursor-pointer font-mono text-[11px] text-zinc-600 hover:text-rose-400 transition"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-200 leading-relaxed">{comment.content}</p>
          </div>
        );
      })}

      {canComment && (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            maxLength={2000}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !content.trim()}
            className="cursor-pointer rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
          >
            {busy ? '...' : 'Comment'}
          </button>
        </form>
      )}
      {!canComment && comments.length > 0 && (
        <p className="font-mono text-[11px] text-zinc-600">Log in to join the discussion.</p>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
};

export default CommentThread;
