import React from 'react';
import { ResolvedLayout } from './resolver';

interface RenderDOMProps {
  layout: ResolvedLayout;
  scale?: number;
  showDebug?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export const RenderDOM: React.FC<RenderDOMProps> = ({
  layout,
  scale = 1.0,
  showDebug = false,
  primaryColor = '#000000',
  accentColor = '#2563eb',
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 select-none border border-white/15"
      style={{
        width: `${layout.width * scale}px`,
        height: `${layout.height * scale}px`,
        backgroundColor: primaryColor,
        backgroundImage: `
          radial-gradient(ellipse at 80% 20%, ${accentColor}30, transparent 55%),
          radial-gradient(ellipse at 20% 85%, rgba(255, 255, 255, 0.04), transparent 45%)
        `,
      }}
    >
      {/* Optional Safe Area outline */}
      {showDebug && (
        <div
          className="absolute border border-dashed border-blue-400/50 pointer-events-none z-30"
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
            showDebug ? 'outline outline-1 outline-blue-400/60 bg-blue-500/10' : ''
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
            <span className="absolute -top-3.5 left-0 text-[9px] font-mono text-blue-300 bg-black px-1 py-0.5 rounded border border-blue-500/50 pointer-events-none">
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
              className="w-full h-full object-contain rounded-xl drop-shadow-[0_12px_24px_rgba(37,99,235,0.25)]"
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
              className="font-semibold text-blue-400 font-mono tracking-tight"
              style={{ fontSize: `${(fontSize || 14) * scale}px` }}
            >
              {element.content}
            </div>
          )}

          {/* CTA Button */}
          {element.role === 'cta' && (
            <button
              type="button"
              className="w-full h-full rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform hover:opacity-95 active:scale-95"
              style={{
                fontSize: `${(fontSize || 15) * scale}px`,
                backgroundColor: accentColor,
                boxShadow: `0 4px 20px -2px ${accentColor}80`,
              }}
            >
              <span>{element.content}</span>
              <span className="text-white/80">→</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
