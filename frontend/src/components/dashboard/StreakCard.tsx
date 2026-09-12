import React from 'react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  return (
    <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-zinc-900/50 to-zinc-900/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-orange-400">
            Build Streak
          </span>
        </div>
        <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
          Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold text-white">
          {currentStreak} <span className="text-lg font-medium text-zinc-400">{currentStreak === 1 ? 'Day' : 'Days'}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          {currentStreak > 0
            ? 'Your streak is active! Keep building and logging today.'
            : 'No logs yet today. Create a 1-minute log to start your streak!'}
        </p>
      </div>
    </div>
  );
};

export default StreakCard;
