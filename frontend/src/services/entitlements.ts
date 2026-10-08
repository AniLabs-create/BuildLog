import { apiRequest } from './api';
import type { UserEntitlements } from '../types/portfolio';

export async function getUserEntitlements(): Promise<UserEntitlements> {
  const res = await apiRequest<{
    is_pro: boolean;
    tier: string;
    features: Record<string, boolean>;
  }>('/entitlements');

  return {
    is_pro: res.is_pro,
    tier: res.tier,
    features: {
      portfolio_basic: true,
      portfolio_templates: true,
      portfolio_import: true,
      portfolio_publish: true,
      portfolio_ai: res.features?.portfolio_ai ?? res.is_pro,
      portfolio_ai_rewriting: res.features?.portfolio_ai_rewriting ?? res.is_pro,
      portfolio_ai_redesign: res.features?.portfolio_ai_redesign ?? res.is_pro,
      portfolio_custom_domain: res.features?.portfolio_custom_domain ?? res.is_pro,
      ...res.features,
    },
  };
}

export async function toggleDemoPro(isPro: boolean): Promise<UserEntitlements> {
  const res = await apiRequest<{
    is_pro: boolean;
    tier: string;
    features: Record<string, boolean>;
  }>('/entitlements/demo-toggle', {
    method: 'POST',
    data: { is_pro: isPro, tier: isPro ? 'pro_demo' : 'free' },
  });

  return {
    is_pro: res.is_pro,
    tier: res.tier,
    features: {
      portfolio_basic: true,
      portfolio_templates: true,
      portfolio_import: true,
      portfolio_publish: true,
      portfolio_ai: res.features?.portfolio_ai ?? res.is_pro,
      portfolio_ai_rewriting: res.features?.portfolio_ai_rewriting ?? res.is_pro,
      portfolio_ai_redesign: res.features?.portfolio_ai_redesign ?? res.is_pro,
      portfolio_custom_domain: res.features?.portfolio_custom_domain ?? res.is_pro,
      ...res.features,
    },
  };
}

export const getEntitlements = getUserEntitlements;

