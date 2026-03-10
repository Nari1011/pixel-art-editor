export function createGrid(cols: number, rows: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill('transparent'));
}

export function floodFill(
  pixels: string[][],
  col: number,
  row: number,
  fillColor: string
): string[][] {
  const rows = pixels.length;
  const cols = pixels[0].length;
  const targetColor = pixels[row][col];

  if (targetColor === fillColor) return pixels;

  const next = pixels.map((r) => [...r]);
  const stack: [number, number][] = [[col, row]];

  while (stack.length > 0) {
    const [c, r] = stack.pop()!;
    if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
    if (next[r][c] !== targetColor) continue;
    next[r][c] = fillColor;
    stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
  }

  return next;
}

export function exportToPng(
  pixels: string[][],
  pixelSize: number,
  filename: string
): void {
  const rows = pixels.length;
  const cols = pixels[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = cols * pixelSize;
  canvas.height = rows * pixelSize;
  const ctx = canvas.getContext('2d')!;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = pixels[r][c];
      if (color === 'transparent') {
        ctx.clearRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
}
