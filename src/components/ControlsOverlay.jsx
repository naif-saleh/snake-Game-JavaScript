import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ControlsOverlay({ onDirectionChange }) {
  const triggerDir = (dir) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (e) {}
    }
    onDirectionChange(dir);
  };

  return (
    <div className="touch-controls">
      {/* Tactile D-Pad for Mobile & Touch Screens */}
      <div className="dpad-wrap">
        <div />
        <button
          className="dpad-key"
          onTouchStart={(e) => { e.preventDefault(); triggerDir({ x: 0, y: -1 }); }}
          onClick={() => triggerDir({ x: 0, y: -1 })}
          aria-label="Up"
        >
          <ChevronUp size={28} />
        </button>
        <div />

        <button
          className="dpad-key"
          onTouchStart={(e) => { e.preventDefault(); triggerDir({ x: -1, y: 0 }); }}
          onClick={() => triggerDir({ x: -1, y: 0 })}
          aria-label="Left"
        >
          <ChevronLeft size={28} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-cyan)', opacity: 0.6 }} />
        </div>
        <button
          className="dpad-key"
          onTouchStart={(e) => { e.preventDefault(); triggerDir({ x: 1, y: 0 }); }}
          onClick={() => triggerDir({ x: 1, y: 0 })}
          aria-label="Right"
        >
          <ChevronRight size={28} />
        </button>

        <div />
        <button
          className="dpad-key"
          onTouchStart={(e) => { e.preventDefault(); triggerDir({ x: 0, y: 1 }); }}
          onClick={() => triggerDir({ x: 0, y: 1 })}
          aria-label="Down"
        >
          <ChevronDown size={28} />
        </button>
        <div />
      </div>

      {/* Desktop Hints (Hidden on Mobile) */}
      <div className="keyboard-hints">
        <div className="hint-row">
          <span className="kbd-key">W A S D</span>
          <span>or</span>
          <span className="kbd-key">↑ ← ↓ →</span>
          <span>Move</span>
        </div>
        <div className="hint-row">
          <span className="kbd-key">SPACE</span>
          <span>Pause / Resume</span>
        </div>
        <div className="hint-row">
          <span className="kbd-key">C</span>
          <span>Toggle 3D Cam</span>
        </div>
        <div className="hint-row">
          <span className="kbd-key">R</span>
          <span>Quick Restart</span>
        </div>
      </div>
    </div>
  );
}
