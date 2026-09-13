import React, { useEffect, useRef } from 'react';
import { ResolvedLayout } from './resolver';

interface RenderCanvasProps {
  layout: ResolvedLayout;
  scale?: number;
  showDebug?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export const RenderCanvas: React.FC<RenderCanvasProps> = ({
  layout,
  scale = 1.0,
  showDebug = false,
  primaryColor = '#000000',
  accentColor = '#2563eb',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderW = Math.round(layout.width * scale);
    const renderH = Math.round(layout.height * scale);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = renderW * dpr;
    canvas.height = renderH * dpr;
    canvas.style.width = `${renderW}px`;
    canvas.style.height = `${renderH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw Background
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, renderW, renderH);

    // Subtle Radial Glow
    const gradient = ctx.createRadialGradient(
      renderW * 0.8,
      renderH * 0.2,
      10,
      renderW * 0.8,
      renderH * 0.2,
      renderW * 0.6
    );
    gradient.addColorStop(0, `${accentColor}35`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, renderW, renderH);

    // 2. Optional Safe Area Wireframe
    if (showDebug) {
      ctx.save();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        layout.safeArea.left * scale,
        layout.safeArea.top * scale,
        (layout.width - layout.safeArea.left - layout.safeArea.right) * scale,
        (layout.height - layout.safeArea.top - layout.safeArea.bottom) * scale
      );
      ctx.restore();
    }

    // 3. Render Placed Elements
    layout.placedElements.forEach(({ id, element, rect, fontSize }) => {
      const rx = rect.x * scale;
      const ry = rect.y * scale;
      const rw = rect.width * scale;
      const rh = rect.height * scale;

      // Debug bounding box
      if (showDebug) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.fillRect(rx, ry, rw, rh);

        ctx.fillStyle = '#93c5fd';
        ctx.font = '10px monospace';
        ctx.fillText(`#${id} (P${element.priority})`, rx, Math.max(10, ry - 3));
        ctx.restore();
      }

      // Headline Text
      if (element.role === 'headline') {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        const fSize = Math.round((fontSize || 18) * scale);
        ctx.font = `800 ${fSize}px sans-serif`;
        ctx.textBaseline = 'top';

        // Multi-line wrap
        const words = (element.content || '').split(' ');
        let line = '';
        let lineY = ry;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > rw && n > 0) {
            ctx.fillText(line, rx, lineY);
            line = words[n] + ' ';
            lineY += fSize * 1.25;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, rx, lineY);
        ctx.restore();
      }

      // Description Text
      if (element.role === 'description') {
        ctx.save();
        ctx.fillStyle = '#d4d4d8';
        const fSize = Math.round((fontSize || 13) * scale);
        ctx.font = `400 ${fSize}px sans-serif`;
        ctx.textBaseline = 'top';

        const words = (element.content || '').split(' ');
        let line = '';
        let lineY = ry;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > rw && n > 0) {
            ctx.fillText(line, rx, lineY);
            line = words[n] + ' ';
            lineY += fSize * 1.35;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, rx, lineY);
        ctx.restore();
      }

      // Price Text
      if (element.role === 'price') {
        ctx.save();
        ctx.fillStyle = '#60a5fa';
        const fSize = Math.round((fontSize || 14) * scale);
        ctx.font = `600 ${fSize}px monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content || '', rx, ry + rh / 2);
        ctx.restore();
      }

      // CTA Button
      if (element.role === 'cta') {
        ctx.save();
        ctx.fillStyle = accentColor;
        ctx.shadowColor = `${accentColor}80`;
        ctx.shadowBlur = 12;

        // Rounded Rect
        const radius = Math.min(10, rh / 2);
        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + rw - radius, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
        ctx.lineTo(rx + rw, ry + rh - radius);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
        ctx.lineTo(rx + radius, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
        ctx.lineTo(rx, ry + radius);
        ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        const fSize = Math.round((fontSize || 15) * scale);
        ctx.font = `700 ${fSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${element.content || 'Get Started'} →`, rx + rw / 2, ry + rh / 2);
        ctx.restore();
      }

      // Images (Hero & Logo)
      if ((element.role === 'hero' || element.role === 'logo') && element.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        if (img.complete) {
          ctx.drawImage(img, rx, ry, rw, rh);
        } else {
          img.onload = () => {
            ctx.drawImage(img, rx, ry, rw, rh);
          };
        }
      }
    });

    ctx.restore();
  }, [layout, scale, showDebug, primaryColor, accentColor]);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 select-none border border-white/15">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
