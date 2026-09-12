import React from 'react';
import { Link } from 'react-router-dom';
import { FollowButton } from './FollowButton';
import type { UserSummary } from '../../types';

interface UserCardProps {
  user: UserSummary;
  /** Called after a follow action so the parent can update its list */
  onFollowChanged?: (username: string, newState: UserSummary['followState']) => void;
}

/**
 * UserCard Component
 *
 * A developer row used in search results: avatar, identity, bio/skills,
 * and a follow button reflecting the viewer's relationship.
 */
export const UserCard: React.FC<UserCardProps> = ({ user, onFollowChanged }) => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.username}'s avatar`}
              className="h-11 w-11 shrink-0 rounded-lg border border-zinc-750 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 font-mono text-lg font-bold text-zinc-300">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/u/${user.username}`}
                className="truncate text-sm font-semibold text-white hover:text-zinc-300 transition"
              >
                {user.displayName || user.username}
              </Link>
              {user.profileVisibility === 'private' && (
                <span title="Private account" className="text-xs text-zinc-500">
                  🔒
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-zinc-500">@{user.username}</p>
            {user.bio && (
              <p className="mt-1.5 truncate text-xs text-zinc-400">{user.bio}</p>
            )}
            {user.skills && user.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-750"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <FollowButton
          username={user.username}
          followState={user.followState}
          onChanged={(newState) => onFollowChanged?.(user.username, newState)}
        />
      </div>
    </div>
  );
};

export default UserCard;
