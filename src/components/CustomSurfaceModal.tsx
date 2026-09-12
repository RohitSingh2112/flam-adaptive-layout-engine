import React, { useState } from 'react';
import { SurfaceProfile, validateSurface } from '../surfaces';
import { X, Sparkles, Check } from 'lucide-react';

interface CustomSurfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSurface: (surface: SurfaceProfile) => void;
}

export const CustomSurfaceModal: React.FC<CustomSurfaceModalProps> = ({
  isOpen,
  onClose,
  onSaveSurface,
}) => {
  const [name, setName] = useState('Experimental Smartwatch / Car Dash');
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(320);
  const [safeTop, setSafeTop] = useState(20);
  const [safeBottom, setSafeBottom] = useState(20);
  const [safeLeft, setSafeLeft] = useState(24);
  const [safeRight, setSafeRight] = useState(24);
  const [minTapTarget, setMinTapTarget] = useState(44);
  const [minTextSize, setMinTextSize] = useState(14);
  const [viewingDistance, setViewingDistance] = useState<'near' | 'arm' | 'far'>('arm');
  const [touchOnly, setTouchOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newProfile: SurfaceProfile = {
      id: `custom-${Date.now()}`,
      name: name || 'Custom Surface',
      description: `Unknown-at-design-time surface (${width}×${height}px) resolved live.`,
      category: 'custom',
      width: Number(width),
      height: Number(height),
      safeArea: {
        top: Number(safeTop),
        right: Number(safeRight),
        bottom: Number(safeBottom),
        left: Number(safeLeft),
      },
      minTapTarget: Number(minTapTarget),
      minTextSize: Number(minTextSize),
      viewingDistance,
      touchOnly,
      deviceFrame: 'custom',
    };

    try {
      validateSurface(newProfile);
      onSaveSurface(newProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid surface configuration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create Custom Unknown Surface</h2>
            <p className="text-xs text-slate-400">
              Test the engine against completely arbitrary dimensions & constraints.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Surface Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Width (px)</label>
              <input
                type="number"
                min="180"
                max="3840"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Height (px)</label>
              <input
                type="number"
                min="100"
                max="2160"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <span className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Safe Area Insets (px)
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Top</span>
                <input
                  type="number"
                  value={safeTop}
                  onChange={e => setSafeTop(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Right</span>
                <input
                  type="number"
                  value={safeRight}
                  onChange={e => setSafeRight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Bottom</span>
                <input
                  type="number"
                  value={safeBottom}
                  onChange={e => setSafeBottom(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Left</span>
                <input
                  type="number"
                  value={safeLeft}
                  onChange={e => setSafeLeft(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Min Tap Target (px)</label>
              <input
                type="number"
                min="24"
                max="96"
                value={minTapTarget}
                onChange={e => setMinTapTarget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Min Text Size (px)</label>
              <input
                type="number"
                min="10"
                max="48"
                value={minTextSize}
                onChange={e => setMinTextSize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Viewing Distance</label>
              <select
                value={viewingDistance}
                onChange={e => setViewingDistance(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="near">Near (Handheld Mobile)</option>
                <option value="arm">Arm's Length (Desktop / Kiosk)</option>
                <option value="far">Far (TV / Billboard)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={touchOnly}
                  onChange={e => setTouchOnly(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-slate-300">Touch-Only Surface</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <Check className="w-4 h-4" />
              <span>Resolve Custom Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
