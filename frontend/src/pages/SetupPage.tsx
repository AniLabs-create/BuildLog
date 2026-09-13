import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IntegrationsSection } from '../components/integrations/IntegrationsSection';
import { useAuth } from '../hooks/useAuth';
import {
  checkUsernameAvailability,
  updateMyProfile,
} from '../services/users';
import { getErrorMessage } from '../utils/errors';
import type { ProfileVisibility } from '../types';

/**
 * SetupPage — first-time account onboarding (/setup).
 *
 * A 7-step wizard that feels like onboarding rather than a settings form.
 * Step 6 offers optional developer-account connections (GitHub / LeetCode);
 * connecting GitHub redirects away, so the wizard saves profile progress first.
 */

const TOTAL_STEPS = 7;

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

const STEPS: Array<{ title: string; subtitle: string }> = [
  { title: "Let's set up your BuildLog profile.", subtitle: 'This takes about a minute.' },
  { title: 'Choose your username.', subtitle: 'This will be your public handle and profile URL.' },
  { title: 'Tell us about yourself.', subtitle: 'Help others understand who you are.' },
  { title: 'Your skills and links.', subtitle: 'Show what you work with and where to find you.' },
  { title: 'Public or private?', subtitle: 'You can change this anytime in settings.' },
  { title: 'Connect your developer accounts.', subtitle: 'Optional — make your profile more powerful.' },
  { title: 'Review and finish.', subtitle: 'Double-check everything looks right.' },
];

