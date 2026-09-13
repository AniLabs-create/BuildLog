import React, { useEffect } from 'react';

/**
 * OAuthCallbackPage (/oauth/callback)
 *
 * Landing point after GitHub redirects back from the backend. The backend
 * appends the JWT in the URL FRAGMENT ('#token=...') — fragments are never
 * sent to any server, only to this page in the browser.
 *
 * Steps: store the token where the existing API client reads it, then do a
 * full page load into the app so AuthProvider picks it up. If the account
 * hasn't finished onboarding, the router's setup guard sends them to /setup.
 */
export const OAuthCallbackPage: React.FC = () => {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      // Full reload so AuthContext initializes from the stored token
      window.location.replace('/home');
    } else {
      window.location.replace(
        '/login?oauth_error=' +
          encodeURIComponent('GitHub login failed. No session was created.')
      );
    }
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        <p className="font-mono text-xs text-zinc-500">Signing you in with GitHub...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
