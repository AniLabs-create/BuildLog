import React from 'react';
import { StreakCard } from '../dashboard/StreakCard';

interface ProfileHeaderProps {
  username: string;
  displayName?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  skills: string[];
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  projectCount: number;
  logCount: number;
  followerCount: number;
  followingCount: number;
  /** Optional action area (Follow button) shown in the header */
  followSlot?: React.ReactNode;
}

/**
 * ProfileHeader Component
 *
 * Portfolio-style header for the public developer profile:
 * avatar, identity, bio/skills on the left; follow button and stats on the right.
 * Deliberately feels like a developer portfolio, not a social profile.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  displayName,
  bio,
  college,
  branch,
  year,
  skills,
  avatarUrl,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
  createdAt,
  currentStreak,
  longestStreak,
  projectCount,
  logCount,
  followerCount,
  followingCount,
  followSlot,
}) => {
  const joinedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${username}'s avatar`}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-zinc-750 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border border-zinc-750 bg-zinc-800 font-mono text-2xl font-bold text-zinc-300">
                {username.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {displayName || username}
                </h1>
                {followSlot}
              </div>
              <p className="mt-0.5 font-mono text-xs text-zinc-500">
                @{username}
                {college ? ` • ${college}` : ''}
                {branch ? ` • ${branch}` : ''}
                {year ? ` • ${year}` : ''}
                {' • '}Building since {joinedDate}
              </p>
              {/* Follower / following counts */}
              <p className="mt-2 text-xs text-zinc-400">
                <span className="font-bold text-white">{followerCount}</span>{' '}
                {followerCount === 1 ? 'Follower' : 'Followers'}
                <span className="mx-2 text-zinc-700">&bull;</span>
                <span className="font-bold text-white">{followingCount}</span> Following
              </p>
              {bio ? (
                <p className="mt-3 max-w-xl text-sm text-zinc-300 leading-relaxed">
                  {bio}
                </p>
              ) : (
                <p className="mt-3 max-w-xl text-sm text-zinc-600 italic leading-relaxed">
                  This developer hasn't written a bio yet.
                </p>
              )}

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-zinc-800/90 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {(githubUrl || linkedinUrl || portfolioUrl) && (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                  {githubUrl && (
                    <a
                      href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 transition hover:text-white"
                    >
                      GitHub &rarr;
                    </a>
                  )}
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 transition hover:text-white"
                    >
                      LinkedIn &rarr;
                    </a>
                  )}
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 transition hover:text-white"
                    >
                      Portfolio &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
          <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-4">
              <p className="font-mono text-[11px] text-zinc-500 uppercase">Projects</p>
              <p className="mt-1 text-2xl font-bold text-white">{projectCount}</p>
            </div>
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-4">
              <p className="font-mono text-[11px] text-zinc-500 uppercase">Logs</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">{logCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
