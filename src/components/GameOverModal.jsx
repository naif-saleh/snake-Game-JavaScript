import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Settings, Award } from 'lucide-react';

export default function GameOverModal({
  score = 0,
  highScore = 0,
  isNewHigh = false,
  length = 1,
  foodEaten = 0,
  maxCombo = 1,
  timeSurvivedSec = 0,
  onRestart,
  onOpenSettings
}) {
  useEffect(() => {
    if (isNewHigh && score > 0) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isNewHigh, score]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          {isNewHigh && score > 0 ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 183, 3, 0.2)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginBottom: '10px'
            }}>
              <Award size={16} /> NEW HIGH SCORE RECORD!
            </div>
          ) : (
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--accent-ruby)',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              marginBottom: '4px'
            }}>
              SYSTEM CRASH DETECTED
            </div>
          )}

          <h2 className="modal-title" style={{
            background: 'linear-gradient(135deg, #ff0055, #ff7b00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GAME OVER
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Final Score</div>
            <div className="stat-val" style={{ color: 'var(--primary-cyan)' }}>{score}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">High Score</div>
            <div className="stat-val" style={{ color: 'var(--accent-gold)' }}>
              <Trophy size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              {highScore}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Max Length</div>
            <div className="stat-val">{length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Time Survived</div>
            <div className="stat-val">{formatTime(timeSurvivedSec)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onRestart}
            className="cyber-btn"
            style={{ padding: '14px', fontSize: '1rem', width: '100%' }}
          >
            <RotateCcw size={18} /> PLAY AGAIN
          </button>

          <button
            onClick={onOpenSettings}
            className="cyber-btn gold"
            style={{ padding: '11px', fontSize: '0.85rem', width: '100%' }}
          >
            <Settings size={16} /> CUSTOMIZE SKINS & THEMES
          </button>
        </div>
      </div>
    </div>
  );
}
