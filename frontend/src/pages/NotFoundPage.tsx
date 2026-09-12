import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

/**
 * NotFoundPage Component
 *
 * Rendered whenever a user visits an unregistered or invalid URL.
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center px-4 text-center">
      <div className="font-mono text-5xl font-extrabold text-zinc-700 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        The route you are trying to access does not exist or has been moved.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="primary" size="md">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
