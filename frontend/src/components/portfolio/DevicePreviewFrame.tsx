import React, { useState } from 'react';
import type { PortfolioData } from '../../types/portfolio';
import { TemplateRenderer } from './templates';

interface DevicePreviewFrameProps {
  data: PortfolioData;
  onOpenFullScreen?: () => void;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const DevicePreviewFrame: React.FC<DevicePreviewFrameProps> = ({
  data,
  onOpenFullScreen,
}) => {
  const [mode, setMode] = useState<ViewportMode>('desktop');
  const [scale, setScale] = useState<number>(1);

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-300">
        {/* Device Switcher Pills */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 gap-1">
          <button
            type="button"
            onClick={() => setMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              mode === 'desktop'
                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop View (100%)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              mode === 'tablet'
                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tablet View (768px)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              mode === 'mobile'
                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile View (375px)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Viewport Info & Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono hidden md:inline">
            {mode === 'desktop' ? '100% Fluid' : mode === 'tablet' ? '768 x 1024' : '375 x 812'}
          </span>

          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(1))))}
              className="px-1 text-zinc-400 hover:text-white"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-[11px] font-mono text-zinc-400 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(1))))}
              className="px-1 text-zinc-400 hover:text-white"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {onOpenFullScreen && (
            <button
              type="button"
              onClick={onOpenFullScreen}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
              title="Full Screen Preview"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto bg-[#090a0f] p-4 flex items-start justify-center">
        <div
          className={`transition-all duration-300 ${
            mode === 'desktop'
              ? 'w-full shadow-none'
              : mode === 'tablet'
              ? 'w-[768px] rounded-2xl border-8 border-zinc-800 shadow-2xl bg-zinc-900'
              : 'w-[375px] rounded-3xl border-8 border-zinc-800 shadow-2xl bg-zinc-900'
          }`}
          style={{
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Mobile/Tablet Speaker Notch */}
          {mode === 'mobile' && (
            <div className="h-4 bg-zinc-800 flex justify-center items-center">
              <div className="w-16 h-1 rounded-full bg-zinc-600" />
            </div>
          )}

          <div className="overflow-y-auto max-h-[80vh]">
            <TemplateRenderer data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};
