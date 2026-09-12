import React from 'react';
import { ResolvedLayout } from './resolver';

interface RenderDOMProps {
  layout: ResolvedLayout;
  scale?: number;
  showDebug?: boolean;
}

export const RenderDOM: React.FC<RenderDOMProps> = ({
  layout,
  scale = 1.0,
  showDebug = false,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 select-none border border-slate-800"
      style={{
        width: `${layout.width * scale}px`,
        height: `${layout.height * scale}px`,
        backgroundColor: '#0c101c',
        backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.18), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.12), transparent 50%)',
      }}
    >
      {/* Optional Safe Area outline */}
      {showDebug && (
        <div
          className="absolute border border-dashed border-emerald-500/50 pointer-events-none z-30"
          style={{
            left: `${layout.safeArea.left * scale}px`,
            top: `${layout.safeArea.top * scale}px`,
            width: `${(layout.width - layout.safeArea.left - layout.safeArea.right) * scale}px`,
            height: `${(layout.height - layout.safeArea.top - layout.safeArea.bottom) * scale}px`,
          }}
        />
      )}

      {/* Render Placed Elements */}
      {layout.placedElements.map(({ id, element, rect, fontSize }) => (
        <div
          key={id}
          className={`absolute transition-all duration-300 ease-out flex items-center ${
            showDebug ? 'outline outline-1 outline-indigo-500/60 bg-indigo-500/5' : ''
          }`}
          style={{
            left: `${rect.x * scale}px`,
            top: `${rect.y * scale}px`,
            width: `${rect.width * scale}px`,
            height: `${rect.height * scale}px`,
            zIndex: element.role === 'cta' ? 20 : 10,
          }}
        >
          {/* Debug Tag */}
          {showDebug && (
            <span className="absolute -top-3.5 left-0 text-[9px] font-mono text-indigo-300 bg-indigo-950 px-1 py-0.5 rounded border border-indigo-700/50 pointer-events-none">
              #{id} (P{element.priority})
            </span>
          )}

          {/* Logo / Brand Image */}
          {element.role === 'logo' && element.src && (
            <img
              src={element.src}
              alt="Logo"
              className="h-full w-auto object-contain rounded-md"
            />
          )}

          {/* Hero Product Image */}
          {element.role === 'hero' && element.src && (
            <img
              src={element.src}
              alt="Product"
              className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
            />
          )}

          {/* Headline Text */}
          {element.role === 'headline' && (
            <h2
              className="font-extrabold tracking-tight text-white leading-tight"
              style={{ fontSize: `${(fontSize || 18) * scale}px` }}
            >
              {element.content}
            </h2>
          )}

          {/* Price Text */}
          {element.role === 'price' && (
            <div
              className="font-semibold text-emerald-400 font-mono tracking-tight"
              style={{ fontSize: `${(fontSize || 14) * scale}px` }}
            >
              {element.content}
            </div>
          )}

          {/* CTA Button */}
          {element.role === 'cta' && (
            <button
              type="button"
              className="w-full h-full rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
              style={{ fontSize: `${(fontSize || 15) * scale}px` }}
            >
              <span>{element.content}</span>
              <span className="text-indigo-200">→</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
