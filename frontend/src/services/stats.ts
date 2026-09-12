import { apiRequest } from './api';
import type { StreakInfo } from '../types';

export interface TimelineItem {
  id: number;
  projectId: number;
  projectName: string;
  projectStatus: string;
  built: string;
  learned: string;
  problems: string;
  nextSteps: string;
  createdAt: string;
}

export interface DashboardSummary {
  currentStreak: number;
  longestStreak: number;
  projectCount: number;
  logCount: number;
  recentActivity: TimelineItem[];
}

interface RawStreakResponse {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface RawTimelineItem {
  id: number;
  project_id: number;
  project_name: string;
  project_status: string;
  built: string;
  learned: string;
  problems: string;
  next_steps: string;
  created_at: string;
}

interface RawDashboardSummary {
  current_streak: number;
  longest_streak: number;
  project_count: number;
  log_count: number;
  recent_activity: RawTimelineItem[];
}

export async function getStreak(): Promise<StreakInfo> {
  const data = await apiRequest<RawStreakResponse>('/stats/streak');
  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastActivityDate: data.last_activity_date || undefined,
  };
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const data = await apiRequest<RawTimelineItem[]>('/stats/timeline');
  return data.map((item) => ({
    id: item.id,
    projectId: item.project_id,
    projectName: item.project_name,
    projectStatus: item.project_status,
    built: item.built,
    learned: item.learned,
    problems: item.problems,
    nextSteps: item.next_steps,
    createdAt: item.created_at,
  }));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const data = await apiRequest<RawDashboardSummary>('/stats/dashboard');
  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    projectCount: data.project_count,
    logCount: data.log_count,
    recentActivity: (data.recent_activity || []).map((item) => ({
      id: item.id,
      projectId: item.project_id,
      projectName: item.project_name,
      projectStatus: item.project_status,
      built: item.built,
      learned: item.learned,
      problems: item.problems,
      nextSteps: item.next_steps,
      createdAt: item.created_at,
    })),
  };
}
