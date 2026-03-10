import { useState } from 'react';
import type { Tool } from '../types';
import {
  Pencil, Eraser, PaintBucket, Pipette,
  Minus, Square, Circle, Shapes,
  Undo2, Redo2, MoreHorizontal, Grid3x3, Trash2, Download, X,
} from 'lucide-react';

interface SizeOption { label: string; cols: number; rows: number }

interface Props {
  tool: Tool;
  color: string;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canvasSize: SizeOption[];
  canvasSizeIdx: number;
  onToolChange: (t: Tool) => void;
  onColorChange: (c: string) => void;
  onGridToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onResize: (idx: number) => void;
}

const BASIC_TOOLS: { id: Tool; Icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'pen', Icon: Pencil, label: 'ペン' },
  { id: 'eraser', Icon: Eraser, label: '消しゴム' },
  { id: 'fill', Icon: PaintBucket, label: '塗りつぶし' },
  { id: 'eyedropper', Icon: Pipette, label: 'スポイト' },
];

const SHAPE_TOOLS: { id: Tool; Icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'line', Icon: Minus, label: '直線' },
  { id: 'rect', Icon: Square, label: '矩形' },
  { id: 'circle', Icon: Circle, label: '円' },
];

const PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#ff4444', '#44ff44', '#4444ff', '#888888', '#444444',
  '#ffaaaa', '#aaffaa', '#aaaaff', '#ffaa00', '#00aaff',
];

export default function MobileToolbar(props: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shapesOpen, setShapesOpen] = useState(false);
  const { tool, color, showGrid, canUndo, canRedo, canvasSize, canvasSizeIdx } = props;

  const isShapeTool = SHAPE_TOOLS.some(t => t.id === tool);
  const activeShape = SHAPE_TOOLS.find(t => t.id === tool);
  const ShapeGroupIcon = activeShape ? activeShape.Icon : Shapes;

  const iconBtn = (active = false, disabled = false): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 8,
    border: 'none',
    background: active ? '#4a9eff' : 'transparent',
    color: active ? '#000' : disabled ? '#444' : '#eee',
    cursor: disabled ? 'default' : 'pointer',
    flexShrink: 0,
  });

  const sheetBtn = (danger = false, accent = false): React.CSSProperties => ({
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 0',
    border: accent ? '1px solid #4a9eff' : '1px solid #555',
    borderRadius: 6,
    background: accent ? '#2a6e2a' : '#2a2a2a',
    color: danger ? '#ff8888' : accent ? '#afffaf' : '#eee',
    cursor: 'pointer',
    fontSize: 13,
  });

  return (
    <>
      {/* Overlay — zIndex 90 for shapesOpen (below bottom bar 100), 200 for sheetOpen */}
      {(sheetOpen || shapesOpen) && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: sheetOpen ? 'rgba(0,0,0,0.6)' : 'transparent',
            zIndex: sheetOpen ? 200 : 90,
          }}
          onClick={() => { setShapesOpen(false); }}
        />
      )}

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed',
        bottom: sheetOpen ? 64 : '-100%',
        left: 0, right: 0,
        background: '#1e1e1e',
        borderTop: '1px solid #444',
        borderRadius: '14px 14px 0 0',
        padding: '16px 16px 24px',
        zIndex: 300,
        transition: 'bottom 0.28s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxHeight: '75vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: 13, fontWeight: 600 }}>設定・カラー</span>
          <button onClick={() => setSheetOpen(false)}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Canvas size */}
        <div>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>キャンバスサイズ</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canvasSize.map((s, i) => (
              <button key={s.label} onClick={() => { props.onResize(i); }}
                style={{
                  flex: 1, padding: '8px 0',
                  border: '1px solid #555', borderRadius: 6,
                  background: canvasSizeIdx === i ? '#4a9eff' : '#2a2a2a',
                  color: canvasSizeIdx === i ? '#000' : '#eee',
                  cursor: 'pointer', fontSize: 13,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>カラー</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="color" value={color}
              onChange={(e) => props.onColorChange(e.target.value)}
              style={{ width: 52, height: 52, border: 'none', background: 'none', cursor: 'pointer' }} />
            <span style={{ color: '#eee', fontFamily: 'monospace', fontSize: 14 }}>{color}</span>
          </div>
        </div>

        {/* Palette */}
        <div>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>パレット</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {PALETTE.map((c) => (
              <div key={c} onClick={() => { props.onColorChange(c); }}
                style={{
                  height: 28, background: c,
                  border: color === c ? '2px solid #4a9eff' : '1px solid #555',
                  borderRadius: 4, cursor: 'pointer',
                }} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={sheetBtn()} onClick={props.onGridToggle}>
            <Grid3x3 size={15} />
            {showGrid ? 'グリッド: ON' : 'グリッド: OFF'}
          </button>
          <button style={sheetBtn(true)} onClick={() => { props.onClear(); setSheetOpen(false); }}>
            <Trash2 size={15} /> クリア
          </button>
          <button style={sheetBtn(false, true)} onClick={() => { props.onExport(); setSheetOpen(false); }}>
            <Download size={15} /> 保存
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 64,
        background: '#1e1e1e',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}>
        <button style={iconBtn(false, !canUndo)} onClick={props.onUndo} disabled={!canUndo} title="元に戻す">
          <Undo2 size={22} />
        </button>
        <button style={iconBtn(false, !canRedo)} onClick={props.onRedo} disabled={!canRedo} title="やり直し">
          <Redo2 size={22} />
        </button>

        <div style={{ width: 1, height: 28, background: '#444' }} />

        {BASIC_TOOLS.map(({ id, Icon, label }) => (
          <button key={id} style={iconBtn(tool === id)} onClick={() => props.onToolChange(id)} title={label}>
            <Icon size={22} />
          </button>
        ))}

        {/* Shape tools group button */}
        <div style={{ position: 'relative' }}>
          {shapesOpen && (
            <div style={{
              position: 'absolute',
              bottom: 52,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: 10,
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 210,
            }}>
              {SHAPE_TOOLS.map(({ id, Icon, label }) => (
                <button key={id}
                  style={iconBtn(tool === id)}
                  title={label}
                  onClick={() => { props.onToolChange(id); setShapesOpen(false); }}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          )}
          <button
            style={iconBtn(isShapeTool || shapesOpen)}
            title="図形"
            onClick={() => setShapesOpen(o => !o)}
          >
            <ShapeGroupIcon size={22} />
          </button>
        </div>

        <div style={{ width: 1, height: 28, background: '#444' }} />

        {/* Color swatch → opens sheet */}
        <div onClick={() => setSheetOpen(true)} title="カラー"
          style={{
            width: 32, height: 32, borderRadius: 6,
            background: color,
            border: '2px solid #555',
            cursor: 'pointer', flexShrink: 0,
          }} />

        <button style={iconBtn(sheetOpen)} onClick={() => setSheetOpen(!sheetOpen)} title="その他">
          <MoreHorizontal size={22} />
        </button>
      </div>
    </>
  );
}
