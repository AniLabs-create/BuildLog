import React from 'react';
import { Link } from 'react-router-dom';
import type { TimelineItem } from '../../services/stats';

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-8 text-center">
        <p className="font-mono text-sm text-zinc-500">No activity logged yet.</p>
        <p className="mt-1 text-xs text-zinc-600">
          Create a project and log your first progress update to start your developer timeline!
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-zinc-800 space-y-6">
      {items.map((item) => {
        const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node dot */}
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-zinc-700 ring-4 ring-zinc-950 group-hover:bg-emerald-500 transition-colors" />

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">{dateStr}</span>
              <span className="text-zinc-600">&bull;</span>
              <Link
                to={`/projects/${item.projectId}`}
                className="font-mono text-xs text-zinc-300 hover:text-white transition font-medium"
              >
                {item.projectName}
              </Link>
            </div>

            <p className="text-sm font-medium text-white mt-1">
              {item.built}
            </p>

            <p className="text-xs text-zinc-400 mt-1 pl-3 border-l border-zinc-800 italic">
              &ldquo;{item.learned}&rdquo;
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
