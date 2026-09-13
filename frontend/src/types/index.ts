/**
 * BuildLog Domain Types
 *
 * In TypeScript, types and interfaces describe the "shape" of our data.
 * By defining these shapes once, TypeScript will warn us immediately in our editor
 * if we misspell a property name or pass data of the wrong type (e.g., passing
 * a string where a number is expected).
 */

/**
 * Status values a Project can have during its lifecycle.
 * Using a TypeScript union of string literals ('Idea' | 'Building' | ...) ensures
 * that only these exact allowed values can ever be assigned to a project's status.
 */
export type ProjectStatus =
  | 'Idea'
  | 'Building'
  | 'Completed'
  | 'Deployed'
  | 'Abandoned';

/**
 * Account visibility. Private accounts hide content until a follow
 * request is accepted (used by the social system milestones).
 */
export type ProfileVisibility = 'public' | 'private';

/**
 * Represents a registered user on BuildLog.
 * Maps to the backend Users table.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  skills?: string[];
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileVisibility: ProfileVisibility;
  /** False until the user finishes first-time onboarding at /setup */
  profileSetupComplete: boolean;
  createdAt: string;
}

/**
 * Payload for updating the authenticated user's own profile.
 * All fields optional — send only what changes.
 */
export interface ProfileUpdateInput {
  username?: string;
  displayName?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  skills?: string[];
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileVisibility?: ProfileVisibility;
  profileSetupComplete?: boolean;
}

/**
 * Represents a developer project tracked on BuildLog.
 * Maps to the backend Projects table.
 */
export interface Project {
  id: number;
  userId: number;
  name: string;
  /** URL-friendly identifier used on public pages: /u/:username/:slug */
  slug: string;
  description: string;
  status: ProjectStatus;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  /** Private projects are visible to the owner only */
  visibility: ProfileVisibility;
  /** Where this project came from: created here or synced from GitHub */
  source: 'manual' | 'github';
  stars: number;
  forks: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The viewer's relationship to another user.
 * SERVER-driven state — the frontend only renders it.
 */
export type FollowState = 'NOT_FOLLOWING' | 'REQUESTED' | 'FOLLOWING' | 'SELF';

/** A user summary used in search results, follower lists, and feed items. */
export interface UserSummary {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  profileVisibility: ProfileVisibility;
  followState: FollowState;
}

/** A notification for the current user. */
export interface AppNotification {
  id: number;
  type: 'follow_request' | 'follow_accepted' | 'new_follower';
  text: string;
  read: boolean;
  createdAt: string;
  actor: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

/** One activity entry in the home feed. */
export interface FeedItem {
  id: string;
  source: 'buildlog' | 'github' | 'leetcode' | string;
  type: string;
  actionText: string;
  createdAt: string;
  actor: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  project?: {
    name: string;
    slug?: string | null;
    status?: string | null;
  } | null;
  builtText?: string | null;
  url?: string | null;
  icon?: string | null;
}

// ---------- Integrations ----------

export interface GitHubStatus {
  username: string;
  avatar_url?: string;
  scopes?: string;
  connected_at: string;
  last_synced_at?: string | null;
  stats: { repositories?: number; stars?: number };
}

export interface LeetCodeStatus {
  username: string;
  connected_at: string;
  last_synced_at?: string | null;
  stats: {
    solved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    ranking?: number;
    profile_url?: string;
  };
}

export interface IntegrationsStatus {
  github: GitHubStatus | null;
  leetcode: LeetCodeStatus | null;
}

export interface SyncSummary {
  repositories: number;
  created: number;
  updated: number;
  new_activity: number;
}

export interface SyncedRepository {
  id: number;
  name: string;
  slug: string;
  description: string;
  github_url?: string;
  stars: number;
  forks: number;
  visibility: ProfileVisibility;
  last_synced_at?: string | null;
}

/** Connected-platform stats shown on public profiles (real synced data) */
export interface ProfileIntegrations {
  github?: { username: string; repositories?: number; stars?: number };
  leetcode?: {
    username: string;
    solved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    ranking?: number;
    profile_url?: string;
  };
}

/**
 * Represents a single daily build log entry for a project.
 * This is the core unit of BuildLog, answering four fast developer prompts:
 * 1. What did you build?
 * 2. What did you learn?
 * 3. What problems did you face?
 * 4. What is next?
 */
export interface BuildLog {
  id: number;
  projectId: number;
  userId: number;
  built: string;
  learned: string;
  problems: string;
  nextSteps: string;
  createdAt: string;
}

/**
 * Represents streak information calculated on the server.
 */
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

/**
 * One recent build-log entry shown in a public profile's activity feed.
 */
export interface PublicActivityItem {
  id: number;
  projectId: number;
  projectName: string;
  projectSlug: string;
  built: string;
  createdAt: string;
}

/**
 * Public developer portfolio data for the /u/:username page.
 * Contains only public information — never email or credentials.
 */
export interface PublicProfile {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  skills: string[];
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileVisibility: ProfileVisibility;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  projectCount: number;
  logCount: number;
  recentActivity: PublicActivityItem[];
  followerCount: number;
  followingCount: number;
  /** Viewer's relationship to this user (drives the Follow button) */
  followState: FollowState;
  /** True when this is a private account viewed by a non-follower */
  isPrivate: boolean;
  /** Connected-platform stats — absent when none connected or private wall */
  integrations?: ProfileIntegrations;
}

/**
 * Owner info embedded in a public project page response.
 */
export interface ProjectOwner {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Full data payload for the public project page /u/:username/:slug:
 * the project itself, its owner, and the complete build journey (logs).
 */
export interface PublicProject {
  project: Project;
  owner: ProjectOwner;
  logs: BuildLog[];
}
