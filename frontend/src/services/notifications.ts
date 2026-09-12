import { apiRequest } from './api';
import type { AppNotification } from '../types';

/**
 * Notifications Service — poll-based (no WebSockets in V1).
 */

interface RawNotification {
  id: number;
  type: AppNotification['type'];
  text: string;
  read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export async function getNotifications(): Promise<{
  items: AppNotification[];
  unreadCount: number;
}> {
  const data = await apiRequest<{ items: RawNotification[]; unread_count: number }>(
    '/notifications'
  );

  return {
    items: (data.items || []).map((n) => ({
      id: n.id,
      type: n.type,
      text: n.text,
      read: n.read,
      createdAt: n.created_at,
      actor: {
        username: n.actor.username,
        displayName: n.actor.display_name ?? undefined,
        avatarUrl: n.actor.avatar_url ?? undefined,
      },
    })),
    unreadCount: data.unread_count,
  };
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest('/notifications/read-all', { method: 'POST' });
}
