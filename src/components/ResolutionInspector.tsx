import React from 'react';
import { ResolvedLayout } from '../resolver';
import { SurfaceProfile } from '../surfaces';
import { CheckCircle, AlertOctagon, Layers, Clock, ShieldCheck, Zap } from 'lucide-react';

interface ResolutionInspectorProps {
  layout: ResolvedLayout;
  surface: SurfaceProfile;
}

export const ResolutionInspector: React.FC<ResolutionInspectorProps> = ({ layout, surface }) => {
  const { diagnostics, elements, viewport } = layout;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl text-slate-200">
      {/* Header Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Solver Diagnostics & Engine State</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Topology: <span className="text-indigo-300 font-mono font-semibold uppercase">{diagnostics.aspectRatioClass}</span> (AR: {diagnostics.aspectRatio.toFixed(2)})
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{diagnostics.executionTimeMs}ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-indigo-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Passes: {diagnostics.passesCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Placed: {diagnostics.placedCount}/{diagnostics.totalElements}</span>
          </div>
        </div>
      </div>

      {/* Surface Constraints Verification Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-4">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
          <div className="text-[11px] text-slate-400">Viewing Distance</div>
          <div className="font-semibold text-xs text-white capitalize mt-0.5">
            {surface.viewingDistance} {surface.viewingDistance === 'far' ? '(TV / 10ft)' : '(Handheld)'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
          <div className="text-[11px] text-slate-400">Min Tap Target</div>
          <div className="font-semibold text-xs text-white mt-0.5">
            {surface.minTapTarget}px <span className="text-emerald-400 text-[10px]">✓ Enforced</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
          <div className="text-[11px] text-slate-400">Min Text Size</div>
          <div className="font-semibold text-xs text-white mt-0.5">
            {surface.minTextSize}px <span className="text-emerald-400 text-[10px]">✓ Legible</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
          <div className="text-[11px] text-slate-400">Safe Area (L/R/T/B)</div>
          <div className="font-mono text-xs text-indigo-300 mt-0.5">
            {viewport.safeArea.left}/{viewport.safeArea.right}/{viewport.safeArea.top}/{viewport.safeArea.bottom}
          </div>
        </div>
      </div>

      {/* Element Status Table */}
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Element Placement & Degradation Tracking</span>
          <span className="text-[11px] text-slate-500 font-mono">P1 = Critical • P3 = Supplemental</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-2 px-3">Element ID</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Bounding Box (X, Y, W, H)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {elements.map(item => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    item.isVisible ? '' : 'bg-rose-950/20 text-slate-400'
                  }`}
                >
                  <td className="py-2 px-3 font-mono font-medium text-white">#{item.id}</td>
                  <td className="py-2 px-3 capitalize text-slate-300">{item.element.role}</td>
                  <td className="py-2 px-3 font-mono">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.element.priority === 1
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.element.priority === 2
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      P{item.element.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {item.isVisible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Placed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <AlertOctagon className="w-3.5 h-3.5" /> Dropped
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                    {item.isVisible ? (
                      <span>
                        ({item.rect.x}, {item.rect.y}) — {item.rect.width}×{item.rect.height}px
                      </span>
                    ) : (
                      <span className="text-rose-300/80 italic">{item.degradationReason}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solver Log Drawer */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <details className="group">
          <summary className="cursor-pointer text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center justify-between">
            <span>View Solver Step-by-Step Resolution Trace ({diagnostics.logs.length} events)</span>
            <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-2.5 p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 space-y-1 max-h-48 overflow-y-auto border border-slate-800">
            {diagnostics.logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('Degradation')
                    ? 'text-amber-400'
                    : log.includes('Successfully')
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};
