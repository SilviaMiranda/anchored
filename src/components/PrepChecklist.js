import React, { useEffect, useState } from 'react';
import Api from '../services/api';

export default function PrepChecklist({ weekId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await Api.getPrepTasks(weekId);
      setTasks(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (weekId) load(); }, [weekId]);

  const toggle = async (task) => {
    const updated = tasks.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    await Api.updatePrepTasks(weekId, updated);
  };

  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <h3 style={{ marginTop: 0, color: '#4D96FF' }}>Prep Checklist</h3>
      {loading ? <div style={{ color: '#9A938E' }}>Loading...</div> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderTop: '1px solid #F1F1F1' }}>
              <input type="checkbox" checked={!!t.completed} onChange={() => toggle(t)} />
              <span style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#9A938E' : '#2D3748' }}>{t.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


