import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, ListFilter, Award } from 'lucide-react';
import { STAGES } from '../data/stages';

export default function StageClearModal({
  stageId = 1,
  score = 0,
  timeSec = 0,
  onNextStage,
  onReplay,
  onOpenStageSelect,
}) {
  const stage = STAGES.find(s => s.id === stageId) || STAGES[0];
  const isFinalStage = stageId >= STAGES.length;

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#00f2fe', '#00ff87', '#ffb703', '#ffffff']
      });
    } catch (e) {}
  }, [stageId]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(0, 255, 135, 0.2)',
              border: '1px solid var(--primary-emerald)',
              color: 'var(--primary-emerald)',
              fontSize: '0.85rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
            }}
          >
            <Award size={18} /> STAGE {stageId} CLEARED!
          </div>

          <h2
            className="modal-title"
            style={{
              fontSize: '1.75rem',
              background: 'linear-gradient(135deg, #00f2fe, #00ff87)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            أحسنت! تم اجتياز المرحلة
          </h2>

          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
            {stage.titleAr} ({stage.titleEn})
          </div>
        </div>

        {/* 3-Star Rating Animation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '8px 0' }}>
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 183, 3, 0.2)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(255, 183, 3, 0.5)',
                animation: `pulseGlow 1.2s infinite alternate`,
                animationDelay: `${starIdx * 0.2}s`
              }}
            >
              <Star size={26} fill="var(--accent-gold)" color="var(--accent-gold)" />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">نقاط المرحلة</div>
            <div className="stat-val" style={{ color: 'var(--primary-cyan)' }}>{score}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">الوقت المستغرق</div>
            <div className="stat-val">{formatTime(timeSec)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {!isFinalStage ? (
            <button
              onClick={onNextStage}
              className="cyber-btn"
              style={{ padding: '14px', fontSize: '1rem', width: '100%', gap: '10px' }}
            >
              <span>المرحلة التالية</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255, 183, 3, 0.2)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}
            >
              🏆 تهانينا! لقد أنهيت جميع مراحل وتحديات اللعبة بنجاح!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={onReplay}
              className="cyber-btn"
              style={{ padding: '10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={15} /> إعادة المحاولة
            </button>
            <button
              onClick={onOpenStageSelect}
              className="cyber-btn gold"
              style={{ padding: '10px', fontSize: '0.8rem' }}
            >
              <ListFilter size={15} /> قائمة المراحل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
