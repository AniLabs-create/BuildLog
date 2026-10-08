import { apiRequest } from './api';
import type {
  PortfolioData,
  RawPortfolioResponse,
  PortfolioSummary,
  PortfolioVersion,
} from '../types/portfolio';

export function mapPortfolio(raw: RawPortfolioResponse): PortfolioData {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    slug: raw.slug,
    status: raw.status,
    template_id: raw.template_id,
    custom_domain: raw.custom_domain,
    profile: raw.profile_data || { name: '', headline: '', short_bio: '' },
    hero: raw.hero_data || { headline: '', subheadline: '', primary_cta_text: '', primary_cta_url: '' },
    about: raw.about_data || { title: 'About Me', content: '', highlights: [] },
    skills: raw.skills_data || [],
    experience: raw.experience_data || [],
    education: raw.education_data || [],
    projects: raw.projects_data || [],
    achievements: raw.achievements_data || [],
    social_links: raw.social_links || {},
    contact: raw.contact_data || { cta_title: '', cta_subtitle: '' },
    theme: raw.theme_data || { template_id: raw.template_id },
    published_at: raw.published_at,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function mapPortfolioSummary(raw: {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  status: string;
  template_id: string;
  project_count: number;
  skills_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}): PortfolioSummary {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    slug: raw.slug,
    status: raw.status as any,
    template_id: raw.template_id,
    projectCount: raw.project_count,
    skillsCount: raw.skills_count,
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getPortfolios(): Promise<PortfolioSummary[]> {
  const list = await apiRequest<Array<any>>('/portfolios');
  return list.map(mapPortfolioSummary);
}

export async function getPortfolio(id: number): Promise<PortfolioData> {
  const raw = await apiRequest<RawPortfolioResponse>(`/portfolios/${id}`);
  return mapPortfolio(raw);
}

export async function importBuildLogData(templateId = 'minimal'): Promise<PortfolioData> {
  const raw = await apiRequest<any>(`/portfolios/import-buildlog?template_id=${encodeURIComponent(templateId)}`, {
    method: 'POST',
  });
  return {
    title: raw.title || 'My Developer Portfolio',
    slug: raw.slug || 'developer-portfolio',
    status: 'draft',
    template_id: raw.template_id || templateId,
    profile: raw.profile || { name: '', headline: '', short_bio: '' },
    hero: raw.hero || { headline: '', subheadline: '', primary_cta_text: '', primary_cta_url: '' },
    about: raw.about || { title: 'About Me', content: '', highlights: [] },
    skills: raw.skills || [],
    experience: raw.experience || [],
    education: raw.education || [],
    projects: raw.projects || [],
    achievements: raw.achievements || [],
    social_links: raw.social_links || {},
    contact: raw.contact || { cta_title: '', cta_subtitle: '' },
    theme: raw.theme || { template_id: templateId },
  };
}

export async function createPortfolio(payload: {
  title: string;
  slug?: string;
  template_id: string;
  initial_data?: Partial<PortfolioData>;
}): Promise<PortfolioData> {
  const raw = await apiRequest<RawPortfolioResponse>('/portfolios', {
    method: 'POST',
    data: payload,
  });
  return mapPortfolio(raw);
}

export async function updatePortfolio(
  id: number,
  data: Partial<PortfolioData>,
  options?: { saveVersion?: boolean; versionMessage?: string }
): Promise<PortfolioData> {
  const payload: Record<string, any> = {
    title: data.title,
    slug: data.slug,
    status: data.status,
    template_id: data.template_id,
    profile_data: data.profile,
    hero_data: data.hero,
    about_data: data.about,
    skills_data: data.skills,
    experience_data: data.experience,
    education_data: data.education,
    projects_data: data.projects,
    achievements_data: data.achievements,
    social_links: data.social_links,
    contact_data: data.contact,
    theme_data: data.theme,
    save_version: options?.saveVersion || false,
    version_message: options?.versionMessage,
  };

  const raw = await apiRequest<RawPortfolioResponse>(`/portfolios/${id}`, {
    method: 'PUT',
    data: payload,
  });
  return mapPortfolio(raw);
}

export async function deletePortfolio(id: number): Promise<void> {
  await apiRequest<void>(`/portfolios/${id}`, {
    method: 'DELETE',
  });
}

export async function togglePublishPortfolio(id: number): Promise<PortfolioData> {
  const raw = await apiRequest<RawPortfolioResponse>(`/portfolios/${id}/publish`, {
    method: 'POST',
  });
  return mapPortfolio(raw);
}

export async function getPortfolioVersions(portfolioId: number): Promise<PortfolioVersion[]> {
  const list = await apiRequest<Array<any>>(`/portfolios/${portfolioId}/versions`);
  return list.map((v) => ({
    id: v.id,
    portfolioId: v.portfolio_id,
    versionNum: v.version_num,
    message: v.message,
    snapshot: mapPortfolio(v.snapshot),
    createdAt: v.created_at,
  }));
}

export async function restorePortfolioVersion(portfolioId: number, versionId: number): Promise<PortfolioData> {
  const raw = await apiRequest<RawPortfolioResponse>(`/portfolios/${portfolioId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
  return mapPortfolio(raw);
}

export async function getPublicPortfolio(
  username: string,
  portfolioSlug: string
): Promise<{ portfolio: PortfolioData; owner: any }> {
  const res = await apiRequest<{ portfolio: RawPortfolioResponse; owner: any }>(
    `/p/${encodeURIComponent(username)}/${encodeURIComponent(portfolioSlug)}`
  );
  return {
    portfolio: mapPortfolio(res.portfolio),
    owner: res.owner,
  };
}

export async function sendAIChatMessage(
  portfolioId: number,
  prompt: string
): Promise<{ message: string; actions: Array<any>; can_apply: boolean }> {
  return apiRequest<{ message: string; actions: Array<any>; can_apply: boolean }>(
    `/portfolios/${portfolioId}/ai/chat`,
    {
      method: 'POST',
      data: { prompt },
    }
  );
}

export async function applyAIAction(portfolioId: number, action: any): Promise<PortfolioData> {
  const raw = await apiRequest<RawPortfolioResponse>(`/portfolios/${portfolioId}/ai/apply`, {
    method: 'POST',
    data: { action },
  });
  return mapPortfolio(raw);
}

export const listPortfolios = getPortfolios;
export const listPortfolioVersions = getPortfolioVersions;

export async function sendAIChat(
  portfolioId: number,
  prompt: string,
  _currentData?: any
): Promise<{ message: string; action?: any; can_apply?: boolean }> {
  const res = await sendAIChatMessage(portfolioId, prompt);
  return {
    message: res.message,
    action: res.actions && res.actions.length > 0 ? res.actions[0] : null,
    can_apply: res.can_apply,
  };
}

export async function importBuildLogPortfolio(payload: {
  title: string;
  slug?: string;
  template_id?: string;
  include_github?: boolean;
  include_buildlogs?: boolean;
}): Promise<PortfolioData> {
  const importedData = await importBuildLogData(payload.template_id || 'minimal');
  return createPortfolio({
    title: payload.title,
    slug: payload.slug,
    template_id: payload.template_id || 'minimal',
    initial_data: importedData,
  });
}

