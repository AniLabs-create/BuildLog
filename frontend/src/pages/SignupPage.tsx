import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GitHubButton } from '../components/auth/GitHubButton';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../services/api';
import { getErrorMessage } from '../utils/errors';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in? Never show the signup form — send them to the app.
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(username.trim(), email.trim(), password);
      // Every new account goes through onboarding
      navigate('/setup');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed. Please check your details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-sm font-bold text-white mb-3">
              &gt;_
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create your BuildLog
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Start tracking what you build, learn, and overcome
            </p>
          </div>

          {(searchParams.get('oauth_error') || error) && (
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {searchParams.get('oauth_error') || error}
            </div>
          )}

          <div className="mb-5">
            <GitHubButton href={`${API_BASE_URL}/auth/github/login`} />
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              or sign up with email
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signupUsername"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                USERNAME
              </label>
              <input
                id="signupUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="yourhandle"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signupEmail"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                EMAIL
              </label>
              <input
                id="signupEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signupPassword"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                PASSWORD
              </label>
              <input
                id="signupPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signupConfirm"
                className="block text-xs font-mono font-medium text-zinc-300 mb-1.5"
              >
                CONFIRM PASSWORD
              </label>
              <input
                id="signupConfirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                autoComplete="new-password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full justify-center mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-zinc-300 hover:text-white transition underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
