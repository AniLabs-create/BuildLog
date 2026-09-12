import { apiRequest } from './api';
import type { BuildLog } from '../types';

export interface BuildLogInput {
  built: string;
  learned: string;
  problems: string;
  next_steps: string;
}

interface RawBuildLogResponse {
  id: number;
  project_id: number;
  user_id: number;
  built: string;
  learned: string;
  problems: string;
  next_steps: string;
  created_at: string;
}

function mapBuildLog(data: RawBuildLogResponse): BuildLog {
  return {
    id: data.id,
    projectId: data.project_id,
    userId: data.user_id,
    built: data.built,
    learned: data.learned,
    problems: data.problems,
    nextSteps: data.next_steps,
    createdAt: data.created_at,
  };
}

export async function getProjectLogs(projectId: number): Promise<BuildLog[]> {
  const data = await apiRequest<RawBuildLogResponse[]>(`/projects/${projectId}/logs`);
  return data.map(mapBuildLog);
}

export async function createBuildLog(
  projectId: number,
  input: BuildLogInput
): Promise<BuildLog> {
  const data = await apiRequest<RawBuildLogResponse>(`/projects/${projectId}/logs`, {
    method: 'POST',
    data: input,
  });
  return mapBuildLog(data);
}

export async function updateBuildLog(
  logId: number,
  input: BuildLogInput
): Promise<BuildLog> {
  const data = await apiRequest<RawBuildLogResponse>(`/logs/${logId}`, {
    method: 'PUT',
    data: input,
  });
  return mapBuildLog(data);
}

export async function deleteBuildLog(logId: number): Promise<void> {
  await apiRequest<void>(`/logs/${logId}`, {
    method: 'DELETE',
  });
}
