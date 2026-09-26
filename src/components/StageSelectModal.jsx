import React from 'react';
import { X, Lock, Check, Star, ShieldAlert, Clock, Play, Infinity } from 'lucide-react';
import { STAGES } from '../data/stages';

export default function StageSelectModal({
  isOpen,
  onClose,
  unlockedStage = 1,
  currentStageId = 1,
  gameMode = 'stages',
  onSelectStage,
  onSelectEndless,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary-cyan)', fontWeight: 700 }}>
              MISSIONS & CHALLENGES
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.4rem', textAlign: 'left', margin: 0 }}>
              المراحل والتحديات
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

        {/* Mode Switch: Stages vs Endless */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => onSelectStage(currentStageId)}
            className={`pill-btn ${gameMode === 'stages' ? 'active' : ''}`}
            style={{ padding: '10px', justifyContent: 'center' }}
          >
            <Star size={16} color="var(--accent-gold)" />
            <span>طور المراحل (Challenges)</span>
          </button>
          <button
            onClick={onSelectEndless}
            className={`pill-btn ${gameMode === 'endless' ? 'active' : ''}`}
            style={{ padding: '10px', justifyContent: 'center' }}
          >
            <Infinity size={16} color="var(--primary-cyan)" />
            <span>الطور اللانهائي (Endless)</span>
          </button>
        </div>

        {/* Stages Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
          {STAGES.map((st) => {
            const isUnlocked = st.id <= unlockedStage;
            const isCurrent = gameMode === 'stages' && currentStageId === st.id;

            return (
              <div
                key={st.id}
                onClick={() => {
                  if (isUnlocked) onSelectStage(st.id);
                }}
                style={{
                  background: isCurrent
                    ? 'rgba(0, 242, 254, 0.12)'
                    : isUnlocked
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: isCurrent
                    ? '2px solid var(--primary-cyan)'
                    : isUnlocked
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '14px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.55,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? '0 0 16px rgba(0, 242, 254, 0.3)' : 'none',
                }}
              >
                {/* Top Badge & Lock Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: st.themeColor,
                    }}
                  >
                    STAGE {st.id}
                  </span>

                  {isUnlocked ? (
                    <span style={{ display: 'flex', gap: '2px' }}>
                      <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      <Star size={14} fill={unlockedStage > st.id ? "var(--accent-gold)" : "none"} color="var(--accent-gold)" />
                      <Star size={14} fill={unlockedStage > st.id ? "var(--accent-gold)" : "none"} color="var(--accent-gold)" />
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <Lock size={13} /> مغلق
                    </span>
                  )}
                </div>

                {/* Titles */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    {st.titleAr}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {st.titleEn}
                  </div>
                </div>

                {/* Objective details */}
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {st.subtitleAr}
                </div>

                {/* Badges: Target & Hazards */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '4px', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--primary-emerald)', fontWeight: 700 }}>
                    🎯 {st.targetCores} كبسولات
                  </span>

                  {st.timeLimit && (
                    <span style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {st.timeLimit} ثانية
                    </span>
                  )}

                  {st.obstacles.length > 0 && (
                    <span style={{ color: 'var(--accent-ruby)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldAlert size={12} /> حواجز ليزر
                    </span>
                  )}
                </div>

                {/* Play action */}
                {isUnlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStage(st.id);
                    }}
                    className={`cyber-btn ${isCurrent ? '' : 'gold'}`}
                    style={{ padding: '6px 10px', fontSize: '0.72rem', marginTop: '4px' }}
                  >
                    <Play size={12} fill="currentColor" /> {isCurrent ? 'المرحلة الحالية' : 'بدء المرحلة'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
