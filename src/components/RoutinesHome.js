import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

export default function RoutinesHome({ onNavigate }) {
  const [routine, setRoutine] = useState(null);
  const [mode, setMode] = useState('regular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCurrentRoutine();
      setRoutine(data);
      setMode(data.mode || 'regular');
      setError(null);
    } catch (e) {
      setRoutine(null);
      setError('No routine yet. Create one to get started.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  };

  const weekRange = () => {
    const start = routine?.weekStartDate ? new Date(routine.weekStartDate) : getMonday();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (dt) => dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const custodySettings = (() => {
    try {
      return JSON.parse(localStorage.getItem('custodySettings') || '{}');
    } catch {
      return {};
    }
  })();

  const getCustodyStatus = () => {
    if (!routine?.weekStartDate) return null;
    if (!custodySettings.hasCustodySchedule) return '👨‍👩‍👧‍👦 Kids with you';
    if (custodySettings.custodyPattern === 'alternating') {
      const hasKids = custodySettings.kidsWithMeWeeks?.includes(routine.weekStartDate);
      return hasKids ? '👨‍👩‍👧‍👦 Kids with you' : '🏠 Kids at dad\'s';
    }
    if (custodySettings.custodyPattern === 'specific') {
      const day = new Date(routine.weekStartDate).getDay();
      const dayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][day];
      return custodySettings.custodySchedule?.[dayKey] ? '👨‍👩‍👧‍👦 Kids with you' : '🏠 Kids at dad\'s';
    }
    return '👨‍👩‍👧‍👦 Kids with you';
  };

  const modeLabel = mode === 'regular' ? '🟢 Regular' : mode === 'hard' ? '🟡 Hard' : '🔴 Hardest';
  const permission = mode === 'hard'
    ? "You're in Hard Mode. Screens unlimited, easy meals fine, homework optional. This is smart adaptation."
    : mode === 'hardest'
    ? "You're in Survival Mode. Only goal: everyone alive and fed. You're doing GREAT."
    : '';

  const borderGradient = mode === 'regular' ? '#6BCB77' : mode === 'hard' ? '#FFD93D' : '#FF6B6B';
  const custodyStatus = getCustodyStatus();

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#2D3748', fontWeight: 700, fontSize: '24px' }}>Weekly Routine</h2>
      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>
      )}

      <div style={{
        background: 'white',
        border: '1px solid #E5E5E5',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderImage: `linear-gradient(135deg, ${borderGradient}, #9D4EDD) 1`,
        borderWidth: '2px',
        borderStyle: 'solid'
      }}>
        <div style={{ marginBottom: '12px', color: '#2D3748', fontWeight: 700 }}>{modeLabel}</div>
        <div style={{ color: '#6B7280', marginBottom: '8px' }}>{weekRange()}</div>
        {custodyStatus && <div style={{ color: '#6B7280', marginBottom: '8px', fontSize: '14px' }}>{custodyStatus}</div>}
        {permission && (
          <div style={{ color: '#4B5563', background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>{permission}</div>
        )}
        <button onClick={() => onNavigate && onNavigate('routines-today')} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white', fontWeight: 700, marginBottom: '12px' }}>View Today's Tasks</button>
        <button onClick={() => onNavigate && onNavigate('routines-week')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', color: '#2D3748', fontWeight: 600 }}>View Full Week</button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <button onClick={() => onNavigate && onNavigate('routines-templates')} style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', fontWeight: 600, color: '#2D3748' }}>Switch Mode</button>
        <button onClick={() => onNavigate && onNavigate('routines-upcoming')} style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', fontWeight: 600, color: '#2D3748' }}>Plan Ahead</button>
      </div>
    </div>
  );
}
