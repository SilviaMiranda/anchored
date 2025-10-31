import React from 'react';

export default function DailyTaskList({ title, tasks = [], onToggle }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <h4 style={{ margin: 0, marginBottom: '10px', color: '#4D96FF' }}>{title}</h4>
      {tasks.length === 0 && (
        <div style={{ color: '#9A938E', fontSize: '0.9em' }}>No tasks</div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderTop: '1px solid #F1F1F1' }}>
            <input type="checkbox" checked={!!t.completed} onChange={() => onToggle && onToggle(t)} />
            <span style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#9A938E' : '#2D3748' }}>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


