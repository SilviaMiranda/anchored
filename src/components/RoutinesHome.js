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

  const getCustodyInfo = () => {
    try {
      const custodySettings = JSON.parse(localStorage.getItem('custodySettings') || '{}');
      
      if (!custodySettings.custodyType || custodySettings.custodyType === 'no') {
        return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
      }
      
      if (custodySettings.custodyType === 'alternating') {
        const today = new Date();
        const referenceWeekStart = new Date(custodySettings.weekStartDate);
        
        // Get current week's Monday
        const currentWeekMonday = getMonday(today);
        
        // Calculate weeks difference
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksDiff = Math.floor((currentWeekMonday - referenceWeekStart) / msPerWeek);
        
        // If currentWeekHasKids is true for week 0, then even weeks have kids
        const hasKids = custodySettings.currentWeekHasKids ? 
          (weeksDiff % 2 === 0) : 
          (weeksDiff % 2 === 1);
        
        if (hasKids) {
          return { 
            hasKids: true, 
            display: '👨‍👩‍👧‍👦 Kids with you Mon afternoon - Mon morning',
            handover: 'Handover: Monday at school (pick up 4:30pm, drop off next Monday 9am)'
          };
        } else {
          return { 
            hasKids: false, 
            display: '🏠 Kids at dad\'s this week',
            handover: 'Handover: Next Monday at school (dad drops off 9am)'
          };
        }
      }
      
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    } catch (e) {
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    }
  };

  const custodyInfo = getCustodyInfo();

  const modeInfoMap = {
    regular: { emoji: '🟢', name: 'Regular', desc: 'Normal routine mode' },
    hard: { emoji: '🟡', name: 'Hard', desc: "You're in Hard Mode. Screens unlimited, easy meals fine, homework optional. This is smart adaptation." },
    hardest: { emoji: '🔴', name: 'Hardest', desc: "You're in Survival Mode. Only goal: everyone alive and fed. You're doing GREAT." }
  };
  const modeInfo = modeInfoMap[mode] || modeInfoMap.regular;

  const borderGradient = mode === 'regular' ? '#6BCB77' : mode === 'hard' ? '#FFD93D' : '#FF6B6B';

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#2D3748', fontWeight: 700, fontSize: '24px' }}>Weekly Routine</h2>
      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>
      )}

      {routine ? (
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
          <div style={{ marginBottom: '8px', color: '#2D3748', fontWeight: 700, fontSize: '18px' }}>THIS WEEK</div>
          <div style={{ marginBottom: '8px', color: '#2D3748', fontWeight: 600 }}>{modeInfo.emoji} {modeInfo.name}</div>
          <div style={{ color: '#6B7280', marginBottom: '12px', fontSize: '14px' }}>{modeInfo.desc}</div>
          {routine?.weekStartDate && (
            <div style={{ color: '#6B7280', marginBottom: '12px', fontSize: '14px' }}>
              {new Date(routine.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(new Date(routine.weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          
          {/* Custody Info */}
          <div style={{ color: '#6B7280', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            {custodyInfo.display}
          </div>
          {custodyInfo.handover && (
            <div style={{ color: '#9A938E', marginBottom: '16px', fontSize: '13px', fontStyle: 'italic' }}>
              {custodyInfo.handover}
            </div>
          )}
          
          <button onClick={() => onNavigate && onNavigate('routines-today')} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white', fontWeight: 700, marginBottom: '12px' }}>View Today's Tasks</button>
          <button onClick={() => onNavigate && onNavigate('routines-week')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', color: '#2D3748', fontWeight: 600 }}>View Full Week</button>
        </div>
      ) : (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '8px', color: '#2D3748', fontWeight: 700, fontSize: '18px' }}>
            {custodyInfo.hasKids ? '👨‍👩‍👧‍👦 Kids with you this week' : '🏠 Kids at dad\'s this week'}
          </div>
          <div style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
            {custodyInfo.hasKids ? 
              'Create a routine for the week ahead' : 
              'Plan your solo time this week'}
          </div>
          {custodyInfo.handover && (
            <div style={{ color: '#9A938E', marginBottom: '16px', fontSize: '13px', fontStyle: 'italic' }}>
              {custodyInfo.handover}
            </div>
          )}
          <button
            onClick={() => onNavigate('routines-templates')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {custodyInfo.hasKids ? 'Create Routine' : 'Plan Week'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        <button onClick={() => onNavigate && onNavigate('routines-templates')} style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', fontWeight: 600, color: '#2D3748' }}>Switch Mode</button>
        <button onClick={() => onNavigate && onNavigate('routines-upcoming')} style={{ padding: '12px 14px', borderRadius: '12px', border: '2px solid #E5E5E5', background: 'white', fontWeight: 600, color: '#2D3748' }}>Plan Ahead</button>
      </div>
    </div>
  );
}
