import React, { useState } from 'react';
import { followUser, unfollowUser } from '../../services/follows';
import { getErrorMessage } from '../../utils/errors';
import type { FollowState } from '../../types';

interface FollowButtonProps {
  username: string;
  followState: FollowState;
  /** Re-run after a successful action so the parent refetches or updates */
  onChanged?: (newState: FollowState) => void;
  size?: 'sm' | 'md';
}

/**
 * FollowButton Component
 *
 * Renders the viewer's relationship to a user and performs the matching
 * action. State comes from the SERVER (followState prop) — after an action
 * the backend's returned state is reported via onChanged.
 *
 * NOT_FOLLOWING -> Follow (or Request for private accounts, handled server-side)
 * REQUESTED     -> Requested (click to cancel)
 * FOLLOWING     -> Following (click to unfollow)
 * SELF          -> hidden entirely
 */
export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  followState,
  onChanged,
  size = 'sm',
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (followState === 'SELF') return null;

  const handleAction = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const result =
        followState === 'FOLLOWING' || followState === 'REQUESTED'
          ? await unfollowUser(username)
          : await followUser(username);
      onChanged?.(result.status);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Action failed.'));
    } finally {
      setBusy(false);
    }
  };

  const base =
    'inline-flex items-center justify-center rounded-md border font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  let label: string;
  let style: string;

  switch (followState) {
    case 'FOLLOWING':
      label = 'Following ✓';
      style = 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-rose-500/50 hover:text-rose-400';
      break;
    case 'REQUESTED':
      label = 'Requested';
      style = 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-rose-500/50 hover:text-rose-400';
      break;
    default:
      label = 'Follow';
      style = 'border-zinc-100 bg-zinc-100 text-zinc-950 font-semibold hover:bg-white';
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleAction}
        disabled={busy}
        title={
          followState === 'FOLLOWING'
            ? 'Click to unfollow'
            : followState === 'REQUESTED'
              ? 'Click to cancel request'
              : undefined
        }
        className={`${base} ${sizeClass} ${style}`}
      >
        {busy ? '...' : label}
      </button>
      {error && <span className="text-[10px] text-rose-400">{error}</span>}
    </span>
  );
};

export default FollowButton;
