import React from 'react';
import { ResolvedAdLayout } from './resolver';
import { AdContent } from './spec';
import { SurfaceScreen } from './surfaces';

interface RenderDOMProps {
  layout: ResolvedAdLayout;
  content: AdContent;
  screen: SurfaceScreen;
  scale?: number;
}

export const RenderDOM: React.FC<RenderDOMProps> = ({
  layout,
  content,
  screen,
  scale = screen.previewScale,
}) => {
  const scaledWidth = Math.round(screen.width * scale);
  const scaledHeight = Math.round(screen.height * scale);

  return (
    <div className="flex flex-col items-center select-none">
      {/* The Rendered Ad Surface */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 border border-slate-800/80"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          backgroundColor: content.primaryColor || '#0f172a',
        }}
      >
        {/* Brand Name */}
        {layout.brand.isVisible && (
          <div
            className="absolute font-semibold tracking-wide text-white/90 truncate flex items-center"
            style={{
              left: `${layout.brand.x * scale}px`,
              top: `${layout.brand.y * scale}px`,
              width: layout.brand.width ? `${layout.brand.width * scale}px` : 'auto',
              fontSize: `${(layout.brand.fontSize || 14) * scale}px`,
              zIndex: 10,
            }}
          >
            {content.brandName}
          </div>
        )}

        {/* Headline */}
        {layout.headline.isVisible && (
          <div
            className="absolute font-extrabold tracking-tight text-white leading-tight overflow-hidden text-ellipsis line-clamp-3"
            style={{
              left: `${layout.headline.x * scale}px`,
              top: `${layout.headline.y * scale}px`,
              width: `${layout.headline.width * scale}px`,
              fontSize: `${(layout.headline.fontSize || 24) * scale}px`,
              lineHeight: 1.15,
              zIndex: 10,
            }}
          >
            {content.headline}
          </div>
        )}

        {/* Description */}
        {layout.description.isVisible && (
          <div
            className="absolute text-slate-300 font-normal leading-relaxed overflow-hidden text-ellipsis line-clamp-4"
            style={{
              left: `${layout.description.x * scale}px`,
              top: `${layout.description.y * scale}px`,
              width: `${layout.description.width * scale}px`,
              fontSize: `${(layout.description.fontSize || 12) * scale}px`,
              lineHeight: 1.35,
              zIndex: 10,
            }}
          >
            {content.description}
          </div>
        )}

        {/* Hero Image */}
        {layout.hero.isVisible && (
          <div
            className="absolute overflow-hidden rounded-xl bg-slate-800/50 shadow-inner"
            style={{
              left: `${layout.hero.x * scale}px`,
              top: `${layout.hero.y * scale}px`,
              width: `${layout.hero.width * scale}px`,
              height: `${layout.hero.height * scale}px`,
              zIndex: 5,
            }}
          >
            <img
              src={content.heroImageUrl}
              alt="Hero"
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                objectPosition: `${(content.focalPointX || 0.5) * 100}% ${(content.focalPointY || 0.5) * 100}%`,
              }}
            />
          </div>
        )}

        {/* CTA Button */}
        {layout.cta.isVisible && (
          <div
            className="absolute flex items-center justify-center font-bold text-white shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer text-center px-2"
            style={{
              left: `${layout.cta.x * scale}px`,
              top: `${layout.cta.y * scale}px`,
              width: `${layout.cta.width * scale}px`,
              height: `${layout.cta.height * scale}px`,
              fontSize: `${(layout.cta.fontSize || 14) * scale}px`,
              backgroundColor: content.secondaryColor || '#e94560',
              borderRadius: `${Math.max(6, Math.round(layout.cta.height * scale * 0.22))}px`,
              zIndex: 20,
            }}
          >
            <span className="truncate">{content.ctaText}</span>
          </div>
        )}
      </div>

      {/* Screen Info & Metrics Below Card (exactly like screenshot) */}
      <div className="mt-3.5 text-center font-mono w-full" style={{ maxWidth: `${Math.max(280, scaledWidth)}px` }}>
        <div className="text-slate-400 text-xs">
          {screen.name} ({screen.width}×{screen.height}) — {screen.width}×{screen.height} ({Math.round(scale * 100)}%)
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
          <div>
            <span>TEMPLATE</span>{' '}
            <strong className="text-slate-300 font-semibold lowercase">{layout.template}</strong>
          </div>
          <div>
            <span>SCORE</span>{' '}
            <strong className="text-slate-300 font-semibold">{screen.score.toFixed(3)}</strong>
          </div>
          <div>
            <span>CANDIDATES</span>{' '}
            <strong className="text-slate-300 font-semibold">{screen.candidatesCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
