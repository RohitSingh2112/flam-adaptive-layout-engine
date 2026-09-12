import React, { useState, useMemo, useRef, useEffect } from 'react';
import { defaultAdSpec, AdSpec } from './spec';
import { defaultSurfaces, SurfaceProfile } from './surfaces';
import { resolveLayout } from './resolver';
import { RenderDOM } from './render-dom';
import { renderToCanvas } from './render-canvas';
import { SurfaceSelector } from './components/SurfaceSelector';
import { ResolutionInspector } from './components/ResolutionInspector';
import { CustomSurfaceModal } from './components/CustomSurfaceModal';
import {
  Maximize2,
  Minimize2,
  Sliders,
  Code2,
  Eye,
  Sparkles,
  Layers,
  RotateCcw,
  Palette,
} from 'lucide-react';

export const App: React.FC = () => {
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceProfile>>(defaultSurfaces);
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>('mobileInterstitial');
  const [spec] = useState<AdSpec>(defaultAdSpec);
  
  // Interactive Controls
  const [showDebugBoxes, setShowDebugBoxes] = useState<boolean>(true);
  const [useCanvasRenderer, setUseCanvasRenderer] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);

  // Live Dynamic Viewport Squeeze / Stress Testing
  const baseSurface = surfaces[activeSurfaceId] || defaultSurfaces.mobileInterstitial;
  const [overrideWidth, setOverrideWidth] = useState<number>(baseSurface.width);
  const [overrideHeight, setOverrideHeight] = useState<number>(baseSurface.height);

  // Sync override dimensions whenever active surface preset changes
  useEffect(() => {
    setOverrideWidth(baseSurface.width);
    setOverrideHeight(baseSurface.height);
  }, [activeSurfaceId, baseSurface]);

  // Construct active dynamic profile
  const activeSurface: SurfaceProfile = useMemo(() => {
    return {
      ...baseSurface,
      width: overrideWidth,
      height: overrideHeight,
    };
  }, [baseSurface, overrideWidth, overrideHeight]);

  // Execute Core Constraint Resolution Algorithm
  const resolvedLayout = useMemo(() => {
    return resolveLayout(spec, activeSurface);
  }, [spec, activeSurface]);

  // Auto-compute comfortable preview scale factor based on viewport size
  const autoScale = useMemo(() => {
    const maxPreviewW = 780;
    const maxPreviewH = 500;
    const scaleW = activeSurface.width > maxPreviewW ? maxPreviewW / activeSurface.width : 1.0;
    const scaleH = activeSurface.height > maxPreviewH ? maxPreviewH / activeSurface.height : 1.0;
    return Math.min(1.0, scaleW, scaleH);
  }, [activeSurface.width, activeSurface.height]);

  const [manualScale, setManualScale] = useState<number | null>(null);
  const effectiveScale = manualScale ?? autoScale;

  // Canvas renderer reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (useCanvasRenderer && canvasRef.current) {
      renderToCanvas(canvasRef.current, resolvedLayout, effectiveScale, showDebugBoxes);
    }
  }, [useCanvasRenderer, resolvedLayout, effectiveScale, showDebugBoxes]);

  // Handle adding custom unknown surface
  const handleSaveCustomSurface = (newSurface: SurfaceProfile) => {
    setSurfaces(prev => ({
      ...prev,
      [newSurface.id]: newSurface,
    }));
    setActiveSurfaceId(newSurface.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">FLAM</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono">
                  R&D Assignment
                </span>
              </div>
              <h1 className="text-xs text-slate-400 font-medium">Adaptive Layout Engine for Multi-Surface Ads</h1>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Spec: <strong className="text-white">1 Defined</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Surfaces: <strong className="text-white">{Object.keys(surfaces).length} Profiles</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              Zero Hardcoded CSS
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Surface Profiles Bar */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Select Surface Profile or Create Unknown Surface</span>
            </div>
            <span className="text-xs text-slate-500 hidden md:inline">
              Single spec re-resolves live into unique aspect ratios
            </span>
          </div>

          <SurfaceSelector
            surfaces={surfaces}
            activeSurfaceId={activeSurfaceId}
            onSelectSurface={id => {
              setActiveSurfaceId(id);
              setManualScale(null);
            }}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
          />
        </section>

        {/* Layout Preview Arena + Live Stress Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Main Column: The Responsive Canvas Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
              
              {/* Preview Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeSurface.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      ({activeSurface.width}×{activeSurface.height}px)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{activeSurface.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Debug Overlay */}
                  <button
                    type="button"
                    onClick={() => setShowDebugBoxes(!showDebugBoxes)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      showDebugBoxes
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle bounding box guides and safe area outlines"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Debug Boxes</span>
                  </button>

                  {/* Toggle Canvas vs DOM Renderer */}
                  <button
                    type="button"
                    onClick={() => setUseCanvasRenderer(!useCanvasRenderer)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      useCanvasRenderer
                        ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Render layout using Canvas 2D API instead of React DOM"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>{useCanvasRenderer ? 'Canvas Target' : 'DOM Target'}</span>
                  </button>
                </div>
              </div>

              {/* Live Stress-Test Slider (Squeeze Viewport to Trigger Degradation) */}
              <div className="my-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-300">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Interactive Viewport Squeeze (Priority Degradation Test)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideWidth(baseSurface.width);
                      setOverrideHeight(baseSurface.height);
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Dimensions</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Width: <strong className="text-white">{overrideWidth}px</strong></span>
                      <span className="text-[10px] text-slate-500">Min 200px</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max={Math.max(1920, baseSurface.width)}
                      value={overrideWidth}
                      onChange={e => setOverrideWidth(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Height: <strong className="text-white">{overrideHeight}px</strong></span>
                      <span className="text-[10px] text-slate-500">Shrink to force drop</span>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max={Math.max(1080, baseSurface.height)}
                      value={overrideHeight}
                      onChange={e => setOverrideHeight(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Viewport Scale Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
                <span>
                  Render Preview Scale: <strong className="text-indigo-300 font-mono">{(effectiveScale * 100).toFixed(0)}%</strong>
                  {effectiveScale < 1.0 && ' (Auto-fit to monitor)'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setManualScale(Math.max(0.2, effectiveScale - 0.1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualScale(Math.min(1.5, effectiveScale + 0.1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualScale(null)}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Display Canvas Container */}
              <div className="flex items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-auto min-h-[380px]">
                {useCanvasRenderer ? (
                  <canvas
                    ref={canvasRef}
                    className="rounded-xl shadow-2xl transition-all duration-200"
                  />
                ) : (
                  <RenderDOM
                    layout={resolvedLayout}
                    showDebugBoxes={showDebugBoxes}
                    scale={effectiveScale}
                    className="rounded-xl"
                    onElementClick={el => setSelectedElement(el)}
                  />
                )}
              </div>
            </div>

            {/* Diagnostics Panel */}
            <ResolutionInspector
              layout={resolvedLayout}
              surface={activeSurface}
            />
          </div>

          {/* Right Column: Spec Inspector & Declarative Architecture */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Declarative Ad Spec Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Single Declarative Ad Spec</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                  {spec.elements.length} Elements
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                The ad is defined once using <code className="text-indigo-300">defineAd()</code> with semantic roles and priority levels. The resolver dynamically lays it out across all aspect ratios without per-surface templates.
              </p>

              <div className="space-y-2 pt-2">
                {spec.elements.map(el => (
                  <div
                    key={el.id}
                    className={`p-2.5 rounded-xl border transition ${
                      selectedElement?.id === el.id
                        ? 'bg-indigo-950/50 border-indigo-500'
                        : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">#{el.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                          {el.role}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          el.priority === 1
                            ? 'bg-rose-500/20 text-rose-300'
                            : el.priority === 2
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        Priority {el.priority}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {el.type === 'text' && `Text: "${el.content}"`}
                      {el.type === 'image' && `Image: ${el.alt} (AR ${el.aspectRatio})`}
                      {el.type === 'button' && `Button: "${el.label}"`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Overview Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl text-xs space-y-3">
              <h3 className="font-bold text-white text-sm">Resolution Flow</h3>
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-indigo-300 border border-slate-800 space-y-1">
                <div>AdSpec + SurfaceProfile</div>
                <div className="text-slate-500">  ↓ Safe area & hard constraints</div>
                <div>Aspect-Ratio Topology Pass</div>
                <div className="text-slate-500">  ↓ Elastic sizing & placement</div>
                <div>Collision & Overflow Detection</div>
                <div className="text-slate-500">  ↓ Priority degradation (P3 → P2)</div>
                <div className="text-emerald-400">ResolvedLayout (Zero Overlaps)</div>
              </div>

              <p className="text-slate-400 leading-relaxed text-[11px]">
                Try selecting <strong>Cramped Banner</strong> or using the <strong>Interactive Squeeze slider</strong> to reduce height below 180px: watch the branding logo drop cleanly first while the CTA and headline adjust seamlessly!
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Bonus 5th Unknown Surface Modal */}
      <CustomSurfaceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveSurface={handleSaveCustomSurface}
      />
    </div>
  );
};

export default App;
