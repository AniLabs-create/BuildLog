import { apiRequest } from './api';
import type {
  PublicProfile,
  PublicProject,
  Project,
  ProfileUpdateInput,
  ProfileVisibility,
  User,
} from '../types';

/**
 * Users Service
 *
 * Talks to the /users endpoints. Some are public (no authentication)
 * and power the shareable portfolio pages; others (username check,
 * PUT /users/me) require a JWT token via the api client.
 */

// ---------- Authenticated endpoints ----------

interface UsernameCheckResponse {
  username: string;
  available: boolean;
  reason?: string | null;
}

export async function checkUsernameAvailability(
  username: string
): Promise<UsernameCheckResponse> {
  return apiRequest<UsernameCheckResponse>(
    `/users/check-username?username=${encodeURIComponent(username)}`
  );
}

export async function updateMyProfile(input: ProfileUpdateInput): Promise<User> {
  // Convert camelCase frontend input to the snake_case body the backend expects
  const data = await apiRequest<RawUserResponse>('/users/me', {
    method: 'PUT',
    data: {
      username: input.username,
      display_name: input.displayName,
      bio: input.bio,
      college: input.college,
      branch: input.branch,
      year: input.year,
      skills: input.skills,
      avatar_url: input.avatarUrl,
      github_url: input.githubUrl,
      linkedin_url: input.linkedinUrl,
      portfolio_url: input.portfolioUrl,
      profile_visibility: input.profileVisibility,
      profile_setup_complete: input.profileSetupComplete,
    },
  });
  return mapUser(data);
}

// ---------- Shared user mapping ----------

/** Raw snake_case user object exactly as the backend sends it. */
export interface RawUserResponse {
  id: number;
  username: string;
  email: string;
  display_name?: string | null;
  bio?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  skills?: string[] | null;
  avatar_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  profile_visibility?: ProfileVisibility | null;
  profile_setup_complete?: boolean | null;
  created_at: string;
}

export function mapUser(data: RawUserResponse): User {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    displayName: data.display_name ?? undefined,
    bio: data.bio ?? undefined,
    college: data.college ?? undefined,
    branch: data.branch ?? undefined,
    year: data.year ?? undefined,
    skills: data.skills ?? [],
    avatarUrl: data.avatar_url ?? undefined,
    githubUrl: data.github_url ?? undefined,
    linkedinUrl: data.linkedin_url ?? undefined,
    portfolioUrl: data.portfolio_url ?? undefined,
    profileVisibility: data.profile_visibility ?? 'public',
    profileSetupComplete: data.profile_setup_complete ?? false,
    createdAt: data.created_at,
  };
}

// ---------- Public endpoints ----------

interface RawPublicActivityItem {
  id: number;
  project_id: number;
  project_name: string;
  project_slug: string;
  built: string;
  created_at: string;
}

interface RawPublicProfile {
  id: number;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  skills?: string[] | null;
  avatar_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  profile_visibility?: ProfileVisibility | null;
  created_at: string;
  follower_count?: number;
  following_count?: number;
  follow_state?: string;
  is_private?: boolean;
  integrations?: Record<string, unknown>;
  current_streak: number;
  longest_streak: number;
  project_count: number;
  log_count: number;
  recent_activity: RawPublicActivityItem[];
}

interface RawProjectSummary {
  id: number;
  user_id: number;
  name: string;
  slug?: string;
  description: string;
  status: string;
  tech_stack: string[];
  github_url?: string | null;
  demo_url?: string | null;
  visibility?: string;
  source?: string;
  stars?: number;
  forks?: number;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface RawPublicProject {
  project: RawProjectSummary;
  owner: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  };
  logs: Array<{
    id: number;
    project_id: number;
    user_id: number;
    built: string;
    learned: string;
    problems: string;
    next_steps: string;
    created_at: string;
  }>;
}

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const data = await apiRequest<RawPublicProfile>(
    `/users/${encodeURIComponent(username)}`
  );

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name ?? undefined,
    bio: data.bio ?? undefined,
    college: data.college ?? undefined,
    branch: data.branch ?? undefined,
    year: data.year ?? undefined,
    skills: data.skills ?? [],
    avatarUrl: data.avatar_url ?? undefined,
    githubUrl: data.github_url ?? undefined,
    linkedinUrl: data.linkedin_url ?? undefined,
    portfolioUrl: data.portfolio_url ?? undefined,
    profileVisibility: data.profile_visibility ?? 'public',
    createdAt: data.created_at,
    followerCount: data.follower_count ?? 0,
    followingCount: data.following_count ?? 0,
    followState: (data.follow_state as PublicProfile['followState']) ?? 'NOT_FOLLOWING',
    isPrivate: data.is_private ?? false,
    integrations: (data.integrations ?? undefined) as PublicProfile['integrations'],
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    projectCount: data.project_count,
    logCount: data.log_count,
    recentActivity: (data.recent_activity || []).map((item) => ({
      id: item.id,
      projectId: item.project_id,
      projectName: item.project_name,
      projectSlug: item.project_slug,
      built: item.built,
      createdAt: item.created_at,
    })),
  };
}

export async function getPublicUserProjects(username: string): Promise<Project[]> {
  const data = await apiRequest<RawProjectSummary[]>(
    `/users/${encodeURIComponent(username)}/projects`
  );

  return data.map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    slug: p.slug || '',
    description: p.description,
    status: p.status as Project['status'],
    techStack: p.tech_stack || [],
    githubUrl: p.github_url ?? undefined,
    demoUrl: p.demo_url ?? undefined,
    visibility: (p.visibility as Project['visibility']) ?? 'public',
    source: (p.source as Project['source']) ?? 'manual',
    stars: p.stars ?? 0,
    forks: p.forks ?? 0,
    lastSyncedAt: p.last_synced_at ?? undefined,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export async function getPublicProject(
  username: string,
  projectSlug: string
): Promise<PublicProject> {
  const data = await apiRequest<RawPublicProject>(
    `/users/${encodeURIComponent(username)}/projects/${encodeURIComponent(projectSlug)}`
  );

  return {
    project: {
      id: data.project.id,
      userId: data.project.user_id,
      name: data.project.name,
      slug: data.project.slug || projectSlug,
      description: data.project.description,
      status: data.project.status as Project['status'],
      techStack: data.project.tech_stack || [],
      githubUrl: data.project.github_url ?? undefined,
      demoUrl: data.project.demo_url ?? undefined,
      visibility: (data.project.visibility as Project['visibility']) ?? 'public',
      source: (data.project.source as Project['source']) ?? 'manual',
      stars: data.project.stars ?? 0,
      forks: data.project.forks ?? 0,
      lastSyncedAt: data.project.last_synced_at ?? undefined,
      createdAt: data.project.created_at,
      updatedAt: data.project.updated_at,
    },
    owner: {
      username: data.owner.username,
      displayName: data.owner.display_name ?? undefined,
      avatarUrl: data.owner.avatar_url ?? undefined,
      bio: data.owner.bio ?? undefined,
    },
    logs: (data.logs || []).map((log) => ({
      id: log.id,
      projectId: log.project_id,
      userId: log.user_id,
      built: log.built,
      learned: log.learned,
      problems: log.problems,
      nextSteps: log.next_steps,
      createdAt: log.created_at,
    })),
  };
}
