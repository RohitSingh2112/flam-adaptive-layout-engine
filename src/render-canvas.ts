/**
 * Alternative Canvas Renderer
 *
 * Demonstrates architectural decoupling: the Constraint Resolution Engine produces
 * a pure numerical layout description that can be rendered to HTML5 Canvas just as
 * easily as React DOM, with zero changes to the solver.
 */

import { ResolvedLayout } from './resolver';
import { TextAdElement, ButtonAdElement } from './spec';

export function renderToCanvas(
  canvas: HTMLCanvasElement,
  layout: ResolvedLayout,
  scale: number = 1.0,
  showDebug: boolean = false
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { viewport, elements } = layout;

  // Set canvas backing store dimensions
  canvas.width = viewport.width * scale;
  canvas.height = viewport.height * scale;

  // Background Fill
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#090d16');
  gradient.addColorStop(1, '#111827');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Safe Area Outline
  if (showDebug) {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      viewport.safeArea.left * scale,
      viewport.safeArea.top * scale,
      viewport.availableWidth * scale,
      viewport.availableHeight * scale
    );
    ctx.setLineDash([]);
  }

  // Render elements
  for (const item of elements) {
    if (!item.isVisible) continue;

    const { element, rect, computedStyles } = item;
    const x = rect.x * scale;
    const y = rect.y * scale;
    const w = rect.width * scale;
    const h = rect.height * scale;

    if (element.type === 'text') {
      const textElem = element as TextAdElement;
      ctx.fillStyle = element.role === 'secondary' ? '#34d399' : '#f8fafc';
      const fontSize = (computedStyles.fontSize || 16) * scale;
      ctx.font = `${textElem.fontWeight || 'bold'} ${fontSize}px Inter, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(textElem.content, x, y, w);
    } else if (element.type === 'button') {
      const btnElem = element as ButtonAdElement;
      // Button Background
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      const r = (computedStyles.borderRadius || 8) * scale;
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();

      // Button Label
      ctx.fillStyle = '#ffffff';
      const fontSize = (computedStyles.fontSize || 16) * scale;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btnElem.label, x + w / 2, y + h / 2, w - 16);
      ctx.textAlign = 'start';
    } else if (element.type === 'image') {
      // Draw placeholder or image bounding box
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `12px monospace`;
      ctx.fillText(`[Image: ${element.id}]`, x + 6, y + 16);
    }

    if (showDebug) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  }
}
