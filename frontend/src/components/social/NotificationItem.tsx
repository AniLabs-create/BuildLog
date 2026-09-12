import React from 'react';
import { Link } from 'react-router-dom';
import type { AppNotification } from '../../types';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead?: (id: number) => void;
}

/**
 * NotificationItem Component
 *
 * One row on the notifications page: actor avatar, notification text,
 * and a link to the relevant page (follow requests page for requests).
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
}) => {
  const { actor, type } = notification;

  const icon =
    type === 'follow_request' ? '🔐' : type === 'follow_accepted' ? '🎉' : '👤';

  const targetLink =
    type === 'follow_request'
      ? '/notifications'
      : `/u/${actor.username}`;

  const createdDate = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        notification.read
          ? 'border-zinc-850 bg-zinc-900/30'
          : 'border-emerald-500/20 bg-emerald-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {actor.avatarUrl ? (
            <img
              src={actor.avatarUrl}
              alt={`${actor.username}'s avatar`}
              className="h-9 w-9 shrink-0 rounded-lg border border-zinc-750 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 font-mono text-sm font-bold text-zinc-300">
              {actor.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm text-zinc-200">
              <Link
                to={`/u/${actor.username}`}
                className="font-semibold text-white hover:text-zinc-300 transition"
              >
                {actor.displayName || actor.username}
              </Link>{' '}
              <span className="text-zinc-400">{notification.text}</span>
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-600">
              {icon} {createdDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={targetLink}
            className="font-mono text-[11px] text-zinc-500 hover:text-white transition"
          >
            {type === 'follow_request' ? 'Review' : 'View'}
          </Link>
          {!notification.read && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="cursor-pointer font-mono text-[11px] text-emerald-400 hover:text-emerald-300 transition"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
