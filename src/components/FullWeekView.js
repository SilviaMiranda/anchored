import React, { useEffect, useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import Api from '../services/api';

export default function FullWeekView({ onBack, onOpenDay }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await Api.getCurrentRoutine();
      setRoutine(data);
      setError(null);
    } catch (e) {
      setError('No routine for this week.');
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];

  const counts = (day) => {
    if (!day?.tasks) return { done: 0, total: 0 };
    const all = Object.values(day.tasks).flat();
    const total = all.length;
    const done = all.filter((t) => t.completed).length;
    return { done, total };
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontSize: '24px', fontWeight: 700 }}>Full Week</h2>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #E5E5E5', background: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={18} />Back</button>
      </div>

      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px' }}>{error}</div>}

      {routine && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {dayOrder.map((d) => {
            const day = routine.dailyRoutines?.[d];
            if (!day) return null;
            const { done, total } = counts(day);
            const isToday = d === todayKey;
            const date = day.date || '';
            return (
              <div key={d} onClick={() => onOpenDay && onOpenDay(d)} style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', cursor: 'pointer', opacity: new Date(routine.weekStartDate) < new Date() && !isToday ? 0.95 : 1, backgroundImage: isToday ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.05), rgba(255, 107, 203, 0.05))' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textTransform: 'capitalize', color: '#2D3748', fontWeight: 700 }}>{d} {isToday && <span style={{ marginLeft: '8px', color: '#9D4EDD', fontWeight: 700, fontSize: '12px', border: '1px solid #E9D5FF', padding: '4px 6px', borderRadius: '10px' }}>TODAY</span>}</div>
                  <div style={{ color: '#6B7280', fontSize: '12px' }}>{date}</div>
                </div>
                <div style={{ marginTop: '8px', color: '#4B5563', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>{done} of {total} done {total > 0 && done === total && <CheckCircle size={18} color="#10B981" strokeWidth={2} />}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


