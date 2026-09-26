import React from 'react';
import { X, Check, Volume2, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { SNAKE_SKINS, FOOD_THEMES } from './SnakeCanvas';

export default function SettingsModal({
  isOpen,
  onClose,
  skin,
  setSkin,
  foodTheme,
  setFoodTheme,
  cameraMode,
  setCameraMode,
  difficulty,
  setDifficulty,
  wallMode,
  setWallMode,
  isMuted,
  setIsMuted,
  volume,
  setVolume
}) {
  if (!isOpen) return null;

  const difficultyOptions = [
    { id: 'casual', label: 'Casual', speed: '160ms' },
    { id: 'normal', label: 'Normal', speed: '120ms' },
    { id: 'turbo', label: 'Turbo', speed: '90ms' },
    { id: 'insane', label: 'Insane', speed: '65ms' }
  ];

  const cameraOptions = [
    { id: 'isometric', label: '3D Isometric' },
    { id: 'perspective', label: '3D Perspective' },
    { id: 'chase', label: '3D Chase Cam' },
    { id: 'topdown', label: 'Top-Down 3D' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary-cyan)" />
            <h2 className="modal-title" style={{ fontSize: '1.25rem', textAlign: 'left' }}>
              CUSTOMIZE & SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cyber-btn icon-only"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Snake Skin Selection */}
        <div className="settings-section">
          <label className="settings-label">Snake 3D Skin</label>
          <div className="pill-grid">
            {Object.values(SNAKE_SKINS).map((s) => (
              <button
                key={s.id}
                onClick={() => setSkin(s.id)}
                className={`pill-btn ${skin === s.id ? 'active' : ''}`}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#' + s.headColor.toString(16).padStart(6, '0'),
                    boxShadow: '0 0 6px #' + s.glowColor.toString(16).padStart(6, '0')
                  }}
                />
                <span>{s.name}</span>
                {skin === s.id && <Check size={14} color="var(--primary-emerald)" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Food / Item Theme Selection */}
        <div className="settings-section">
          <label className="settings-label">Food & Power-Up Asset</label>
          <div className="pill-grid">
            {Object.values(FOOD_THEMES).map((f) => (
              <button
                key={f.id}
                onClick={() => setFoodTheme(f.id)}
                className={`pill-btn ${foodTheme === f.id ? 'active' : ''}`}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#' + f.color.toString(16).padStart(6, '0')
                  }}
                />
                <span>{f.name}</span>
                {foodTheme === f.id && <Check size={14} color="var(--primary-emerald)" />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Camera Angle */}
        <div className="settings-section">
          <label className="settings-label">Camera Angle</label>
          <div className="pill-grid">
            {cameraOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => setCameraMode(c.id)}
                className={`pill-btn ${cameraMode === c.id ? 'active' : ''}`}
              >
                <span>{c.label}</span>
                {cameraMode === c.id && <Check size={14} color="var(--primary-emerald)" />}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Speed & Difficulty */}
        <div className="settings-section">
          <label className="settings-label">Difficulty & Speed</label>
          <div className="pill-grid">
            {difficultyOptions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`pill-btn ${difficulty === d.id ? 'active' : ''}`}
              >
                <span>{d.label}</span>
                {difficulty === d.id && <Check size={14} color="var(--primary-emerald)" />}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Wall Mode */}
        <div className="settings-section">
          <label className="settings-label">Boundary Mode</label>
          <div className="pill-grid">
            <button
              onClick={() => setWallMode('solid')}
              className={`pill-btn ${wallMode === 'solid' ? 'active' : ''}`}
            >
              <ShieldAlert size={14} />
              <span>Laser Walls (Crash)</span>
            </button>
            <button
              onClick={() => setWallMode('portal')}
              className={`pill-btn ${wallMode === 'portal' ? 'active' : ''}`}
            >
              <Sparkles size={14} />
              <span>Portal Wrap (Loop)</span>
            </button>
          </div>
        </div>

        {/* 6. Audio Volume */}
        <div className="settings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="settings-label">Audio & Synth FX</label>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: 'none',
                border: 'none',
                color: isMuted ? 'var(--accent-ruby)' : 'var(--primary-cyan)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Volume2 size={14} />
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            style={{ width: '100%', accentColor: 'var(--primary-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Apply & Close */}
        <button
          onClick={onClose}
          className="cyber-btn"
          style={{ width: '100%', padding: '12px', marginTop: '6px' }}
        >
          CONFIRM & RESUME
        </button>
      </div>
    </div>
  );
}
