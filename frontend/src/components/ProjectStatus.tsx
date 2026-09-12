import React from 'react';
import { cn } from '../utils/cn';
import type { ProjectStatus as ProjectStatusType } from '../types';

interface ProjectStatusProps {
  status: ProjectStatusType;
  className?: string;
}

/**
 * Map each project status to a color treatment.
 * Extracted here so every page shows statuses identically.
 */
const statusStyles: Record<ProjectStatusType, string> = {
  Building: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Deployed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Idea: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Abandoned: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

/**
 * ProjectStatus Component
 *
 * Small colored badge showing a project's lifecycle stage
 * (Idea / Building / Completed / Deployed / Abandoned).
 */
export const ProjectStatus: React.FC<ProjectStatusProps> = ({ status, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        statusStyles[status] ?? statusStyles.Abandoned,
        className
      )}
    >
      {status}
    </span>
  );
};

export default ProjectStatus;
