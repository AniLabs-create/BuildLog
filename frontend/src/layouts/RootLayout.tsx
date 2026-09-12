import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

interface RootLayoutProps {
  children?: React.ReactNode;
}

/**
 * RootLayout Component
 *
 * Provides the global wrapper layout across all pages:
 * - Persistent dark theme background and text styling
 * - Global NavBar at the top with client-side SPA links
 * - Main content container rendering either direct children or nested route <Outlet />
 * - Global Footer at the bottom
 */
export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100 antialiased">
      <NavBar />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
