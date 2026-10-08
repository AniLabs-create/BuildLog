import React from 'react';
import type { PortfolioSocialLinks, PortfolioContact } from '../../../types/portfolio';

interface SocialContactEditorProps {
  socialLinks: PortfolioSocialLinks;
  contact: PortfolioContact;
  onChangeSocial: (social: PortfolioSocialLinks) => void;
  onChangeContact: (contact: PortfolioContact) => void;
}

export const SocialContactEditor: React.FC<SocialContactEditorProps> = ({
  socialLinks,
  contact,
  onChangeSocial,
  onChangeContact,
}) => {
  return (
    <div className="space-y-8 text-xs">
      {/* Social Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Social &amp; Repository Profiles
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">GitHub Profile</label>
            <input
              type="text"
              value={socialLinks.github || ''}
              onChange={(e) => onChangeSocial({ ...socialLinks, github: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={socialLinks.linkedin || ''}
              onChange={(e) => onChangeSocial({ ...socialLinks, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Email Address</label>
            <input
              type="email"
              value={socialLinks.email || ''}
              onChange={(e) => onChangeSocial({ ...socialLinks, email: e.target.value })}
              placeholder="dev@example.com"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">X / Twitter</label>
            <input
              type="text"
              value={socialLinks.twitter || ''}
              onChange={(e) => onChangeSocial({ ...socialLinks, twitter: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1">Personal Website / Blog</label>
            <input
              type="text"
              value={socialLinks.website || ''}
              onChange={(e) => onChangeSocial({ ...socialLinks, website: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Contact Callout &amp; Form
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">Contact Email</label>
            <input
              type="email"
              value={contact.email || ''}
              onChange={(e) => onChangeContact({ ...contact, email: e.target.value })}
              placeholder="Primary inquiry recipient"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Call to Action Label</label>
            <input
              type="text"
              value={contact.cta_label || ''}
              onChange={(e) => onChangeContact({ ...contact, cta_label: e.target.value })}
              placeholder="e.g. Send Email, Book a Call"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 mb-1">Contact Message / Subtitle</label>
          <textarea
            rows={2}
            value={contact.message || ''}
            onChange={(e) => onChangeContact({ ...contact, message: e.target.value })}
            placeholder="Available for contract work and full-time senior engineering..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
