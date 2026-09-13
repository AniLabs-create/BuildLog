import { apiRequest } from './api';
import type {
  IntegrationsStatus,
  ProfileIntegrations,
  SyncedRepository,
  SyncSummary,
} from '../types';

/**
 * Integrations Service — GitHub connect/sync/push, LeetCode connect/sync.
 * All requests require the standard BuildLog JWT (handled by apiRequest).
 */

// ---------- GitHub ----------

export const githubIntegration = {
  async getConnectUrl(): Promise<string> {
    const data = await apiRequest<{ authorize_url: string }>(
      '/integrations/github/connect'
    );
    return data.authorize_url;
  },

  async getStatus(): Promise<IntegrationsStatus['github']> {
    const data = await apiRequest<IntegrationsStatus>('/integrations/status');
    return data.github;
  },

  async sync(): Promise<SyncSummary> {
    return apiRequest('/integrations/github/sync', { method: 'POST' });
  },

  async getRepositories(): Promise<SyncedRepository[]> {
    const data = await apiRequest<SyncedRepository[]>(
      '/integrations/github/repositories'
    );
    return data;
  },

  async pushSolution(input: {
    external_id: string;
    path: string;
    content: string;
    commit_message: string;
    branch?: string;
  }): Promise<{ commit_url?: string; repository: string; path: string }> {
    return apiRequest('/integrations/github/push', {
      method: 'POST',
      data: input,
    });
  },

  async disconnect(): Promise<void> {
    await apiRequest('/integrations/github', { method: 'DELETE' });
  },
};

// ---------- LeetCode ----------

export const leetcodeIntegration = {
  async connect(username: string): Promise<ProfileIntegrations['leetcode']> {
    const data = await apiRequest<{ profile: ProfileIntegrations['leetcode'] }>(
      '/integrations/leetcode/connect',
      { method: 'POST', data: { username } }
    );
    return data.profile;
  },

  async getStatus(): Promise<IntegrationsStatus['leetcode']> {
    const data = await apiRequest<IntegrationsStatus>('/integrations/status');
    return data.leetcode;
  },

  async sync(): Promise<{ username: string; new_activity: number }> {
    return apiRequest('/integrations/leetcode/sync', { method: 'POST' });
  },

  async disconnect(): Promise<void> {
    await apiRequest('/integrations/leetcode', { method: 'DELETE' });
  },
};

export async function getIntegrationsStatus(): Promise<IntegrationsStatus> {
  return apiRequest('/integrations/status');
}
