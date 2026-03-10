function setPixel(pixels: string[][], x: number, y: number, color: string) {
  if (y >= 0 && y < pixels.length && x >= 0 && x < pixels[0].length) {
    pixels[y][x] = color;
  }
}

export function drawLine(
  pixels: string[][],
  x0: number, y0: number,
  x1: number, y1: number,
  color: string
): string[][] {
  const out = pixels.map(r => [...r]);
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0, y = y0;
  while (true) {
    setPixel(out, x, y, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return out;
}

export function drawRect(
  pixels: string[][],
  x0: number, y0: number,
  x1: number, y1: number,
  color: string
): string[][] {
  const out = pixels.map(r => [...r]);
  const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
  for (let x = minX; x <= maxX; x++) {
    setPixel(out, x, minY, color);
    setPixel(out, x, maxY, color);
  }
  for (let y = minY + 1; y < maxY; y++) {
    setPixel(out, minX, y, color);
    setPixel(out, maxX, y, color);
  }
  return out;
}

export function drawCircle(
  pixels: string[][],
  cx: number, cy: number,
  rx: number, ry: number,
  color: string
): string[][] {
  const out = pixels.map(r => [...r]);
  const r = Math.round(Math.sqrt(rx * rx + ry * ry));
  if (r === 0) { setPixel(out, cx, cy, color); return out; }
  let x = 0, y = r, d = 1 - r;
  const plot8 = (px: number, py: number) => {
    setPixel(out, cx + px, cy + py, color);
    setPixel(out, cx - px, cy + py, color);
    setPixel(out, cx + px, cy - py, color);
    setPixel(out, cx - px, cy - py, color);
    setPixel(out, cx + py, cy + px, color);
    setPixel(out, cx - py, cy + px, color);
    setPixel(out, cx + py, cy - px, color);
    setPixel(out, cx - py, cy - px, color);
  };
  plot8(x, y);
  while (x < y) {
    if (d < 0) { d += 2 * x + 3; }
    else { d += 2 * (x - y) + 5; y--; }
    x++;
    plot8(x, y);
  }
  return out;
}
