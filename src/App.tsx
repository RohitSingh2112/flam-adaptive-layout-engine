import React, { useState } from 'react';
import { defaultContent, AdContent } from './spec';
import { screenSizes } from './surfaces';
import { resolveAdLayout } from './resolver';
import { RenderDOM } from './render-dom';

export const App: React.FC = () => {
  const [content, setContent] = useState<AdContent>(defaultContent);

  const updateContent = <K extends keyof AdContent>(key: K, value: AdContent[K]) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col lg:flex-row">
      {/* Left Sidebar: CONTENT Options */}
      <aside className="w-full lg:w-80 lg:min-h-screen bg-[#0b0f19] border-r border-slate-800/80 p-5 space-y-6 flex-shrink-0">
        
        {/* Content Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            CONTENT
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Brand Name</label>
              <input
                type="text"
                value={content.brandName}
                onChange={e => updateContent('brandName', e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Headline</label>
              <input
                type="text"
                value={content.headline}
                onChange={e => updateContent('headline', e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={content.description}
                onChange={e => updateContent('description', e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">CTA Text</label>
              <input
                type="text"
                value={content.ctaText}
                onChange={e => updateContent('ctaText', e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Hero Image URL</label>
              <input
                type="text"
                value={content.heroImageUrl}
                onChange={e => updateContent('heroImageUrl', e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="pt-2 border-t border-slate-850">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            BRAND COLORS
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Primary</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={content.primaryColor}
                  onChange={e => updateContent('primaryColor', e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent border border-slate-800 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={content.primaryColor}
                  onChange={e => updateContent('primaryColor', e.target.value)}
                  className="flex-1 bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Secondary</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={content.secondaryColor}
                  onChange={e => updateContent('secondaryColor', e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent border border-slate-800 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={content.secondaryColor}
                  onChange={e => updateContent('secondaryColor', e.target.value)}
                  className="flex-1 bg-[#111625] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Focal Point */}
        <div className="pt-2 border-t border-slate-850">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            FOCAL POINT
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>X (0–1)</span>
                <span className="font-mono text-slate-300">{content.focalPointX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={content.focalPointX}
                onChange={e => updateContent('focalPointX', parseFloat(e.target.value))}
                className="w-full accent-[#e94560] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Y (0–1)</span>
                <span className="font-mono text-slate-300">{content.focalPointY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={content.focalPointY}
                onChange={e => updateContent('focalPointY', parseFloat(e.target.value))}
                className="w-full accent-[#e94560] cursor-pointer"
              />
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area: Screen Layouts Grid */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto bg-[#070b14]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Bar Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Multi-Surface Adaptive Ad Preview
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Adapts one declarative content spec across 6 responsive surface dimensions live.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                {screenSizes.length} Target Surfaces
              </span>
            </div>
          </div>

          {/* Grid of Screen Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start justify-items-center">
            {screenSizes.map(screen => {
              const layout = resolveAdLayout(content, screen);

              return (
                <div
                  key={screen.id}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl bg-[#0a0f1d]/60 border border-slate-800/60 shadow-xl w-full ${
                    screen.id === 'leaderboard' || screen.id === 'wide-billboard'
                      ? 'md:col-span-2'
                      : ''
                  }`}
                >
                  <RenderDOM
                    layout={layout}
                    content={content}
                    screen={screen}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
