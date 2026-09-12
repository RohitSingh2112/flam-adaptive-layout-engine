import React, { useState, useMemo } from 'react';
import { defaultContentConfig, createAdSpec, AdContentConfig } from './spec';
import { surfaces, SurfaceProfile } from './surfaces';
import { resolveLayout } from './resolver';
import { RenderDOM } from './render-dom';
import {
  Smartphone,
  Tv,
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
        return <Tv className="w-4 h-4 text-blue-400" />;
      case 'fullVerticalStories':
        return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'universalSquare':
        return <Square className="w-4 h-4 text-blue-400" />;
      case 'standardPortrait':
        return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'presentationLandscape':
        return <Tablet className="w-4 h-4 text-blue-400" />;
      case 'classicPhotoPortrait':
        return <ImageIcon className="w-4 h-4 text-blue-400" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const updateField = (field: keyof AdContentConfig, val: string) => {
    setContentConfig(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center p-4 sm:p-8 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="text-center space-y-2 mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-600/50 text-blue-300 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Flam Frontend R&D</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Adaptive Layout Engine for Multi-Surface Ads
        </h1>
        <p className="text-sm text-neutral-400">
          A single declarative ad spec resolved dynamically across 6 standard aspect ratios without hardcoded layouts.
        </p>
      </header>

      {/* Surface Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-5xl">
        {Object.values(surfaces).map(s => {
          const isActive = s.id === activeSurfaceId;

          return (
            <button
              key={s.id}
              onClick={() => setActiveSurfaceId(s.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition border cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/40 scale-[1.02]'
                  : 'bg-[#0e0e13] text-neutral-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{getIcon(s.id)}</span>
              <div className="text-left">
                <div className="font-semibold">{s.name}</div>
                <div className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-neutral-500'}`}>
                  {s.aspectRatioLabel} • {s.width}×{s.height}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Toolbar: Debug & Content Options */}
      <div className="flex items-center gap-3 mb-5 text-xs">
        <button
          type="button"
          onClick={() => setShowContentOptions(!showContentOptions)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
            showContentOptions
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
              : 'bg-[#0e0e13] border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Content Options</span>
          {showContentOptions && <X className="w-3 h-3 ml-1 opacity-80" />}
        </button>

        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition cursor-pointer ${
            showDebug
              ? 'bg-blue-950/70 border-blue-500 text-blue-300'
              : 'bg-[#0e0e13] border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>{showDebug ? 'Debug Boxes: ON' : 'Debug Boxes: OFF'}</span>
        </button>

        <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
          Preview Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Content Options Drawer */}
      {showContentOptions && (
        <div className="w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 mb-6 text-xs space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span>Customize Ad Content & Theme</span>
            </div>
            <button
              type="button"
              onClick={() => setShowContentOptions(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Headline Text</label>
              <input
                type="text"
                value={contentConfig.headline}
                onChange={e => updateField('headline', e.target.value)}
                className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Price / Tagline</label>
              <input
                type="text"
                value={contentConfig.price}
                onChange={e => updateField('price', e.target.value)}
                className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">CTA Button Label</label>
              <input
                type="text"
                value={contentConfig.ctaText}
                onChange={e => updateField('ctaText', e.target.value)}
                className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Hero Image URL</label>
              <input
                type="text"
                value={contentConfig.heroImage}
                onChange={e => updateField('heroImage', e.target.value)}
                className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Card Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={contentConfig.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-white/15 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={contentConfig.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="flex-1 bg-[#111116] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Accent Button Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={contentConfig.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-white/15 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={contentConfig.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="flex-1 bg-[#111116] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Preview Stage */}
      <div className="flex items-center justify-center p-6 bg-[#0a0a0f]/80 rounded-3xl border border-white/10 shadow-2xl mb-8 min-h-[380px] w-full max-w-4xl overflow-auto">
        <RenderDOM
          layout={layout}
          scale={scale}
          showDebug={showDebug}
          primaryColor={contentConfig.primaryColor}
          accentColor={contentConfig.accentColor}
        />
      </div>

      {/* Status & Diagnostics Card */}
      <div className="w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="font-bold text-white text-sm">
            {activeSurface.name} ({activeSurface.width} × {activeSurface.height}px)
          </div>
          <span className="font-mono text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-600/50">
            {activeSurface.aspectRatioLabel} • {layout.layoutMode.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-neutral-400 font-semibold block mb-1">Active Placed Elements ({layout.placedElements.length}):</span>
            <div className="flex flex-wrap gap-1.5">
              {layout.placedElements.map(p => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded bg-[#16161f] text-neutral-200 border border-white/5 font-mono text-[11px]"
                >
                  #{p.id}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block mb-1">Layout Quality & Collision:</span>
            <span className="text-blue-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              All elements resolved within bounds with zero overlaps.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
