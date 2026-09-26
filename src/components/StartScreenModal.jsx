import React from 'react';
import { Play, Zap, Settings, Star, Infinity, Compass } from 'lucide-react';
import { STAGES } from '../data/stages';

export default function StartScreenModal({
  onStart,
  gameMode = 'stages',
  setGameMode,
  currentStageId = 1,
  difficulty,
  setDifficulty,
  onOpenStageSelect,
  onOpenSettings
}) {
  const speeds = [
    { id: 'casual', label: 'Casual', desc: 'Slow & Relaxed' },
    { id: 'normal', label: 'Normal', desc: 'Classic Balanced' },
    { id: 'turbo', label: 'Turbo', desc: 'Fast & Agile' },
    { id: 'insane', label: 'Insane', desc: 'Maximum Speed' }
  ];

  const currentStage = STAGES.find(s => s.id === currentStageId) || STAGES[0];

  return (
    <div className="start-overlay-backdrop">
      <div className="start-modal-card">
        {/* Mascot / Avatar */}
        <div className="start-badge">
          <img
            src="/assets/cyber_snake.jpg"
            alt="Cyber Viper"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Title */}
        <div>
          <h1 className="start-title">CYBER VIPER 3D</h1>
          <p className="start-subtitle">
            Navigate the 3D arena, overcome laser obstacles, and conquer all challenge stages.
          </p>
        </div>

        {/* Game Mode Selector: Stages (المراحل) vs Endless (الكلاسيكي) */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            اختر طور اللعب (Game Mode)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setGameMode('stages')}
              className={`pill-btn ${gameMode === 'stages' ? 'active' : ''}`}
              style={{ padding: '12px 8px', flexDirection: 'column', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                <Star size={16} color="var(--accent-gold)" />
                <span>طور المراحل</span>
              </div>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>6 تحديات تدريجية</span>
            </button>

            <button
              onClick={() => setGameMode('endless')}
              className={`pill-btn ${gameMode === 'endless' ? 'active' : ''}`}
              style={{ padding: '12px 8px', flexDirection: 'column', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                <Infinity size={16} color="var(--primary-cyan)" />
                <span>الطور المفتوح</span>
              </div>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>كلاسيك بلا نهاية</span>
            </button>
          </div>
        </div>

        {/* Stage Preview Chip (if in Stages mode) */}
        {gameMode === 'stages' && (
          <div
            onClick={onOpenStageSelect}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 183, 3, 0.1)',
              border: '1px solid rgba(255, 183, 3, 0.35)',
              cursor: 'pointer'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                المرحلة المحددة
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                المرحلة {currentStage.id}: {currentStage.titleAr}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>
              <Compass size={14} /> تغيير المرحلة
            </div>
          </div>
        )}

        {/* Speed / Difficulty Selector (if in Endless mode) */}
        {gameMode === 'endless' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--text-muted)'
            }}>
              سرعة اللعب (Speed)
            </div>
            <div className="pill-grid">
              {speeds.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDifficulty(s.id)}
                  className={`pill-btn ${difficulty === s.id ? 'active' : ''}`}
                  style={{ flexDirection: 'column', gap: '2px', padding: '10px 6px' }}
                >
                  <span style={{ fontWeight: 800 }}>{s.label}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Big Start Button */}
        <button
          onClick={onStart}
          className="start-action-btn"
          autoFocus
        >
          <Play size={22} fill="currentColor" /> {gameMode === 'stages' ? `بدء المرحلة ${currentStage.id}` : 'START GAME'}
        </button>

        {/* Helper Note & Settings Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>اضغط <strong style={{ color: '#fff' }}>SPACE</strong> للبدء</span>
          <button
            onClick={onOpenSettings}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Settings size={14} /> Skins & Themes
          </button>
        </div>
      </div>
    </div>
  );
}
