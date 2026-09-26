import React from 'react';
import {
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Settings,
  Eye,
  RotateCcw,
  Compass,
  Clock,
  Target
} from 'lucide-react';

export default function GameHUD({
  score = 0,
  highScore = 0,
  length = 1,
  combo = 1,
  speedLevel = 1,
  isPaused = false,
  isMuted = false,
  cameraMode = 'isometric',
  gameMode = 'stages',
  stage = null,
  stageProgress = 0,
  stageTimeRemaining = null,
  onTogglePause,
  onToggleMute,
  onCycleCamera,
  onOpenSettings,
  onOpenStageSelect,
  onRestart
}) {
  const cameraLabels = {
    isometric: '3D ISO',
    perspective: '3D CAM',
    chase: '3D CHASE',
    topdown: 'TOP 3D'
  };

  const isLowTime = stageTimeRemaining !== null && stageTimeRemaining <= 10;

  return (
    <header className="hud-header">
      {/* Brand & Score Stats */}
      <div className="hud-left">
        {/* Logo / Mascot Avatar */}
        <div className="glass-panel hud-brand">
          <div className="hud-avatar">
            <img
              src="/assets/cyber_snake.jpg"
              alt="Cyber Viper"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="hud-title-wrap">
            <h1 className="hud-title">CYBER VIPER 3D</h1>
            <div className="hud-meta">
              <span>LEN: <strong>{length}</strong></span>
              <span>•</span>
              <span style={{ color: 'var(--accent-gold)' }}>
                <Zap size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> LVL {speedLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Current Score */}
        <div className="glass-panel hud-score-card">
          <span className="hud-score-label">Score</span>
          <span className="hud-score-val">{score}</span>
        </div>

        {/* High Score */}
        <div className="glass-panel hud-highscore-card">
          <Trophy size={18} color="var(--accent-gold)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="hud-score-label" style={{ color: 'rgba(255, 183, 3, 0.8)' }}>Best</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {highScore}
            </span>
          </div>
        </div>

        {/* Stage Objective HUD (When in Stage Mode) */}
        {gameMode === 'stages' && stage && (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderColor: stage.themeColor || 'var(--primary-cyan)',
              background: 'rgba(15, 23, 42, 0.85)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: stage.themeColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={12} /> STAGE {stage.id}: {stage.titleAr}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div style={{ width: '70px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min((stageProgress / stage.targetCores) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-emerald))',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {stageProgress}/{stage.targetCores}
                </span>
              </div>
            </div>

            {/* Stage Countdown Timer (If present) */}
            {stageTimeRemaining !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: isLowTime ? 'rgba(255, 0, 85, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  border: isLowTime ? '1px solid var(--accent-ruby)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isLowTime ? 'var(--accent-ruby)' : 'var(--accent-gold)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  animation: isLowTime ? 'pulseGlow 0.8s infinite alternate' : 'none'
                }}
              >
                <Clock size={13} />
                <span>{stageTimeRemaining}s</span>
              </div>
            )}
          </div>
        )}

        {/* Combo Badge */}
        {combo > 1 && (
          <div className="hud-combo-badge">
            x{combo} COMBO!
          </div>
        )}
      </div>

      {/* Control Quick Actions */}
      <div className="hud-right">
        {/* Stages / Challenges Selector Button */}
        <button
          onClick={onOpenStageSelect}
          title="اختيار المراحل والتحديات (Stage Select)"
          className="cyber-btn gold"
          style={{ padding: '8px 12px', fontSize: '0.75rem' }}
        >
          <Compass size={15} color="var(--accent-gold)" />
          <span className="hidden sm:inline">المراحل</span>
        </button>

        {/* Camera Angle Switcher */}
        <button
          onClick={onCycleCamera}
          title="Switch 3D Camera View (Key: C)"
          className="cyber-btn"
          style={{ padding: '8px 12px', fontSize: '0.75rem' }}
        >
          <Eye size={15} color="var(--primary-cyan)" />
          <span>{cameraLabels[cameraMode]}</span>
        </button>

        {/* Pause / Play */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume Game (Space)' : 'Pause Game (Space)'}
          className="cyber-btn icon-only"
        >
          {isPaused ? <Play size={18} color="var(--primary-emerald)" /> : <Pause size={18} color="#fff" />}
        </button>

        {/* Restart Quick Button */}
        <button
          onClick={onRestart}
          title="Restart Game (Key: R)"
          className="cyber-btn icon-only"
        >
          <RotateCcw size={16} color="#fff" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute (Key: M)' : 'Mute (Key: M)'}
          className="cyber-btn icon-only"
        >
          {isMuted ? <VolumeX size={18} color="var(--accent-ruby)" /> : <Volume2 size={18} color="var(--primary-cyan)" />}
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          title="Game Settings, Skins & Foods"
          className="cyber-btn icon-only gold"
        >
          <Settings size={18} color="var(--accent-gold)" />
        </button>
      </div>
    </header>
  );
}
