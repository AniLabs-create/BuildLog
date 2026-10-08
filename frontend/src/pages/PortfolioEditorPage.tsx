import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { PortfolioDetail, PortfolioData } from '../types/portfolio';
import { getPortfolio, updatePortfolio, togglePublishPortfolio } from '../services/portfolios';
import { getEntitlements } from '../services/entitlements';
import { DevicePreviewFrame } from '../components/portfolio/DevicePreviewFrame';
import { PortfolioAIAssistant } from '../components/portfolio/PortfolioAIAssistant';
import { VersionHistoryModal } from '../components/portfolio/VersionHistoryModal';
import { TemplateGalleryModal } from '../components/portfolio/TemplateGalleryModal';
import { ProPaywallModal } from '../components/portfolio/ProPaywallModal';

import {
  ProfileHeroEditor,
  AboutEditor,
  SkillsEditor,
  ProjectsEditor,
  ExperienceEditor,
  EducationEditor,
  AchievementsEditor,
  SocialContactEditor,
  ThemeEditor,
} from '../components/portfolio/editors';

type EditorTab =
  | 'profile'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'achievements'
  | 'social'
  | 'theme';

export const PortfolioEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const portfolioId = Number(id);
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  const [activeTab, setActiveTab] = useState<EditorTab>('profile');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    loadPortfolioData();
  }, [portfolioId]);

  const loadPortfolioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [item, ent] = await Promise.all([
        getPortfolio(portfolioId),
        getEntitlements().catch(() => null),
      ]);
      setPortfolio(item);
      setData(item);
      setTitle(item.title);
      setSlug(item.slug);
      setIsPublished(item.status === 'published');
      setIsProUser(ent?.tier === 'pro');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (updated: PortfolioData) => {
    setData(updated);
    setDirty(true);
  };

  const handleSave = async (reason?: string) => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePortfolio(
        portfolioId,
        {
          ...data,
          title,
          slug,
          template_id: data.template_id,
        },
        {
          saveVersion: true,
          versionMessage: reason || 'Manual editor save',
        }
      );
      setPortfolio(updated);
      setData(updated);
      setDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const updated = await togglePublishPortfolio(portfolioId);
      setIsPublished(updated.status === 'published');
      setPortfolio(updated);
    } catch (err: any) {
      alert(`Failed to update publish state: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
          <p className="font-mono text-xs text-zinc-400">Loading portfolio workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="mx-auto max-w-xl py-20 px-4 text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-xl font-bold text-white">Portfolio Error</h2>
        <p className="text-xs text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/portfolio')}
          className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!data) return null;

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile & Hero', icon: '👤' },
    { id: 'about', label: 'About', icon: '📖' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'achievements', label: 'Honors', icon: '🏆' },
    { id: 'social', label: 'Social & Contact', icon: '✉️' },
    { id: 'theme', label: 'Design & Theme', icon: '🎨' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
      {/* Top Editor Toolbar */}
      <header className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 gap-3 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/portfolio"
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Back to Portfolios"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                className="bg-transparent text-white font-bold text-sm focus:outline-none hover:bg-zinc-800/40 px-1.5 py-0.5 rounded transition"
              />
              {dirty && (
                <span className="h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />
              )}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
              <span>/{slug}</span>
              <span>•</span>
              <span className="uppercase text-purple-400 font-bold">{data.template_id}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={() => {
              if (!isProUser) {
                setShowPaywall(true);
              } else {
                setShowAIAssistant(!showAIAssistant);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              showAIAssistant
                ? 'bg-purple-600 text-white'
                : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 text-purple-200 hover:border-purple-400'
            }`}
          >
            <span>✨ AI Agent</span>
            {!isProUser && (
              <span className="rounded bg-purple-500/20 text-[9px] px-1 py-0.2 uppercase font-mono">
                PRO
              </span>
            )}
          </button>

          {/* Template Gallery */}
          <button
            type="button"
            onClick={() => setShowTemplateGallery(true)}
            className="rounded-xl border border-zinc-800 bg-zinc-850 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition"
          >
            Templates (20)
          </button>

          {/* Version History */}
          <button
            type="button"
            onClick={() => setShowVersionHistory(true)}
            className="rounded-xl border border-zinc-800 bg-zinc-850 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition"
          >
            History
          </button>

          {/* Save Button */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition shadow-sm ${
              dirty
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save'}
          </button>

          {/* Publish / Unpublish */}
          <button
            type="button"
            disabled={publishing}
            onClick={handleTogglePublish}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              isPublished
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {publishing ? '...' : isPublished ? 'Published ●' : 'Publish'}
          </button>

          {/* Full Screen Preview Link */}
          <Link
            to={`/portfolio/${portfolioId}/preview`}
            target="_blank"
            className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-850 text-zinc-400 hover:text-white transition"
            title="Open Fullscreen Preview"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Split Body: Editor on Left, Live Responsive Preview in Middle, AI on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Form Editor Pane */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col border-r border-zinc-850 bg-zinc-950">
          {/* Section Tabs */}
          <div className="flex overflow-x-auto border-b border-zinc-850 p-2 gap-1 bg-zinc-900/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Form */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'profile' && (
              <ProfileHeroEditor
                profile={data.profile}
                hero={data.hero}
                onChangeProfile={(profile) => handleDataChange({ ...data, profile })}
                onChangeHero={(hero) => handleDataChange({ ...data, hero })}
              />
            )}

            {activeTab === 'about' && (
              <AboutEditor
                about={data.about}
                onChangeAbout={(about) => handleDataChange({ ...data, about })}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsEditor
                skills={data.skills}
                onChangeSkills={(skills) => handleDataChange({ ...data, skills })}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsEditor
                projects={data.projects}
                onChangeProjects={(projects) => handleDataChange({ ...data, projects })}
              />
            )}

            {activeTab === 'experience' && (
              <ExperienceEditor
                experience={data.experience || []}
                onChangeExperience={(experience) => handleDataChange({ ...data, experience })}
              />
            )}

            {activeTab === 'education' && (
              <EducationEditor
                education={data.education || []}
                onChangeEducation={(education) => handleDataChange({ ...data, education })}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsEditor
                achievements={data.achievements || []}
                onChangeAchievements={(achievements) => handleDataChange({ ...data, achievements })}
              />
            )}

            {activeTab === 'social' && (
              <SocialContactEditor
                socialLinks={data.social_links}
                contact={data.contact}
                onChangeSocial={(social_links) => handleDataChange({ ...data, social_links })}
                onChangeContact={(contact) => handleDataChange({ ...data, contact })}
              />
            )}

            {activeTab === 'theme' && (
              <ThemeEditor
                templateId={data.template_id}
                theme={data.theme}
                onChangeTemplate={(template_id) => handleDataChange({ ...data, template_id })}
                onChangeTheme={(theme) => handleDataChange({ ...data, theme })}
                onOpenTemplateGallery={() => setShowTemplateGallery(true)}
              />
            )}
          </div>
        </div>

        {/* Live Device Preview Frame (Center / Right) */}
        <div className="hidden lg:flex flex-1 flex-col p-4 bg-zinc-950 overflow-hidden">
          <DevicePreviewFrame
            data={data}
            onOpenFullScreen={() => navigate(`/portfolio/${portfolioId}/preview`)}
          />
        </div>

        {/* Collapsible AI Assistant Drawer */}
        {showAIAssistant && (
          <div className="w-full sm:w-96 border-l border-zinc-850 bg-zinc-950 flex flex-col z-30 animate-slideLeft">
            <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
                Agent Assistant
              </span>
              <button
                type="button"
                onClick={() => setShowAIAssistant(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PortfolioAIAssistant
                portfolioId={portfolioId}
                currentData={data}
                onDataUpdated={(updated) => {
                  setData(updated);
                  setDirty(false);
                }}
                onRequestProUpgrade={() => setShowPaywall(true)}
                isProUser={isProUser}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        portfolioId={portfolioId}
        onVersionRestored={(restored) => {
          setData(restored);
          setDirty(false);
        }}
      />

      <TemplateGalleryModal
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        selectedTemplateId={data.template_id}
        onSelectTemplate={(templateId) => {
          handleDataChange({ ...data, template_id: templateId });
        }}
      />

      <ProPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => {
          setIsProUser(true);
        }}
      />
    </div>
  );
};