interface SetupFormState {
  avatarUrl: string;
  username: string;
  displayName: string;
  bio: string;
  college: string;
  branch: string;
  year: string;
  skills: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profileVisibility: ProfileVisibility;
}

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  // GitHub-linked accounts arrive with prefilled username/avatar/name/GitHub URL
  // (set by the backend from their GitHub profile). Email accounts start blank.
  const [form, setForm] = useState<SetupFormState>({
    avatarUrl: user?.avatarUrl ?? '',
    username: user?.username ?? '',
    displayName: user?.displayName ?? '',
    bio: '',
    college: '',
    branch: '',
    year: '',
    skills: '',
    githubUrl: user?.githubUrl ?? '',
    linkedinUrl: '',
    portfolioUrl: '',
    profileVisibility: 'public',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Username availability (debounced live check, step 2) ---
  // Simple states (empty / invalid / unchanged) are DERIVED during render —
  // only the network result needs real state.
  type UsernameCheck =
    | { username: string; state: 'checking' }
    | { username: string; state: 'available'; message: string }
    | { username: string; state: 'taken'; message: string }
    | { username: string; state: 'error'; message: string }
    | null;

  const [usernameCheck, setUsernameCheck] = useState<UsernameCheck>(null);

  const username = form.username.trim();
  const isCurrentUsername = username === user?.username;
  const isUsernameValid = USERNAME_PATTERN.test(username);
  const latestCheck = usernameCheck?.username === username ? usernameCheck : null;

  const canContinue = () => {
    if (step !== 2) return true;
    return isUsernameValid && (isCurrentUsername || latestCheck?.state === 'available');
  };

  useEffect(() => {
    if (step !== 2) return;
    // Skip derived cases (empty, invalid format, unchanged current username)
    if (!username || !USERNAME_PATTERN.test(username) || isCurrentUsername) return;

    const timer = setTimeout(async () => {
      setUsernameCheck({ username, state: 'checking' });
      try {
        const result = await checkUsernameAvailability(username);
        if (result.available) {
          setUsernameCheck({ username, state: 'available', message: '✓ Username available' });
        } else {
          setUsernameCheck({
            username,
            state: 'taken',
            message: `✕ ${result.reason ?? 'Username is already taken.'}`,
          });
        }
      } catch {
        setUsernameCheck({
          username,
          state: 'error',
          message: 'Could not verify right now — try continuing anyway or retry.',
        });
      }
    }, 400); // debounce: wait for the user to stop typing

    return () => clearTimeout(timer);
  }, [username, step, isCurrentUsername]);

  const setField = <K extends keyof SetupFormState>(field: K, value: SetupFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Persists the wizard form before the GitHub redirect leaves the page,
      so returning to /setup restores progress instead of losing it. */
  const saveProgressBeforeRedirect = async () => {
    try {
      await updateMyProfile({
        displayName: form.displayName.trim() || undefined,
        bio: form.bio.trim() || undefined,
        college: form.college.trim() || undefined,
        branch: form.branch.trim() || undefined,
        year: form.year.trim() || undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        avatarUrl: form.avatarUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        profileVisibility: form.profileVisibility,
      });
      await refreshUser();
    } catch {
      // Progress save is best-effort; the GitHub connection still proceeds.
    }
  };

  const handleFinish = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await updateMyProfile({
        username: form.username.trim(),
        displayName: form.displayName.trim() || undefined,
        bio: form.bio.trim() || undefined,
        college: form.college.trim() || undefined,
        branch: form.branch.trim() || undefined,
        year: form.year.trim() || undefined,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        avatarUrl: form.avatarUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        profileVisibility: form.profileVisibility,
        profileSetupComplete: true,
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save your profile. Please try again.'));
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500';
  const labelClass = 'block text-xs font-mono font-medium text-zinc-300 mb-1.5';

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-2" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= step ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-xs text-zinc-500">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        {STEPS[step - 1].title}
      </h1>
      <p className="mt-1.5 text-sm text-zinc-400">{STEPS[step - 1].subtitle}</p>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8">
        {/* Step 1: Profile picture */}
        {step === 1 && (
          <div className="flex flex-col items-center gap-6">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="Avatar preview"
                className="h-24 w-24 rounded-xl border border-zinc-750 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-zinc-750 bg-zinc-800 font-mono text-3xl font-bold text-zinc-300">
                {(form.displayName || user?.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="w-full">
              <label htmlFor="avatarUrl" className={labelClass}>
                PROFILE PICTURE URL
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setField('avatarUrl', e.target.value)}
                placeholder="https://example.com/me.jpg (optional)"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-zinc-600">
                Paste a link to an image for now — file uploads are planned for a later milestone.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <div>
            <label htmlFor="setupUsername" className={labelClass}>
              USERNAME
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-zinc-500">@</span>
              <input
                id="setupUsername"
                type="text"
                value={form.username}
                onChange={(e) => setField('username', e.target.value.toLowerCase().trim())}
                placeholder="yourhandle"
                className={inputClass}
                autoComplete="username"
              />
            </div>
            {!username && (
              <p className="mt-2 text-xs font-mono text-zinc-600">
                3-30 characters: lowercase letters, numbers, underscores.
              </p>
            )}
            {username && !isUsernameValid && (
              <p className="mt-2 text-xs font-mono text-rose-400">
                ✕ 3-30 characters: lowercase letters, numbers, underscores.
              </p>
            )}
            {isUsernameValid && isCurrentUsername && (
              <p className="mt-2 text-xs font-mono text-emerald-400">✓ Your current username</p>
            )}
            {isUsernameValid && !isCurrentUsername && latestCheck?.state === 'checking' && (
              <p className="mt-2 text-xs font-mono text-zinc-500">Checking availability...</p>
            )}
            {isUsernameValid && !isCurrentUsername && latestCheck?.state === 'available' && (
              <p className="mt-2 text-xs font-mono text-emerald-400">{latestCheck.message}</p>
            )}
            {isUsernameValid &&
              !isCurrentUsername &&
              (latestCheck?.state === 'taken' || latestCheck?.state === 'error') && (
                <p className="mt-2 text-xs font-mono text-rose-400">{latestCheck.message}</p>
              )}
            <p className="mt-3 text-xs text-zinc-600">
              Your profile will live at buildlog.app/u/<span className="text-zinc-400">{form.username || 'yourhandle'}</span>
            </p>
          </div>
        )}

        {/* Step 3: Bio and basic information */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="displayName" className={labelClass}>
                DISPLAY NAME
              </label>
              <input
                id="displayName"
                type="text"
                value={form.displayName}
                onChange={(e) => setField('displayName', e.target.value)}
                placeholder="e.g. Nizam Ahmed"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bio" className={labelClass}>
                BIO
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setField('bio', e.target.value)}
                placeholder="Student developer. Building things and learning in public."
                rows={3}
                maxLength={500}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="college" className={labelClass}>
                  COLLEGE
                </label>
                <input
                  id="college"
                  type="text"
                  value={form.college}
                  onChange={(e) => setField('college', e.target.value)}
                  placeholder="Your college"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="branch" className={labelClass}>
                  COURSE / BRANCH
                </label>
                <input
                  id="branch"
                  type="text"
                  value={form.branch}
                  onChange={(e) => setField('branch', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="year" className={labelClass}>
                  YEAR
                </label>
                <input
                  id="year"
                  type="text"
                  value={form.year}
                  onChange={(e) => setField('year', e.target.value)}
                  placeholder="e.g. 2nd Year"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Skills and links */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="skills" className={labelClass}>
                SKILLS (COMMA SEPARATED)
              </label>
              <input
                id="skills"
                type="text"
                value={form.skills}
                onChange={(e) => setField('skills', e.target.value)}
                placeholder="Python, React, FastAPI"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="githubUrl" className={labelClass}>
                  GITHUB URL
                </label>
                <input
                  id="githubUrl"
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setField('githubUrl', e.target.value)}
                  placeholder="github.com/you"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="linkedinUrl" className={labelClass}>
                  LINKEDIN URL
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setField('linkedinUrl', e.target.value)}
                  placeholder="linkedin.com/in/you"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="portfolioUrl" className={labelClass}>
                  PORTFOLIO URL
                </label>
                <input
                  id="portfolioUrl"
                  type="url"
                  value={form.portfolioUrl}
                  onChange={(e) => setField('portfolioUrl', e.target.value)}
                  placeholder="your-site.dev"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Visibility */}
        {step === 5 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setField('profileVisibility', 'public')}
              className={`cursor-pointer rounded-xl border p-5 text-left transition ${
                form.profileVisibility === 'public'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              <p className="text-sm font-semibold text-white">🌐 Public</p>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Anyone can find you, view your projects and activity, and follow you directly.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setField('profileVisibility', 'private')}
              className={`cursor-pointer rounded-xl border p-5 text-left transition ${
                form.profileVisibility === 'private'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              <p className="text-sm font-semibold text-white">🔒 Private</p>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                People can find you and request to follow. Your projects and activity stay hidden until you approve them.
              </p>
            </button>
          </div>
        )}

        {/* Step 6: Integrations (optional) */}
        {step === 6 && (
          <IntegrationsSection
            compact
            onBeforeRedirect={saveProgressBeforeRedirect}
            onChanged={refreshUser}
          />
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className="flex flex-col items-center gap-5 text-center">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="Your avatar"
                className="h-20 w-20 rounded-xl border border-zinc-750 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-zinc-750 bg-zinc-800 font-mono text-2xl font-bold text-zinc-300">
                {(form.displayName || form.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-white">
                {form.displayName || form.username}
              </p>
              <p className="font-mono text-xs text-zinc-500">@{form.username}</p>
            </div>
            {form.bio && <p className="max-w-md text-sm text-zinc-300">{form.bio}</p>}
            <div className="flex flex-wrap justify-center gap-1.5">
              {form.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-zinc-800/90 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                  >
                    {skill}
                  </span>
                ))}
            </div>
            <p className="font-mono text-xs text-zinc-500">
              {form.profileVisibility === 'public' ? '🌐 Public account' : '🔒 Private account'} ·
              Profile at /u/{form.username}
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-850 pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || submitting}
          >
            &larr; Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue() || submitting}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Complete Setup 🚀'}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Everything here can be changed later in Settings.
      </p>
    </div>
  );
};

export default SetupPage;
