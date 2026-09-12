import { apiRequest } from './api';
import type { Project, ProjectStatus } from '../types';

export interface ProjectInput {
  name: string;
  description: string;
  status: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  visibility: string;
}

interface RawProjectResponse {
  id: number;
  user_id: number;
  name: string;
  slug?: string;
  description: string;
  status: ProjectStatus;
  tech_stack: string[];
  github_url?: string | null;
  demo_url?: string | null;
  visibility?: string;
  created_at: string;
  updated_at: string;
}

// Map backend snake_case response to frontend camelCase Project interface
function mapProject(data: RawProjectResponse): Project {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    slug: data.slug || '',
    description: data.description,
    status: data.status,
    techStack: data.tech_stack || [],
    githubUrl: data.github_url || undefined,
    demoUrl: data.demo_url || undefined,
    visibility: (data.visibility as Project['visibility']) || 'public',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getProjects(): Promise<Project[]> {
  const data = await apiRequest<RawProjectResponse[]>('/projects');
  return data.map(mapProject);
}

export async function getProject(id: number): Promise<Project> {
  const data = await apiRequest<RawProjectResponse>(`/projects/${id}`);
  return mapProject(data);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const data = await apiRequest<RawProjectResponse>('/projects', {
    method: 'POST',
    data: input,
  });
  return mapProject(data);
}

export async function updateProject(id: number, input: ProjectInput): Promise<Project> {
  const data = await apiRequest<RawProjectResponse>(`/projects/${id}`, {
    method: 'PUT',
    data: input,
  });
  return mapProject(data);
}

export async function deleteProject(id: number): Promise<void> {
  await apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}
