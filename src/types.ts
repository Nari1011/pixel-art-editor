export type Tool = 'pen' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rect' | 'circle';

export interface CanvasSize {
  cols: number;
  rows: number;
}

export interface HistoryEntry {
  pixels: string[][];
}
