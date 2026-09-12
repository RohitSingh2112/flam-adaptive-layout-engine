import React, { useState, useMemo } from 'react';
import { defaultAdSpec } from './spec';
import { surfaces } from './surfaces';
import { resolveLayout } from './resolver';
import { RenderDOM } from './render-dom';
import { Smartphone, Monitor, Tv, AlertCircle, Eye, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>('mobilePortrait');
  const [showDebug, setShowDebug] = useState<boolean>(false);

  const activeSurface = surfaces[activeSurfaceId] || surfaces.mobilePortrait;

  // Run the core constraint resolver
  const layout = useMemo(() => {
    return resolveLayout(defaultAdSpec, activeSurface);
  }, [activeSurface]);

  // Compute scale so large surfaces (e.g. 1920px broadcast or 1080px kiosk) fit nicely on screen
  const scale = useMemo(() => {
    const maxW = 760;
    const maxH = 460;
    const sW = activeSurface.width > maxW ? maxW / activeSurface.width : 1.0;
    const sH = activeSurface.height > maxH ? maxH / activeSurface.height : 1.0;
    return Math.min(1.0, sW, sH);
  }, [activeSurface.width, activeSurface.height]);

  const getIcon = (id: string) => {
    if (id === 'broadcastLowerThird') return <Tv className="w-4 h-4" />;
    if (id === 'retailKiosk') return <Monitor className="w-4 h-4" />;
    if (id === 'crampedBanner') return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <Smartphone className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-8">
      {/* Header */}
      <header className="text-center space-y-2 mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>Flam Frontend R&D</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Adaptive Layout Engine for Multi-Surface Ads
        </h1>
        <p className="text-sm text-slate-400">
          A single declarative ad spec resolved dynamically across fundamentally different aspect ratios without hardcoded layouts.
        </p>
      </header>

      {/* Surface Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-4xl">
        {Object.values(surfaces).map(s => {
          const isActive = s.id === activeSurfaceId;
          const isDegradationTest = s.id === 'crampedBanner';

          return (
            <button
              key={s.id}
              onClick={() => setActiveSurfaceId(s.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium transition border cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                  : isDegradationTest
                  ? 'bg-amber-950/30 text-amber-300 border-amber-800/60 hover:bg-amber-900/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{getIcon(s.id)}</span>
              <div className="text-left">
                <div className="font-semibold">{s.name}</div>
                <div className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {s.width} × {s.height}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Debug Outlines Toggle */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
            showDebug
              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showDebug ? 'Debug Boxes: ON' : 'Debug Boxes: OFF'}</span>
        </button>
        <span className="text-slate-500 font-mono text-[11px]">
          Preview Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Ad Preview Stage */}
      <div className="flex items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800/80 shadow-2xl mb-8 min-h-[360px] w-full max-w-4xl overflow-auto">
        <RenderDOM
          layout={layout}
          scale={scale}
          showDebug={showDebug}
        />
      </div>

      {/* Clean Status & Diagnostics Card */}
      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="font-bold text-white text-sm">
            {activeSurface.name} ({activeSurface.width} × {activeSurface.height}px)
          </div>
          <span className="font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60 capitalize">
            Mode: {layout.layoutMode.replace('-', ' ')} (AR {layout.aspectRatio})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">Active Elements ({layout.placedElements.length}):</span>
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
              <span className="text-emerald-400 font-medium">
                ✓ All elements fit comfortably with zero degradation.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
