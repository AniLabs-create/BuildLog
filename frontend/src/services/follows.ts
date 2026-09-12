import { apiRequest } from './api';
import type { FollowState, UserSummary } from '../types';

/**
 * Follows Service — search, follow/unfollow, and follow requests.
 */

interface RawUserSummary {
  id: number;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  profile_visibility: string;
  follow_state: FollowState;
}

interface RawFollowRequest {
  id: number;
  created_at: string;
  requester: {
    id: number;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  };
}

function mapUserSummary(u: RawUserSummary): UserSummary {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name ?? undefined,
    avatarUrl: u.avatar_url ?? undefined,
    bio: u.bio ?? undefined,
    skills: u.skills ?? [],
    profileVisibility: (u.profile_visibility as UserSummary['profileVisibility']) ?? 'public',
    followState: u.follow_state,
  };
}

export async function searchUsers(query: string): Promise<UserSummary[]> {
  const data = await apiRequest<RawUserSummary[]>(
    `/users/search?q=${encodeURIComponent(query)}`
  );
  return data.map(mapUserSummary);
}

export async function followUser(username: string): Promise<{ status: FollowState; message: string }> {
  return apiRequest(`/users/${encodeURIComponent(username)}/follow`, { method: 'POST' });
}

export async function unfollowUser(username: string): Promise<{ status: FollowState; message: string }> {
  return apiRequest(`/users/${encodeURIComponent(username)}/follow`, { method: 'DELETE' });
}

export async function getFollowRequests(): Promise<
  Array<{ id: number; createdAt: string; requester: Omit<UserSummary, 'followState' | 'profileVisibility'> }>
> {
  const data = await apiRequest<RawFollowRequest[]>('/follow-requests');
  return data.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    requester: {
      id: r.requester.id,
      username: r.requester.username,
      displayName: r.requester.display_name ?? undefined,
      avatarUrl: r.requester.avatar_url ?? undefined,
      bio: r.requester.bio ?? undefined,
    },
  }));
}

export async function acceptFollowRequest(requestId: number): Promise<void> {
  await apiRequest(`/follow-requests/${requestId}/accept`, { method: 'POST' });
}

export async function declineFollowRequest(requestId: number): Promise<void> {
  await apiRequest(`/follow-requests/${requestId}/decline`, { method: 'POST' });
}
