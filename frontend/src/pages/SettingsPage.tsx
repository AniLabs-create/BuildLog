import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { updateMyProfile } from '../services/users';
import { IntegrationsSection } from '../components/integrations/IntegrationsSection';
import { getErrorMessage } from '../utils/errors';
import type { ProfileVisibility } from '../types';

/**
 * SettingsPage (/settings)
 *
 * Edit everything configured during onboarding, plus logout.
 * Reuses PUT /users/me — the same endpoint the setup wizard uses.
 */
export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

  const [displayName, setDisplayName] = useState(() => user?.displayName ?? '');
  const [bio, setBio] = useState(() => user?.bio ?? '');
  const [college, setCollege] = useState(() => user?.college ?? '');
  const [branch, setBranch] = useState(() => user?.branch ?? '');
  const [year, setYear] = useState(() => user?.year ?? '');
  const [skills, setSkills] = useState(() => (user?.skills ?? []).join(', '));
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatarUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(() => user?.githubUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(() => user?.linkedinUrl ?? '');
  const [portfolioUrl, setPortfolioUrl] = useState(() => user?.portfolioUrl ?? '');
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    () => user?.profileVisibility ?? 'public'
  );

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      await updateMyProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        college: college.trim() || undefined,
        branch: branch.trim() || undefined,
        year: year.trim() || undefined,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        avatarUrl: avatarUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        profileVisibility,
      });
      await refreshUser();
      setSaved(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save settings.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500';
  const labelClass = 'block text-xs font-mono font-medium text-zinc-300 mb-1.5';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
        Account
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Settings
      </h1>

      {saved && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          ✓ Settings saved.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-sm font-bold text-white mb-5">Profile</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="setDisplayName" className={labelClass}>DISPLAY NAME</label>
              <input id="setDisplayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Nizam Ahmed" className={inputClass} />
            </div>
            <div>
              <label htmlFor="setBio" className={labelClass}>BIO</label>
              <textarea id="setBio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} placeholder="Building things and learning in public." className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="setCollege" className={labelClass}>COLLEGE</label>
                <input id="setCollege" type="text" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="setBranch" className={labelClass}>COURSE / BRANCH</label>
                <input id="setBranch" type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="setYear" className={labelClass}>YEAR</label>
                <input id="setYear" type="text" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="setSkills" className={labelClass}>SKILLS (COMMA SEPARATED)</label>
              <input id="setSkills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, React" className={inputClass} />
            </div>
            <div>
              <label htmlFor="setAvatar" className={labelClass}>AVATAR URL</label>
              <input id="setAvatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-sm font-bold text-white mb-5">Links</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="setGithub" className={labelClass}>GITHUB</label>
              <input id="setGithub" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="github.com/you" className={inputClass} />
            </div>
            <div>
              <label htmlFor="setLinkedin" className={labelClass}>LINKEDIN</label>
              <input id="setLinkedin" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/you" className={inputClass} />
            </div>
            <div>
              <label htmlFor="setPortfolio" className={labelClass}>PORTFOLIO</label>
              <input id="setPortfolio" type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="your-site.dev" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-sm font-bold text-white mb-1.5">Integrations</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Connect developer platforms to import repositories and show your coding progress.
          </p>
          <IntegrationsSection />
        </section>

        {/* Visibility */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-sm font-bold text-white mb-1.5">Account visibility</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Private accounts require follow requests — your projects and activity stay hidden until you approve someone.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setProfileVisibility('public')}
              className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                profileVisibility === 'public'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              <p className="text-sm font-semibold text-white">🌐 Public</p>
              <p className="mt-1 text-xs text-zinc-500">Anyone can follow you directly.</p>
            </button>
            <button
              type="button"
              onClick={() => setProfileVisibility('private')}
              className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                profileVisibility === 'private'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              <p className="text-sm font-semibold text-white">🔒 Private</p>
              <p className="mt-1 text-xs text-zinc-500">Follow requests required.</p>
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleLogout}
          >
            Logout
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
