import React, { useEffect, useState } from 'react';
import Api from '../services/api';

export default function HardWeekPlanner() {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [reason, setReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await Api.getUpcomingHardWeeks();
      setFlags(data || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!weekStartDate) return;
    await Api.flagHardWeek(weekStartDate, { reason });
    setWeekStartDate('');
    setReason('');
    await load();
  };

  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <h3 style={{ marginTop: 0, color: '#9D4EDD' }}>Plan Hard Weeks</h3>
      <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
        <input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} placeholder="Week start (YYYY-MM-DD)" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #E5E5E5' }} />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #E5E5E5' }} />
        <button onClick={submit} style={{ padding: '12px', border: 'none', borderRadius: '12px', fontWeight: 600, background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white' }}>Flag Week</button>
      </div>
      {loading ? (
        <div style={{ color: '#9A938E' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(flags).map(([key, f]) => (
            <div key={key} style={{ border: '1px solid #F1F1F1', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontWeight: 600 }}>{f.weekStartDate}</div>
              <div style={{ color: '#9A938E' }}>{f.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


