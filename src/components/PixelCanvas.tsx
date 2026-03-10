import { useRef, useCallback } from 'react';
import type { Tool } from '../types';

interface Props {
  pixels: string[][];
  showGrid: boolean;
  tool: Tool;
  canvasPx?: number;
  onStart: (col: number, row: number) => void;
  onMove: (col: number, row: number) => void;
  onEnd: () => void;
}

export default function PixelCanvas({ pixels, showGrid, tool, canvasPx = 512, onStart, onMove, onEnd }: Props) {
  const rows = pixels.length;
  const cols = pixels[0]?.length ?? 0;
  const cellSize = Math.floor(canvasPx / cols);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCell = useCallback(
    (e: React.MouseEvent | React.TouchEvent): [number, number] | null => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const col = Math.floor((clientX - rect.left) / cellSize);
      const row = Math.floor((clientY - rect.top) / cellSize);
      if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
      return [col, row];
    },
    [cols, rows, cellSize]
  );

  const cursor =
    tool === 'eraser' ? 'cell' :
    tool === 'eyedropper' ? 'crosshair' :
    tool === 'fill' ? 'copy' : 'crosshair';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        border: '1px solid #555',
        cursor,
        userSelect: 'none',
        touchAction: 'none',
        backgroundImage:
          'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
      }}
      onMouseDown={(e) => { const c = getCell(e); if (c) onStart(c[0], c[1]); }}
      onMouseMove={(e) => { const c = getCell(e); if (c) onMove(c[0], c[1]); }}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => { e.preventDefault(); const c = getCell(e); if (c) onStart(c[0], c[1]); }}
      onTouchMove={(e) => { e.preventDefault(); const c = getCell(e); if (c) onMove(c[0], c[1]); }}
      onTouchEnd={onEnd}
    >
      {pixels.flatMap((row, r) =>
        row.map((color, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: color === 'transparent' ? undefined : color,
              boxSizing: 'border-box',
              border: showGrid ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}
