import { apiRequest } from './api';
import type { FeedItem } from '../types';

/**
 * Feed Service — the home activity feed (me + people I follow).
 */

interface RawFeedItem {
  id: number;
  type: FeedItem['type'];
  action_text: string;
  created_at: string;
  actor: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  project?: {
    name: string;
    slug?: string | null;
    status?: string | null;
  } | null;
  built_text?: string | null;
}

export async function getHomeFeed(): Promise<FeedItem[]> {
  const data = await apiRequest<{ items: RawFeedItem[] }>('/feed');
  return (data.items || []).map((i) => ({
    id: i.id,
    type: i.type,
    actionText: i.action_text,
    createdAt: i.created_at,
    actor: {
      username: i.actor.username,
      displayName: i.actor.display_name ?? undefined,
      avatarUrl: i.actor.avatar_url ?? undefined,
    },
    project: i.project
      ? {
          name: i.project.name,
          slug: i.project.slug,
          status: i.project.status,
        }
      : null,
    builtText: i.built_text ?? undefined,
  }));
}
