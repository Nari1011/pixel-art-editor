import { useState, useCallback, useRef } from 'react';
import type { Tool, CanvasSize } from '../types';
import { createGrid, floodFill } from '../utils/canvas';
import { drawLine, drawRect, drawCircle } from '../utils/shapes';

const MAX_HISTORY = 50;
const SHAPE_TOOLS: Tool[] = ['line', 'rect', 'circle'];

export function usePixelEditor(initialSize: CanvasSize) {
  const [pixels, setPixels] = useState<string[][]>(() =>
    createGrid(initialSize.cols, initialSize.rows)
  );
  const [previewPixels, setPreviewPixels] = useState<string[][] | null>(null);
  const [history, setHistory] = useState<string[][][]>([]);
  const [redoStack, setRedoStack] = useState<string[][][]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSizeState] = useState<CanvasSize>(initialSize);
  const isDrawing = useRef(false);
  const lastCell = useRef<[number, number] | null>(null);
  const shapeStart = useRef<[number, number] | null>(null);
  const committedPixels = useRef<string[][] | null>(null);

  const pushHistory = useCallback((current: string[][]) => {
    setHistory((h) => {
      const next = [...h, current.map((r) => [...r])];
      return next.length > MAX_HISTORY ? next.slice(1) : next;
    });
    setRedoStack([]);
  }, []);

  const paint = useCallback(
    (col: number, row: number, currentPixels: string[][]): string[][] => {
      if (tool === 'fill') {
        return floodFill(currentPixels, col, row, color);
      }
      if (tool === 'eyedropper') {
        setColor(currentPixels[row][col] === 'transparent' ? '#ffffff' : currentPixels[row][col]);
        return currentPixels;
      }
      const next = currentPixels.map((r) => [...r]);
      next[row][col] = tool === 'eraser' ? 'transparent' : color;
      return next;
    },
    [tool, color]
  );

  const applyShape = useCallback(
    (base: string[][], x0: number, y0: number, x1: number, y1: number): string[][] => {
      if (tool === 'line') return drawLine(base, x0, y0, x1, y1, color);
      if (tool === 'rect') return drawRect(base, x0, y0, x1, y1, color);
      if (tool === 'circle') return drawCircle(base, x0, y0, x1 - x0, y1 - y0, color);
      return base;
    },
    [tool, color]
  );

  const startDraw = useCallback(
    (col: number, row: number) => {
      isDrawing.current = true;
      lastCell.current = [col, row];
      if (SHAPE_TOOLS.includes(tool)) {
        shapeStart.current = [col, row];
        committedPixels.current = pixels.map(r => [...r]);
        setPreviewPixels(applyShape(pixels, col, row, col, row));
      } else {
        pushHistory(pixels);
        const next = paint(col, row, pixels);
        setPixels(next);
      }
    },
    [pixels, paint, pushHistory, tool, applyShape]
  );

  const moveDraw = useCallback(
    (col: number, row: number) => {
      if (!isDrawing.current) return;
      if (lastCell.current?.[0] === col && lastCell.current?.[1] === row) return;
      lastCell.current = [col, row];
      if (SHAPE_TOOLS.includes(tool) && shapeStart.current && committedPixels.current) {
        const [x0, y0] = shapeStart.current;
        setPreviewPixels(applyShape(committedPixels.current, x0, y0, col, row));
      } else {
        setPixels((prev) => paint(col, row, prev));
      }
    },
    [paint, tool, applyShape]
  );

  const endDraw = useCallback(() => {
    if (SHAPE_TOOLS.includes(tool) && shapeStart.current && committedPixels.current && lastCell.current) {
      const [x0, y0] = shapeStart.current;
      const [x1, y1] = lastCell.current;
      pushHistory(committedPixels.current);
      setPixels(applyShape(committedPixels.current, x0, y0, x1, y1));
      setPreviewPixels(null);
      shapeStart.current = null;
      committedPixels.current = null;
    }
    isDrawing.current = false;
    lastCell.current = null;
  }, [tool, applyShape, pushHistory]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setRedoStack((r) => [...r, pixels.map((row) => [...row])]);
      setPixels(prev);
      return h.slice(0, -1);
    });
  }, [pixels]);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setHistory((h) => [...h, pixels.map((row) => [...row])]);
      setPixels(next);
      return r.slice(0, -1);
    });
  }, [pixels]);

  const clearCanvas = useCallback(() => {
    pushHistory(pixels);
    setPixels(createGrid(canvasSize.cols, canvasSize.rows));
  }, [pixels, canvasSize, pushHistory]);

  const resizeCanvas = useCallback(
    (size: CanvasSize) => {
      pushHistory(pixels);
      setCanvasSizeState(size);
      setPixels(createGrid(size.cols, size.rows));
    },
    [pixels, pushHistory]
  );

  return {
    pixels: previewPixels ?? pixels,
    tool, setTool,
    color, setColor,
    showGrid, setShowGrid,
    canvasSize,
    startDraw, moveDraw, endDraw,
    undo, redo,
    clearCanvas, resizeCanvas,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
  };
}
