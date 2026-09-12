import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../components/social/NotificationItem';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications';
import {
  getFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
} from '../services/follows';
import { getErrorMessage } from '../utils/errors';
import type { AppNotification } from '../types';

interface FollowRequestRow {
  id: number;
  createdAt: string;
  requester: { id: number; username: string; displayName?: string; avatarUrl?: string; bio?: string };
}

/**
 * NotificationsPage (/notifications)
 *
 * Two jobs:
 * 1. Show pending FOLLOW REQUESTS with accept/decline actions.
 * 2. Show the notification list (new follower, request, acceptance).
 */
export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [requests, setRequests] = useState<FollowRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [notifData, requestData] = await Promise.all([
        getNotifications(),
        getFollowRequests(),
      ]);
      setNotifications(notifData.items);
      setUnreadCount(notifData.unreadCount);
      setRequests(requestData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load notifications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (requestId: number) => {
    setBusyRequestId(requestId);
    setActionError(null);
    try {
      await acceptFollowRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Could not accept the request.'));
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    setBusyRequestId(requestId);
    setActionError(null);
    try {
      await declineFollowRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Could not decline the request.'));
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Could not mark as read.'));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Could not mark all as read.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            Social
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="cursor-pointer rounded-md border border-zinc-750 px-3 py-1.5 font-mono text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white"
          >
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}
      {actionError && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {actionError}
        </div>
      )}

      {/* Pending follow requests */}
      {requests.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold text-white">
            Follow requests{' '}
            <span className="font-mono text-xs text-zinc-500">({requests.length})</span>
          </h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 font-mono text-sm font-bold text-zinc-300">
                      {r.requester.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/u/${r.requester.username}`}
                        className="text-sm font-semibold text-white hover:text-zinc-300 transition"
                      >
                        {r.requester.displayName || r.requester.username}
                      </Link>
                      <p className="font-mono text-[11px] text-zinc-500">
                        @{r.requester.username} wants to follow you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(r.id)}
                      disabled={busyRequestId === r.id}
                      className="cursor-pointer rounded-md bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(r.id)}
                      disabled={busyRequestId === r.id}
                      className="cursor-pointer rounded-md border border-zinc-750 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification list */}
      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-bold text-white">Recent</h2>
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
            <p className="text-2xl mb-2">🔕</p>
            <h3 className="text-base font-semibold text-white">No notifications yet</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
              When developers follow you, request to follow you, or accept your requests,
              it shows up here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))
        )}
      </div>

      <p className="mt-8 text-center">
        <Link
          to="/search"
          className="font-mono text-xs text-zinc-500 hover:text-white transition"
        >
          Find more developers to follow &rarr;
        </Link>
      </p>
    </div>
  );
};

export default NotificationsPage;
