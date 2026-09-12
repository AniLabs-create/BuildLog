import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { getNotifications } from '../services/notifications';

/**
 * NavBar Component
 *
 * Public visitors: brand + landing anchors + Login/Signup.
 * Authenticated users: app navigation (Home, Dashboard, Search,
 * Notifications with unread badge, Settings) + profile + logout.
 */
export const NavBar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Poll notifications for the unread badge (V1: polling, no WebSockets)
  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotifications();
      setUnreadCount(data.unreadCount);
    } catch {
      // badge is cosmetic; ignore fetch errors here
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60_000);
    return () => clearInterval(interval);
  }, [refreshUnread, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Active-route highlight for app links
  const linkClass = (path: string) =>
    `text-sm transition ${
      location.pathname === path
        ? 'font-medium text-white'
        : 'text-zinc-400 hover:text-zinc-200'
    }`;

  const appLinks: Array<{ to: string; label: string; badge?: number }> = [
    { to: '/home', label: 'Home' },
    { to: '/dashboard', label: 'Projects' },
    { to: '/search', label: 'Search' },
    { to: '/notifications', label: 'Notifications', badge: unreadCount },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? '/home' : '/'}
            className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight text-white transition hover:opacity-90"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700/60">
              &gt;_
            </span>
            <span>
              Build<span className="text-zinc-400">Log</span>
            </span>
          </Link>
          <span className="hidden rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-medium text-zinc-400 sm:inline-block">
            v1.0
          </span>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <div className="hidden items-center gap-7 md:flex">
            {appLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`${linkClass(link.to)} relative`}>
                {link.label}
                {!!link.badge && link.badge > 0 && (
                  <span className="absolute -right-5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/#how-it-works" className="text-sm text-zinc-400 transition hover:text-zinc-200">
              How it works
            </Link>
            <Link to="/#preview" className="text-sm text-zinc-400 transition hover:text-zinc-200">
              Sample Log
            </Link>
            <Link to="/#philosophy" className="text-sm text-zinc-400 transition hover:text-zinc-200">
              Philosophy
            </Link>
          </div>
        )}

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className={linkClass('/settings')}
                title="Settings"
              >
                ⚙️
              </Link>
              <Link
                to={`/u/${user?.username}`}
                className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 transition hover:text-white hover:border-zinc-600"
                title="View your public profile"
              >
                @{user?.username}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative rounded p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {appLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2 py-1 text-sm text-zinc-300 transition hover:text-white"
                  >
                    {link.label}
                    {!!link.badge && link.badge > 0 && (
                      <span className="ml-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-zinc-950">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <Link
                  to={`/u/${user?.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 text-sm text-zinc-300 transition hover:text-white"
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 text-sm text-zinc-300 transition hover:text-white"
                >
                  Settings
                </Link>
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-zinc-850">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout (@{user?.username})
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 text-sm text-zinc-400 transition hover:text-zinc-200"
                >
                  How it works
                </Link>
                <Link
                  to="/#preview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 text-sm text-zinc-400 transition hover:text-zinc-200"
                >
                  Sample Log
                </Link>
                <Link
                  to="/#philosophy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 text-sm text-zinc-400 transition hover:text-zinc-200"
                >
                  Philosophy
                </Link>
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-zinc-850">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
