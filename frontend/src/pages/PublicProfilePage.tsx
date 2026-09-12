import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProjectStatus } from '../components/ProjectStatus';
import { FollowButton } from '../components/social/FollowButton';
import { getPublicProfile, getPublicUserProjects } from '../services/users';
import { getErrorMessage } from '../utils/errors';
import type { PublicProfile, Project } from '../types';

/**
 * PublicProfilePage
 *
 * The shareable developer portfolio at /u/:username.
 * Public — no login required. Private accounts show an identity-only
 * "wall" with a follow request button until the viewer is accepted.
 */
export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!username) return;
    try {
      setLoading(true);
      const profileData = await getPublicProfile(username);
      setProfile(profileData);
      if (!profileData.isPrivate) {
        setProjects(await getPublicUserProjects(username));
      } else {
        setProjects([]);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load this developer profile.'));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFollowChanged = () => {
    // Re-fetch so privacy rules and counts update after follow/unfollow
    load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-4xl mb-4">🕵️</p>
        <h1 className="text-xl font-bold text-white">Developer not found</h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
          {error || `No developer with the username "${username}" exists on BuildLog.`}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-xs text-zinc-400 hover:text-white transition"
        >
          &larr; Back to BuildLog
        </Link>
      </div>
    );
  }

  const isSelf = profile.followState === 'SELF';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <ProfileHeader
        username={profile.username}
        displayName={profile.displayName}
        bio={profile.bio}
        college={profile.college}
        branch={profile.branch}
        year={profile.year}
        skills={profile.skills}
        avatarUrl={profile.avatarUrl}
        githubUrl={profile.githubUrl}
        linkedinUrl={profile.linkedinUrl}
        portfolioUrl={profile.portfolioUrl}
        createdAt={profile.createdAt}
        currentStreak={profile.currentStreak}
        longestStreak={profile.longestStreak}
        projectCount={profile.projectCount}
        logCount={profile.logCount}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
        followSlot={
          !isSelf ? (
            <FollowButton
              username={profile.username}
              followState={profile.followState}
              onChanged={handleFollowChanged}
              size="md"
            />
          ) : undefined
        }
      />

      {/* Private account wall */}
      {profile.isPrivate ? (
        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-14 text-center">
          <p className="text-3xl mb-3">🔒</p>
          <h2 className="text-lg font-bold text-white">This account is private</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            Follow this developer to see their projects and activity.
          </p>
          {profile.followState === 'REQUESTED' && (
            <p className="mt-4 font-mono text-xs text-amber-400">
              Your follow request is pending approval.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Projects */}
          <div className="lg:col-span-2">
            <h2 className="mb-5 text-lg font-bold text-white">Projects</h2>

            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
                <p className="text-2xl mb-2">📁</p>
                <p className="text-sm text-zinc-500">No public projects yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/u/${profile.username}/${project.slug}`}
                    className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 hover:border-zinc-600 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold text-white hover:text-zinc-300 transition">
                        {project.name}
                      </h3>
                      <ProjectStatus status={project.status} />
                    </div>

                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-zinc-850/80 flex flex-wrap items-center gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-zinc-800/90 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-750"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent build activity */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-white">Recent Activity</h2>

            {profile.recentActivity.length === 0 ? (
              <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-8 text-center">
                <p className="font-mono text-sm text-zinc-500">No build activity yet.</p>
              </div>
            ) : (
              <div className="relative space-y-6 border-l border-zinc-800 pl-6">
                {profile.recentActivity.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={item.id} className="relative group">
                      <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-zinc-700 ring-4 ring-zinc-950 group-hover:bg-emerald-500 transition-colors" />

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500">{dateStr}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <Link
                          to={`/u/${profile.username}/${item.projectSlug}`}
                          className="font-mono text-xs font-medium text-zinc-300 transition hover:text-white"
                        >
                          {item.projectName}
                        </Link>
                      </div>

                      <p className="mt-1 text-sm font-medium text-white">{item.built}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
