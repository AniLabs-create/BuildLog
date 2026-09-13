import React from 'react';

interface GitHubButtonProps {
  /** The backend endpoint that starts the OAuth flow (never exposes the secret) */
  href: string;
}

/**
 * GitHubIcon — official GitHub mark, inline SVG (no icon library needed).
 */
export const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3.01-.4c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

/**
 * GitHubButton Component
 *
 * "Continue with GitHub" — a plain <a> so the browser follows the
 * backend's 302 redirect to GitHub. The OAuth secret never touches
 * the frontend; the backend only ever sees the public client ID here.
 */
export const GitHubButton: React.FC<GitHubButtonProps> = ({ href }) => {
  return (
    <a
      href={href}
      className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-zinc-750 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900 active:scale-[0.99]"
    >
      <GitHubIcon className="h-[18px] w-[18px]" />
      Continue with GitHub
    </a>
  );
};

export default GitHubButton;
