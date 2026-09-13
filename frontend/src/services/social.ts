import { apiRequest } from './api';
import type {
  ProjectDetail,
  SocialComment,
  SocialTargetType,
  SuggestionItem,
} from '../types';

/**
 * Social Service — Log Stars, comments, suggestions.
 * One generic Log Star toggle serves every target type.
 */

export const socialApi = {
  async toggleLogStar(targetType: SocialTargetType, targetId: number): Promise<{ starred: boolean; count: number }> {
    return apiRequest('/log-stars/toggle', {
      method: 'POST',
      data: { target_type: targetType, target_id: targetId },
    });
  },

  async listComments(targetType: SocialTargetType, targetId: number): Promise<SocialComment[]> {
    const paths: Record<SocialTargetType, string> = {
      project: `/projects/${targetId}/comments`,
      build_log: `/build-logs/${targetId}/comments`,
      suggestion: `/suggestions/${targetId}/comments`,
      comment: `/comments/${targetId}/comments`, // comments on comments: not used in V1
    };
    return apiRequest(paths[targetType]);
  },

  async addComment(targetType: SocialTargetType, targetId: number, content: string): Promise<SocialComment> {
    const paths: Record<SocialTargetType, string> = {
      project: `/projects/${targetId}/comments`,
      build_log: `/build-logs/${targetId}/comments`,
      suggestion: `/suggestions/${targetId}/comments`,
      comment: `/comments/${targetId}/comments`,
    };
    return apiRequest(paths[targetType], { method: 'POST', data: { content } });
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
  },

  async getProjectDetail(projectId: number): Promise<ProjectDetail> {
    return apiRequest(`/projects/${projectId}/detail`);
  },

  async listSuggestions(projectId: number): Promise<SuggestionItem[]> {
    return apiRequest(`/projects/${projectId}/suggestions`);
  },

  async addSuggestion(projectId: number, content: string): Promise<SuggestionItem> {
    return apiRequest(`/projects/${projectId}/suggestions`, {
      method: 'POST',
      data: { content },
    });
  },

  async setSuggestionStatus(suggestionId: number, status: SuggestionItem['status']): Promise<SuggestionItem> {
    return apiRequest(`/suggestions/${suggestionId}/status`, {
      method: 'PUT',
      data: { status },
    });
  },

  async deleteSuggestion(suggestionId: number): Promise<void> {
    await apiRequest(`/suggestions/${suggestionId}`, { method: 'DELETE' });
  },
};
