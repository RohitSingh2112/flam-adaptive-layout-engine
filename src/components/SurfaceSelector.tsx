import React from 'react';
import { SurfaceProfile } from '../surfaces';
import { Smartphone, Monitor, Tv, Tablet, Sparkles, AlertTriangle } from 'lucide-react';

interface SurfaceSelectorProps {
  surfaces: Record<string, SurfaceProfile>;
  activeSurfaceId: string;
  onSelectSurface: (id: string) => void;
  onOpenCustomModal: () => void;
}

export const SurfaceSelector: React.FC<SurfaceSelectorProps> = ({
  surfaces,
  activeSurfaceId,
  onSelectSurface,
  onOpenCustomModal,
}) => {
  const getIcon = (surface: SurfaceProfile) => {
    switch (surface.deviceFrame) {
      case 'iphone':
        return <Smartphone className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'kiosk':
        return <Monitor className="w-4 h-4" />;
      case 'banner':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Tablet className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.values(surfaces).map(surface => {
        const isActive = surface.id === activeSurfaceId;
        const isCramped = surface.id === 'crampedBanner';

        return (
          <button
            key={surface.id}
            type="button"
            onClick={() => onSelectSurface(surface.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : isCramped
                ? 'bg-amber-950/30 text-amber-300 border-amber-800/40 hover:bg-amber-900/40'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-slate-400'}>
              {getIcon(surface)}
            </span>
            <div className="text-left">
              <div className="font-semibold">{surface.name}</div>
              <div className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                {surface.width}×{surface.height} • AR {(surface.width / surface.height).toFixed(2)}
              </div>
            </div>
          </button>
        );
      })}

      {/* Bonus 5th Unknown Surface Creator */}
      <button
        type="button"
        onClick={onOpenCustomModal}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-600/30 transition-all duration-200 shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>+ Custom Unknown Surface</span>
      </button>
    </div>
  );
};
