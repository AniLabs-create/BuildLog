/**
 * Portfolio Data Models & Type Definitions
 */

export type PortfolioStatus = 'draft' | 'published' | 'archived';

export interface PortfolioProfile {
  name: string;
  headline: string;
  location?: string | null;
  avatar?: string | null;
  short_bio: string;
  long_bio?: string | null;
}

export interface PortfolioHero {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text?: string | null;
  secondary_cta_url?: string | null;
  availability_badge?: string | null;
}

export interface PortfolioAbout {
  title: string;
  content: string;
  highlights: string[];
}

export interface PortfolioSkill {
  name: string;
  category?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string | number;
  years?: number | null;
}

export interface PortfolioExperience {
  company: string;
  role: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  logo_url?: string | null;
}

export interface PortfolioEducation {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string | null;
  grade?: string | null;
  achievements: string[];
}

export interface PortfolioProjectItem {
  id?: number | null;
  title: string;
  slug: string;
  description: string;
  problem?: string | null;
  solution?: string | null;
  impact?: string | null;
  technologies: string[];
  image_url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  featured: boolean;
  buildlog_project_id?: number | null;
}

export interface PortfolioAchievement {
  title: string;
  description: string;
  date?: string | null;
  organization?: string | null;
  url?: string | null;
  badge?: string | null;
}

export interface PortfolioSocialLinks {
  github?: string | null;
  linkedin?: string | null;
  email?: string | null;
  twitter?: string | null;
  portfolio?: string | null;
  website?: string | null;
  other?: string | null;
}

export interface PortfolioContact {
  email?: string | null;
  cta_title?: string;
  cta_subtitle?: string;
  message_prompt?: string | null;
  cta_label?: string | null;
  message?: string | null;
}

export interface PortfolioTheme {
  template_id: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  background_style?: string | null;
  font_family?: string | null;
  border_radius?: string | null;
  animation_level?: 'none' | 'subtle' | 'lively' | string | null;
  custom_css?: string | null;
}

export interface PortfolioData {
  id?: number;
  userId?: number;
  title: string;
  slug: string;
  status: PortfolioStatus;
  template_id: string;
  custom_domain?: string | null;
  profile: PortfolioProfile;
  hero: PortfolioHero;
  about: PortfolioAbout;
  skills: PortfolioSkill[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  projects: PortfolioProjectItem[];
  achievements: PortfolioAchievement[];
  social_links: PortfolioSocialLinks;
  contact: PortfolioContact;
  theme: PortfolioTheme;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RawPortfolioResponse {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  status: PortfolioStatus;
  template_id: string;
  custom_domain?: string | null;
  profile_data: PortfolioProfile;
  hero_data: PortfolioHero;
  about_data: PortfolioAbout;
  skills_data: PortfolioSkill[];
  experience_data: PortfolioExperience[];
  education_data: PortfolioEducation[];
  projects_data: PortfolioProjectItem[];
  achievements_data: PortfolioAchievement[];
  social_links: PortfolioSocialLinks;
  contact_data: PortfolioContact;
  theme_data: PortfolioTheme;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  id: number;
  userId: number;
  title: string;
  slug: string;
  status: PortfolioStatus;
  template_id: string;
  projectCount: number;
  skillsCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioVersion {
  id: number;
  portfolioId: number;
  versionNum: number;
  message: string;
  snapshot: PortfolioData;
  createdAt: string;
}

export interface UserEntitlements {
  is_pro: boolean;
  tier: 'free' | 'pro_demo' | 'pro' | string;
  features: {
    portfolio_basic: boolean;
    portfolio_templates: boolean;
    portfolio_import: boolean;
    portfolio_publish: boolean;
    portfolio_ai: boolean;
    portfolio_ai_rewriting?: boolean;
    portfolio_ai_redesign?: boolean;
    portfolio_custom_domain?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  styleCategory: 'Modern' | 'Dark' | 'Creative' | 'Technical' | 'Editorial' | 'Minimal' | 'Academic';
  bestFor: string;
  previewColor: string;
  tags: string[];
}

export type PortfolioItem = PortfolioSummary;
export type PortfolioDetail = PortfolioData;
export type PortfolioVersionItem = PortfolioVersion;
export type EntitlementResponse = UserEntitlements;
export type PortfolioPublicResponse = { portfolio: PortfolioData; owner: any; data?: PortfolioData };

export interface AIAgentResponse {
  message: string;
  action?: {
    type: string;
    payload: any;
    rationale?: string;
  } | null;
  can_apply?: boolean;
}

