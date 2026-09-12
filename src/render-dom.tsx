import React from 'react';
import { ResolvedLayout, ResolvedElement } from './resolver';
import { TextAdElement, ImageAdElement, ButtonAdElement } from './spec';

interface RenderDOMProps {
  layout: ResolvedLayout;
  showDebugBoxes?: boolean;
  scale?: number;
  className?: string;
  onElementClick?: (element: ResolvedElement) => void;
}

export const RenderDOM: React.FC<RenderDOMProps> = ({
  layout,
  showDebugBoxes = false,
  scale = 1.0,
  className = '',
  onElementClick,
}) => {
  const { viewport, elements } = layout;

  return (
    <div
      className={`relative overflow-hidden select-none transition-all duration-300 ease-out shadow-2xl ${className}`}
      style={{
        width: `${viewport.width * scale}px`,
        height: `${viewport.height * scale}px`,
        backgroundColor: '#090d16',
        backgroundImage: `
          radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15), transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.12), transparent 50%)
        `,
      }}
    >
      {/* Safe Area Guide Overlay (when debug mode is active) */}
      {showDebugBoxes && (
        <div
          className="absolute border border-dashed border-emerald-500/40 pointer-events-none z-40 transition-all duration-300"
          style={{
            left: `${viewport.safeArea.left * scale}px`,
            top: `${viewport.safeArea.top * scale}px`,
            width: `${viewport.availableWidth * scale}px`,
            height: `${viewport.availableHeight * scale}px`,
          }}
        >
          <span className="absolute top-1 left-2 text-[9px] font-mono uppercase tracking-widest text-emerald-400/80 bg-emerald-950/80 px-1 py-0.5 rounded">
            Safe Area ({viewport.availableWidth}×{viewport.availableHeight})
          </span>
        </div>
      )}

      {/* Render Placed & Visible Elements */}
      {elements
        .filter(el => el.isVisible)
        .map(item => {
          const { id, element, rect, computedStyles } = item;

          return (
            <div
              key={id}
              onClick={() => onElementClick?.(item)}
              className={`absolute transition-all duration-300 ease-out cursor-pointer ${
                showDebugBoxes ? 'outline outline-1 outline-indigo-500/60 bg-indigo-500/5' : ''
              }`}
              style={{
                left: `${rect.x * scale}px`,
                top: `${rect.y * scale}px`,
                width: `${rect.width * scale}px`,
                height: `${rect.height * scale}px`,
                zIndex: element.role === 'action' ? 30 : element.role === 'hero' ? 20 : 10,
              }}
            >
              {/* Debug Label Badge */}
              {showDebugBoxes && (
                <div className="absolute -top-3.5 left-0 z-50 bg-indigo-950/90 border border-indigo-500/60 text-indigo-300 text-[9px] font-mono px-1 py-0.2 rounded shadow whitespace-nowrap pointer-events-none">
                  #{id} (P{element.priority}•{element.role}) [{rect.width}×{rect.height}]
                </div>
              )}

              {/* Element Rendering by Type */}
              {element.type === 'image' && (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={(element as ImageAdElement).src}
                    alt={(element as ImageAdElement).alt}
                    className="w-full h-full transition-transform duration-300 hover:scale-105"
                    style={{
                      objectFit: computedStyles.objectFit || 'contain',
                      filter: (element as ImageAdElement).accentGlow
                        ? `drop-shadow(0 10px 25px rgba(99, 102, 241, 0.4))`
                        : 'none',
                    }}
                  />
                  {element.role === 'branding' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                  )}
                </div>
              )}

              {element.type === 'text' && (
                <div
                  className="w-full h-full flex flex-col justify-center font-sans tracking-tight"
                  style={{
                    color: '#f8fafc',
                    fontSize: `${(computedStyles.fontSize || 16) * scale}px`,
                    lineHeight: computedStyles.lineHeight
                      ? `${computedStyles.lineHeight * scale}px`
                      : 1.25,
                    fontWeight:
                      element.role === 'primary' ? 800 : element.role === 'secondary' ? 600 : 500,
                  }}
                >
                  <span
                    className={`block ${
                      element.role === 'primary'
                        ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-sm'
                        : element.role === 'secondary'
                        ? 'text-emerald-400 font-mono tracking-normal'
                        : 'text-slate-300'
                    }`}
                  >
                    {(element as TextAdElement).content}
                  </span>
                </div>
              )}

              {element.type === 'button' && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    const url = (element as ButtonAdElement).actionUrl;
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full h-full font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 transform active:scale-95 shadow-lg group hover:shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white"
                  style={{
                    fontSize: `${(computedStyles.fontSize || 16) * scale}px`,
                    borderRadius: `${(computedStyles.borderRadius || 10) * scale}px`,
                    boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.5)',
                  }}
                >
                  <span>{(element as ButtonAdElement).label}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
};
