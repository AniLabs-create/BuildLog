import React from 'react';
import type { PortfolioProfile, PortfolioHero } from '../../../types/portfolio';

interface ProfileHeroEditorProps {
  profile: PortfolioProfile;
  hero: PortfolioHero;
  onChangeProfile: (profile: PortfolioProfile) => void;
  onChangeHero: (hero: PortfolioHero) => void;
}

export const ProfileHeroEditor: React.FC<ProfileHeroEditorProps> = ({
  profile,
  hero,
  onChangeProfile,
  onChangeHero,
}) => {
  return (
    <div className="space-y-8 text-xs">
      {/* Profile Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Profile Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => onChangeProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Professional Headline</label>
            <input
              type="text"
              value={profile.headline || ''}
              onChange={(e) => onChangeProfile({ ...profile, headline: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Location</label>
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => onChangeProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={profile.avatar || ''}
              onChange={(e) => onChangeProfile({ ...profile, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 mb-1">Short Bio</label>
          <input
            type="text"
            value={profile.short_bio || ''}
            onChange={(e) => onChangeProfile({ ...profile, short_bio: e.target.value })}
            placeholder="Brief 1-sentence synopsis"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-zinc-400 mb-1">Long Bio</label>
          <textarea
            rows={3}
            value={profile.long_bio || ''}
            onChange={(e) => onChangeProfile({ ...profile, long_bio: e.target.value })}
            placeholder="More detailed background story..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Hero Display
        </h4>

        <div>
          <label className="block text-zinc-400 mb-1">Main Hero Headline</label>
          <input
            type="text"
            value={hero.headline || ''}
            onChange={(e) => onChangeHero({ ...hero, headline: e.target.value })}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-zinc-400 mb-1">Hero Subheadline</label>
          <textarea
            rows={2}
            value={hero.subheadline || ''}
            onChange={(e) => onChangeHero({ ...hero, subheadline: e.target.value })}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">Availability Badge</label>
            <input
              type="text"
              value={hero.availability_badge || ''}
              onChange={(e) => onChangeHero({ ...hero, availability_badge: e.target.value })}
              placeholder="e.g. Open to New Roles"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Primary CTA Text</label>
            <input
              type="text"
              value={hero.primary_cta_text || ''}
              onChange={(e) => onChangeHero({ ...hero, primary_cta_text: e.target.value })}
              placeholder="View My Work"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Primary CTA URL</label>
            <input
              type="text"
              value={hero.primary_cta_url || ''}
              onChange={(e) => onChangeHero({ ...hero, primary_cta_url: e.target.value })}
              placeholder="#projects"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
