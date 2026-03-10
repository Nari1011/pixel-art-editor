import { useState, useEffect } from 'react';
import { usePixelEditor } from './hooks/usePixelEditor';
import PixelCanvas from './components/PixelCanvas';
import Toolbar from './components/Toolbar';
import MobileToolbar from './components/MobileToolbar';
import { exportToPng } from './utils/canvas';

const SIZE_OPTIONS = [
  { label: '16×16', cols: 16, rows: 16 },
  { label: '32×32', cols: 32, rows: 32 },
  { label: '64×64', cols: 64, rows: 64 },
];

function useViewport() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const isMobile = width < 640;
  const canvasPx = isMobile ? Math.min(512, width - 16) : 512;
  return { isMobile, canvasPx };
}

export default function App() {
  const [sizeIdx, setSizeIdx] = useState(1);
  const editor = usePixelEditor({ cols: SIZE_OPTIONS[sizeIdx].cols, rows: SIZE_OPTIONS[sizeIdx].rows });
  const { isMobile, canvasPx } = useViewport();

  const handleResize = (idx: number) => {
    setSizeIdx(idx);
    editor.resizeCanvas({ cols: SIZE_OPTIONS[idx].cols, rows: SIZE_OPTIONS[idx].rows });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); editor.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); editor.redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor.undo, editor.redo]);

  const handleExport = () => {
    const cols = SIZE_OPTIONS[sizeIdx].cols;
    exportToPng(editor.pixels, Math.floor(512 / cols), 'pixel-art.png');
  };

  const canvas = (
    <PixelCanvas
      pixels={editor.pixels}
      showGrid={editor.showGrid}
      tool={editor.tool}
      canvasPx={canvasPx}
      onStart={editor.startDraw}
      onMove={editor.moveDraw}
      onEnd={editor.endDraw}
    />
  );

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a1a',
        color: '#eee',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 80,
      }}>
        <header style={{ marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, letterSpacing: 2, color: '#4a9eff' }}>
            PIXEL ART EDITOR
          </h1>
        </header>
        {canvas}
        <MobileToolbar
          tool={editor.tool}
          color={editor.color}
          showGrid={editor.showGrid}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          canvasSize={SIZE_OPTIONS}
          canvasSizeIdx={sizeIdx}
          onToolChange={editor.setTool}
          onColorChange={editor.setColor}
          onGridToggle={() => editor.setShowGrid(!editor.showGrid)}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onClear={editor.clearCanvas}
          onExport={handleExport}
          onResize={handleResize}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#eee',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
    }}>
      <header style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 2, color: '#4a9eff' }}>
          PIXEL ART EDITOR
        </h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          {SIZE_OPTIONS.map((s, i) => (
            <button key={s.label} onClick={() => handleResize(i)}
              style={{
                padding: '4px 14px',
                border: '1px solid #555', borderRadius: 4,
                background: sizeIdx === i ? '#4a9eff' : '#2a2a2a',
                color: sizeIdx === i ? '#000' : '#eee',
                cursor: 'pointer', fontSize: 13,
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <Toolbar
          tool={editor.tool}
          color={editor.color}
          showGrid={editor.showGrid}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onToolChange={editor.setTool}
          onColorChange={editor.setColor}
          onGridToggle={() => editor.setShowGrid(!editor.showGrid)}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onClear={editor.clearCanvas}
          onExport={handleExport}
        />
        {canvas}
      </div>

      <footer style={{ marginTop: 20, color: '#555', fontSize: 12 }}>
        Ctrl+Z で元に戻す / Ctrl+Y でやり直し
      </footer>
    </div>
  );
}
