import React, { useState, useMemo } from 'react';
import { defaultContentConfig, createAdSpec, AdContentConfig } from './spec';
import { surfaces, SurfaceProfile } from './surfaces';
import { resolveLayout } from './resolver';
import { RenderDOM } from './render-dom';
import {
  Smartphone,
  Tv,
  AlertCircle,
  Eye,
  Layers,
  SlidersHorizontal,
  X,
  Square,
  Tablet,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>('widescreenLandscape');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showContentOptions, setShowContentOptions] = useState<boolean>(false);
  const [contentConfig, setContentConfig] = useState<AdContentConfig>(defaultContentConfig);

  const activeSurface: SurfaceProfile = surfaces[activeSurfaceId] || surfaces.widescreenLandscape;

  // Build AdSpec dynamically from content options
  const adSpec = useMemo(() => {
    return createAdSpec(contentConfig);
  }, [contentConfig]);

  // Execute constraint resolver
  const layout = useMemo(() => {
    return resolveLayout(adSpec, activeSurface);
  }, [adSpec, activeSurface]);

  // Scale down viewport so large screens (1920x1080, 1080x1920) fit nicely on monitor
  const scale = useMemo(() => {
    const maxW = 760;
    const maxH = 460;
    const sW = activeSurface.width > maxW ? maxW / activeSurface.width : 1.0;
    const sH = activeSurface.height > maxH ? maxH / activeSurface.height : 1.0;
    return Math.min(1.0, sW, sH);
  }, [activeSurface.width, activeSurface.height]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'widescreenLandscape':
        return <Tv className="w-4 h-4 text-sky-400" />;
      case 'fullVerticalStories':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'universalSquare':
        return <Square className="w-4 h-4 text-purple-400" />;
      case 'standardPortrait':
        return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'presentationLandscape':
        return <Tablet className="w-4 h-4 text-amber-400" />;
      case 'classicPhotoPortrait':
        return <ImageIcon className="w-4 h-4 text-indigo-400" />;
      case 'crampedBanner':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const updateField = (field: keyof AdContentConfig, val: string) => {
    setContentConfig(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-8">
      {/* Header */}
      <header className="text-center space-y-2 mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>Flam Frontend R&D</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Adaptive Layout Engine for Multi-Surface Ads
        </h1>
        <p className="text-sm text-slate-400">
          A single declarative ad spec resolved dynamically across 6 standard aspect ratios without hardcoded layouts.
        </p>
      </header>

      {/* Surface Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4 max-w-5xl">
        {Object.values(surfaces).map(s => {
          const isActive = s.id === activeSurfaceId;
          const isDegradationTest = s.id === 'crampedBanner';

          return (
            <button
              key={s.id}
              onClick={() => setActiveSurfaceId(s.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition border cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-102'
                  : isDegradationTest
                  ? 'bg-rose-950/30 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{getIcon(s.id)}</span>
              <div className="text-left">
                <div className="font-semibold">{s.name}</div>
                <div className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {s.aspectRatioLabel} • {s.width}×{s.height}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Best For Info Callout */}
      <div className="mb-4 text-center max-w-xl text-xs text-slate-400 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800">
        💡 <strong className="text-slate-300">Best For:</strong> {activeSurface.bestFor}
      </div>

      {/* Action Toolbar: Debug & Content Options */}
      <div className="flex items-center gap-3 mb-5 text-xs">
        <button
          type="button"
          onClick={() => setShowContentOptions(!showContentOptions)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
            showContentOptions
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Content Options</span>
          {showContentOptions && <X className="w-3 h-3 ml-1 opacity-80" />}
        </button>

        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition cursor-pointer ${
            showDebug
              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showDebug ? 'Debug Boxes: ON' : 'Debug Boxes: OFF'}</span>
        </button>

        <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
          Preview Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Content Options Drawer */}
      {showContentOptions && (
        <div className="w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-2xl p-5 mb-6 text-xs space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Customize Ad Content & Brand Colors</span>
            </div>
            <button
              type="button"
              onClick={() => setShowContentOptions(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Headline Text</label>
              <input
                type="text"
                value={contentConfig.headline}
                onChange={e => updateField('headline', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Price / Tagline</label>
              <input
                type="text"
                value={contentConfig.price}
                onChange={e => updateField('price', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">CTA Button Label</label>
              <input
                type="text"
                value={contentConfig.ctaText}
                onChange={e => updateField('ctaText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Hero Image URL</label>
              <input
                type="text"
                value={contentConfig.heroImage}
                onChange={e => updateField('heroImage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={contentConfig.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={contentConfig.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">CTA Button Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={contentConfig.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={contentConfig.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Preview Stage */}
      <div className="flex items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800/80 shadow-2xl mb-8 min-h-[380px] w-full max-w-4xl overflow-auto">
        <RenderDOM
          layout={layout}
          scale={scale}
          showDebug={showDebug}
          primaryColor={contentConfig.primaryColor}
          accentColor={contentConfig.accentColor}
        />
      </div>

      {/* Clean Status & Diagnostics Card */}
      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="font-bold text-white text-sm">
            {activeSurface.name} ({activeSurface.width} × {activeSurface.height}px)
          </div>
          <span className="font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60 capitalize">
            {activeSurface.aspectRatioLabel} • {layout.layoutMode.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">Active Placed Elements ({layout.placedElements.length}):</span>
            <div className="flex flex-wrap gap-1.5">
              {layout.placedElements.map(p => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]"
                >
                  #{p.id}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1">Priority Degradation Status:</span>
            {layout.droppedElements.length > 0 ? (
              <div className="space-y-1">
                {layout.droppedElements.map(d => (
                  <div
                    key={d.id}
                    className="p-1.5 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px]"
                  >
                    ⚠️ <strong>#{d.id}</strong>: {d.reason}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All elements fit comfortably with zero overlap.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
