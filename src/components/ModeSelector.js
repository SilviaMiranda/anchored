import React from 'react';

export default function ModeSelector({ mode, onChange }) {
  const options = [
  { key: 'regular', emoji: '🟢', title: 'Regular', desc: 'Normal week, full routine' },
  { key: 'hard', emoji: '🟡', title: 'Hard', desc: 'High stress, simplified expectations' },
  { key: 'hardest', emoji: '🔴', title: 'Hardest', desc: 'Survival mode, bare minimum only' },
  ];

  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '1em', color: '#9D4EDD' }}>Routine Mode</h3>
      {options.map(({ key, emoji, title, desc }) => (
        <label key={key} onClick={() => onChange && onChange(key)} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '12px', cursor: 'pointer', border: mode === key ? '3px solid transparent' : '2px solid #E5E5E5', background: mode === key ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD, #FF6BCB) border-box' : 'white', marginBottom: '10px' }}>
          <input type="radio" checked={mode === key} onChange={() => onChange && onChange(key)} style={{ marginTop: '3px' }} />
          <div>
            <strong>{emoji} {title}</strong>
            <div style={{ color: '#9A938E', fontSize: '0.9em' }}>{desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}



