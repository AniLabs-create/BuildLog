import React from 'react';
import type { PortfolioTheme } from '../../../types/portfolio';
import { getTemplateById } from '../templates/TemplateRegistry';

interface ThemeEditorProps {
  templateId: string;
  theme: PortfolioTheme;
  onChangeTemplate: (templateId: string) => void;
  onChangeTheme: (theme: PortfolioTheme) => void;
  onOpenTemplateGallery: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  templateId,
  theme,
  onChangeTheme,
  onOpenTemplateGallery,
}) => {
  const currentTemplate = getTemplateById(templateId);

  const colorPresets = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Crimson', hex: '#ff3b30' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'White', hex: '#ffffff' },
  ];

  return (
    <div className="space-y-8 text-xs">
      {/* Template Chooser Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Active Template</h4>
            <p className="text-zinc-400 text-[11px]">Select from our 20 specialized portfolio templates</p>
          </div>
          <button
            type="button"
            onClick={onOpenTemplateGallery}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 transition shadow-sm"
          >
            Browse 20 Templates ↗
          </button>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-850">
          <span
            className="h-4 w-4 rounded-full border border-zinc-700"
            style={{ backgroundColor: currentTemplate.accentColor }}
          />
          <div>
            <span className="font-bold text-white text-sm">{currentTemplate.name}</span>
            <span className="ml-2 font-mono text-[10px] text-purple-400 uppercase">
              [{currentTemplate.category}]
            </span>
            <p className="text-zinc-400 text-xs mt-0.5">{currentTemplate.description}</p>
          </div>
        </div>
      </div>

      {/* Colors & Palette */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Color Palette
        </h4>

        <div>
          <label className="block text-zinc-400 mb-2">Preset Accent Colors</label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChangeTheme({ ...theme, primary_color: preset.hex })}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition ${
                  theme.primary_color === preset.hex
                    ? 'border-white bg-zinc-800 text-white font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-zinc-400 mb-1">Custom Primary Accent (Hex)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primary_color || '#10b981'}
                onChange={(e) => onChangeTheme({ ...theme, primary_color: e.target.value })}
                className="h-9 w-9 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={theme.primary_color || '#10b981'}
                onChange={(e) => onChangeTheme({ ...theme, primary_color: e.target.value })}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Secondary Accent (Hex)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.secondary_color || '#8b5cf6'}
                onChange={(e) => onChangeTheme({ ...theme, secondary_color: e.target.value })}
                className="h-9 w-9 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondary_color || '#8b5cf6'}
                onChange={(e) => onChangeTheme({ ...theme, secondary_color: e.target.value })}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography & Geometry */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Typography &amp; Geometry
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 mb-1">Font Family Direction</label>
            <select
              value={theme.font_family || 'sans'}
              onChange={(e) => onChangeTheme({ ...theme, font_family: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none"
            >
              <option value="sans">Modern Sans (Inter / Geist)</option>
              <option value="serif">Editorial Serif (Merriweather / Playfair)</option>
              <option value="mono">Monospace (JetBrains Mono / Fira Code)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Border Radius</label>
            <select
              value={theme.border_radius || 'medium'}
              onChange={(e) => onChangeTheme({ ...theme, border_radius: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none"
            >
              <option value="none">Sharp / Brutalist (0px)</option>
              <option value="small">Subtle (6px)</option>
              <option value="medium">Modern Rounded (12px)</option>
              <option value="large">Pill / Organic (24px)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
