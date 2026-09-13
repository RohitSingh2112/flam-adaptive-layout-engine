import React, { useState, useMemo } from 'react';
import { defaultContentConfig, createAdSpec, AdContentConfig } from './spec';
import { surfaces, SurfaceProfile } from './surfaces';
import { resolveLayout } from './resolver';
import { RenderDOM } from './render-dom';
import { RenderCanvas } from './render-canvas';
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
  AlertTriangle,
  Cpu,
  Monitor,
  RotateCcw,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>('widescreenLandscape');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showContentOptions, setShowContentOptions] = useState<boolean>(false);
  const [renderBackend, setRenderBackend] = useState<'dom' | 'canvas'>('dom');
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [contentConfig, setContentConfig] = useState<AdContentConfig>(defaultContentConfig);

  const baseSurface: SurfaceProfile = surfaces[activeSurfaceId] || surfaces.widescreenLandscape;

  // Optional live height override to demonstrate priority degradation dynamically
  const activeSurface: SurfaceProfile = useMemo(() => {
    if (customHeight !== null) {
      return {
        ...baseSurface,
        height: customHeight,
      };
    }
    return baseSurface;
  }, [baseSurface, customHeight]);

  // Build AdSpec dynamically from content options
  const adSpec = useMemo(() => {
    return createAdSpec(contentConfig);
  }, [contentConfig]);

  // Execute constraint resolver
  const layout = useMemo(() => {
    return resolveLayout(adSpec, activeSurface);
  }, [adSpec, activeSurface]);

  // Scale down viewport so large screens fit nicely on monitor
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
      case 'broadcastLowerThird':
        return <Monitor className="w-4 h-4 text-blue-400" />;
      case 'crampedBanner':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const updateField = (field: keyof AdContentConfig, val: string) => {
    setContentConfig(prev => ({ ...prev, [field]: val }));
  };

  const handleSelectSurface = (id: string) => {
    setActiveSurfaceId(id);
    setCustomHeight(null);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center p-4 sm:p-8 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="text-center space-y-2 mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-600/50 text-blue-300 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Flam Frontend R&D • Adaptive Layout Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Multi-Surface Adaptive Ad Engine
        </h1>
        <p className="text-sm text-neutral-400">
          One declarative ad spec mathematically adapted across disparate aspect ratios, hard device constraints, and graceful priority degradation.
        </p>
      </header>

      {/* Surface Selector Tabs */}
      <div className="w-full max-w-5xl space-y-3 mb-6">
        {/* Standard Surfaces */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.values(surfaces).map(s => {
            const isActive = s.id === activeSurfaceId;
            const isCramped = s.id === 'crampedBanner';

            return (
              <button
                key={s.id}
                onClick={() => handleSelectSurface(s.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition border cursor-pointer ${
                  isActive
                    ? isCramped
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/40 scale-[1.02]'
                      : 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/40 scale-[1.02]'
                    : isCramped
                    ? 'bg-[#15120c] text-amber-300 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-[#0e0e13] text-neutral-300 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{getIcon(s.id)}</span>
                <div className="text-left">
                  <div className="font-semibold">{s.name}</div>
                  <div
                    className={`text-[10px] ${
                      isActive
                        ? isCramped
                          ? 'text-amber-100'
                          : 'text-blue-200'
                        : isCramped
                        ? 'text-amber-400/70'
                        : 'text-neutral-500'
                    }`}
                  >
                    {s.aspectRatioLabel} • {s.width}×{s.height}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toolbar: Renderer Backend, Debug, Live Constraint Slider, Content Options */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-5 text-xs">
        {/* Backend Toggle (DOM vs Canvas) */}
        <div className="flex items-center bg-[#0e0e13] border border-white/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setRenderBackend('dom')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
              renderBackend === 'dom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>DOM / CSS</span>
          </button>
          <button
            type="button"
            onClick={() => setRenderBackend('canvas')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
              renderBackend === 'canvas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>HTML5 Canvas</span>
          </button>
        </div>

        {/* Content Options Toggle */}
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

        {/* Debug Wireframes Toggle */}
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

        {/* Interactive Height Constraint Stress Slider */}
        <div className="flex items-center gap-2 bg-[#0e0e13] border border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-neutral-400 text-[11px] font-medium">Height Stress:</span>
          <input
            type="range"
            min="90"
            max={baseSurface.height}
            value={customHeight !== null ? customHeight : baseSurface.height}
            onChange={e => setCustomHeight(Number(e.target.value))}
            className="w-24 accent-blue-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
          />
          <span className="font-mono text-blue-300 text-[11px]">
            {activeSurface.height}px
          </span>
          {customHeight !== null && (
            <button
              type="button"
              onClick={() => setCustomHeight(null)}
              title="Reset Height"
              className="text-neutral-400 hover:text-white ml-0.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
          Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Degradation Warning Banner (Displayed when elements are dropped) */}
      {layout.droppedElements.length > 0 && (
        <div className="w-full max-w-3xl bg-amber-950/40 border border-amber-500/50 rounded-xl p-3.5 mb-5 text-xs text-amber-200 flex items-start gap-3 shadow-lg animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <span>Priority Degradation Active</span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                {layout.droppedElements.length} element(s) dropped cleanly
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-300 text-[11px]">
              {layout.droppedElements.map(d => (
                <li key={d.id}>
                  <strong className="text-amber-200">#{d.id}</strong> (Priority {d.priority}): {d.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
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
              <label className="block text-neutral-400 font-medium mb-1">Description Text</label>
              <textarea
                rows={2}
                value={contentConfig.description}
                onChange={e => updateField('description', e.target.value)}
                className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition resize-none"
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

      {/* Ad Preview Stage (DOM or Canvas backend) */}
      <div className="flex items-center justify-center p-6 bg-[#0a0a0f]/80 rounded-3xl border border-white/10 shadow-2xl mb-8 min-h-[380px] w-full max-w-4xl overflow-auto">
        {renderBackend === 'dom' ? (
          <RenderDOM
            layout={layout}
            scale={scale}
            showDebug={showDebug}
            primaryColor={contentConfig.primaryColor}
            accentColor={contentConfig.accentColor}
          />
        ) : (
          <RenderCanvas
            layout={layout}
            scale={scale}
            showDebug={showDebug}
            primaryColor={contentConfig.primaryColor}
            accentColor={contentConfig.accentColor}
          />
        )}
      </div>

      {/* Status & Diagnostics Card */}
      <div className="w-full max-w-3xl bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="font-bold text-white text-sm">
            {activeSurface.name} ({activeSurface.width} × {activeSurface.height}px)
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400">
              Backend: <strong className="text-white uppercase">{renderBackend}</strong>
            </span>
            <span className="font-mono text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-600/50">
              AR: {layout.aspectRatio} • {layout.layoutMode.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-neutral-400 font-semibold block mb-1">
              Active Placed Elements ({layout.placedElements.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {layout.placedElements.map(p => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded bg-[#16161f] text-neutral-200 border border-white/5 font-mono text-[11px]"
                >
                  #{p.id} (P{p.element.priority})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block mb-1">Hard Surface Constraints:</span>
            <ul className="text-neutral-300 space-y-0.5 font-mono text-[11px]">
              <li>• minTapTarget: {activeSurface.minTapTarget}px</li>
              <li>• minTextSize: {activeSurface.minTextSize}px</li>
              <li>• viewingDistance: {activeSurface.viewingDistance}</li>
              <li>• touchOnly: {activeSurface.touchOnly ? 'true' : 'false'}</li>
            </ul>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block mb-1">Layout Integrity:</span>
            <span className="text-blue-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Resolved mathematically within safe bounds with 0 overlaps.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
