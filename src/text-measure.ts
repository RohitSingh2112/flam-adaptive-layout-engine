/**
 * Text Measurement Engine
 *
 * Provides accurate text dimension calculations using HTML5 Canvas measureText
 * when in browser environments, with an intelligent typography heuristic fallback
 * for headless / Node test environments.
 */

interface TextMetricsResult {
  width: number;
  height: number;
  lines: string[];
}

let cachedCanvasCtx: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (cachedCanvasCtx) return cachedCanvasCtx;
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    try {
      const canvas = document.createElement('canvas');
      cachedCanvasCtx = canvas.getContext('2d');
    } catch {
      // Fallback
    }
  }
  return cachedCanvasCtx;
}

/**
 * Calculates wrapped line count and exact bounding box for given text, font size, and max width.
 */
export function measureWrappedText(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontWeight: string = 'normal',
  fontFamily: string = 'Inter, system-ui, sans-serif',
  lineHeightRatio: number = 1.25
): TextMetricsResult {
  const ctx = getCanvasContext();
  const lineHeight = Math.round(fontSize * lineHeightRatio);
  const words = text.split(' ');

  if (!ctx) {
    // Headless / SSR heuristic estimation
    // Average proportional character width in sans-serif is approx ~0.55 * fontSize
    const avgCharWidth = fontSize * 0.54;
    const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const calculatedWidth = Math.min(maxWidth, Math.max(...lines.map(l => l.length * avgCharWidth)));
    return {
      width: Math.round(calculatedWidth),
      height: lines.length * lineHeight,
      lines,
    };
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const lines: string[] = [];
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      const measured = ctx.measureText(currentLine);
      if (measured.width > maxLineWidth) maxLineWidth = measured.width;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const measured = ctx.measureText(currentLine);
    if (measured.width > maxLineWidth) maxLineWidth = measured.width;
  }

  return {
    width: Math.min(maxWidth, Math.ceil(maxLineWidth)),
    height: Math.max(lineHeight, lines.length * lineHeight),
    lines,
  };
}
