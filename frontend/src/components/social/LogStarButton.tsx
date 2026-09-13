import React, { useState } from 'react';
import { socialApi } from '../../services/social';
import type { SocialTargetType } from '../../types';

interface LogStarButtonProps {
  targetType: SocialTargetType;
  targetId: number;
  count: number;
  starred: boolean;
  /** Notifies the parent so it can update cached counts */
  onChanged?: (starred: boolean, count: number) => void;
  size?: 'sm' | 'md';
}

/**
 * LogStarButton Component
 *
 * BuildLog's own reaction — deliberately labeled "Log Star" (🔥) and always
 * visually distinct from GitHub stars (⭐, a synced number, never a button).
 * Toggle semantics: click to star, click again to un-star.
 */
export const LogStarButton: React.FC<LogStarButtonProps> = ({
  targetType,
  targetId,
  count,
  starred,
  onChanged,
  size = 'sm',
}) => {
  const [isStarred, setIsStarred] = useState(starred);
  const [currentCount, setCurrentCount] = useState(count);
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await socialApi.toggleLogStar(targetType, targetId);
      setIsStarred(result.starred);
      setCurrentCount(result.count);
      onChanged?.(result.starred, result.count);
    } catch {
      // Logged out users get a quiet failure; owner-only content 404s
    } finally {
      setBusy(false);
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      title={isStarred ? 'Remove Log Star' : 'Give a Log Star'}
      className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md border font-medium transition disabled:opacity-50 ${pad} ${
        isStarred
          ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
          : 'border-zinc-750 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400'
      }`}
    >
      <span>🔥</span>
      <span>Log Star</span>
      {currentCount > 0 && <span className="font-mono">{currentCount}</span>}
    </button>
  );
};

export default LogStarButton;
