import type { Tool } from '../types';
import {
  Pencil, Eraser, PaintBucket, Pipette,
  Minus, Square, Circle,
  Undo2, Redo2, Grid3x3, Trash2, Download,
} from 'lucide-react';

interface Props {
  tool: Tool;
  color: string;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (t: Tool) => void;
  onColorChange: (c: string) => void;
  onGridToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
}

const TOOLS: { id: Tool; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'pen', label: 'ペン', Icon: Pencil },
  { id: 'eraser', label: '消しゴム', Icon: Eraser },
  { id: 'fill', label: '塗りつぶし', Icon: PaintBucket },
  { id: 'eyedropper', label: 'スポイト', Icon: Pipette },
  { id: 'line', label: '直線', Icon: Minus },
  { id: 'rect', label: '矩形', Icon: Square },
  { id: 'circle', label: '円', Icon: Circle },
];

const PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#ff4444', '#44ff44', '#4444ff', '#888888', '#444444',
  '#ffaaaa', '#aaffaa', '#aaaaff', '#ffaa00', '#00aaff',
];

export default function Toolbar(props: Props) {
  const { tool, color, showGrid, canUndo, canRedo,
    onToolChange, onColorChange, onGridToggle,
    onUndo, onRedo, onClear, onExport } = props;

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 0',
    border: '1px solid #555',
    borderRadius: 4,
    background: '#2a2a2a',
    color: '#eee',
    cursor: 'pointer',
  };

  const activeTool: React.CSSProperties = {
    ...btnBase,
    background: '#4a9eff',
    color: '#000',
    border: '1px solid #4a9eff',
  };

  const iconBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '6px 10px',
    border: '1px solid #555',
    borderRadius: 4,
    background: '#2a2a2a',
    color: '#eee',
    cursor: 'pointer',
    fontSize: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 160 }}>
      <div>
        <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>ツール</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              style={tool === id ? activeTool : btnBase}
              onClick={() => onToolChange(id)}
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>カラー</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <span style={{ color: '#eee', fontFamily: 'monospace', fontSize: 12 }}>{color}</span>
        </div>
      </div>

      <div>
        <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>パレット</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
          {PALETTE.map((c) => (
            <div
              key={c}
              onClick={() => onColorChange(c)}
              style={{
                width: 24, height: 24,
                background: c,
                border: color === c ? '2px solid #4a9eff' : '1px solid #555',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>操作</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{ ...iconBtn, flex: 1, opacity: canUndo ? 1 : 0.4 }}
              onClick={onUndo} disabled={!canUndo}
              title="元に戻す"
            >
              <Undo2 size={14} /> 元に戻す
            </button>
            <button
              style={{ ...iconBtn, flex: 1, opacity: canRedo ? 1 : 0.4 }}
              onClick={onRedo} disabled={!canRedo}
              title="やり直し"
            >
              <Redo2 size={14} /> やり直し
            </button>
          </div>
          <button style={iconBtn} onClick={onGridToggle} title="グリッド切替">
            <Grid3x3 size={14} />
            {showGrid ? 'グリッド: ON' : 'グリッド: OFF'}
          </button>
          <button style={{ ...iconBtn, color: '#ff8888' }} onClick={onClear} title="クリア">
            <Trash2 size={14} /> クリア
          </button>
          <button
            style={{ ...iconBtn, background: '#2a6e2a', border: '1px solid #4a9eff', color: '#afffaf' }}
            onClick={onExport}
            title="PNGで保存"
          >
            <Download size={14} /> PNGで保存
          </button>
        </div>
      </div>
    </div>
  );
}
