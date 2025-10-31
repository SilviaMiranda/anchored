import React, { useEffect, useState } from 'react';

export default function WeeklyCalendar({ weekStartDate, mode, dailyRoutines }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('weekOverviewSeen');
    if (!seen) {
      setExpanded(true);
      localStorage.setItem('weekOverviewSeen', '1');
    }
  }, []);

  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const modeLabel = mode === 'regular' ? '🟢 Regular' : mode === 'hard' ? '🟡 Hard' : '🔴 Hardest';

  const summarize = (day) => {
    if (!day?.tasks) return '—';
    const counts = Object.values(day.tasks).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    return `${counts} items`;
  };

  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded((v) => !v)}>
        <h3 style={{ margin: 0, color: '#4D96FF' }}>Week Overview</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: '#2D3748', fontWeight: 500 }}>Mode: {modeLabel}</div>
          <div style={{ color: '#9A938E', fontSize: '0.9em' }}>{weekStartDate || '—'}</div>
          <span style={{ color: '#9A938E' }}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
          {dayOrder.map((d) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #F1F1F1', borderRadius: '10px' }}>
              <div style={{ textTransform: 'capitalize', fontWeight: 600, color: '#2D3748' }}>{d}</div>
              <div style={{ color: '#9A938E', fontSize: '0.9em' }}>{summarize(dailyRoutines?.[d])}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


