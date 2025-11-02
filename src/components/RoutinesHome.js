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

  /**
   * Get mode information based on mode and whether kids are present
   */
  const getModeInfo = (mode, hasKids) => {
    if (hasKids) {
      // Kids week modes
      const kidsModesMap = {
        regular: { emoji: '🟢', name: 'Regular', desc: 'Normal routine mode' },
        hard: { emoji: '🟡', name: 'Hard', desc: "You're in Hard Mode. Screens unlimited, easy meals fine, homework optional. This is smart adaptation." },
        hardest: { emoji: '🔴', name: 'Hardest', desc: "You're in Survival Mode. Only goal: everyone alive and fed. You're doing GREAT." }
      };
      return kidsModesMap[mode] || kidsModesMap.regular;
    } else {
      // Solo week modes
      const soloModesMap = {
        regular: { emoji: '🟢', name: 'Regular Solo', desc: 'Balanced recovery and prep week. Work, meal prep 2-3 dishes, creative time, rest.' },
        hard: { emoji: '🟡', name: 'Recovery', desc: "You're in Recovery Mode. Extra rest this week. Bed by 10pm, minimal obligations, meal prep optional." },
        hardest: { emoji: '🔴', name: 'Hustle', desc: "You're in Hustle Mode. High prep week - batch cooking 5-7 meals, organizing, getting ready for tough kids week!" }
      };
      return soloModesMap[mode] || soloModesMap.regular;
    }
  };

  const modeInfo = getModeInfo(mode, custodyInfo.hasKids);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#2D3748', fontWeight: 700, fontSize: '24px', marginBottom: '8px' }}>
        Weekly Routine
      </h2>
      {loading && <div style={{ color: '#9A938E', marginBottom: '12px' }}>Loading...</div>}
      {error && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>
      )}
      
      {/* Quick Status Bar */}
      {routine && (
        <>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            <span>{modeInfo.emoji} {modeInfo.name}</span>
            <span>•</span>
            <span>{custodyInfo.display}</span>
          </div>
          {custodyInfo.handover && (
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#92400E',
              marginBottom: '20px'
            }}>
              <strong>Note:</strong> You can add exception notes in Settings → Custody Schedule
            </div>
          )}
        </>
      )}

      {/* Primary Actions */}
      {routine ? (
        <>
          <button
            onClick={() => onNavigate && onNavigate('routines-today')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(157, 78, 221, 0.3)'
            }}
          >
            View Today's Tasks
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('routines-week')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              border: '2px solid #E5E5E5',
              borderRadius: '12px',
              fontWeight: 600,
              color: '#2D3748',
              marginBottom: '32px',
              cursor: 'pointer'
            }}
          >
            View Full Week
          </button>
        </>
      ) : (
        <button
          onClick={() => onNavigate('routines-templates')}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '16px',
            marginBottom: '32px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(157, 78, 221, 0.3)'
          }}
        >
          {custodyInfo.hasKids ? 'Create Kids Week Routine' : 'Create Solo Week Routine'}
        </button>
      )}

      {/* Secondary Actions */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E5E5',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#9A938E',
          marginBottom: '12px',
          fontWeight: 600
        }}>
          ADJUST
        </div>
        
        <button
          onClick={() => onNavigate && onNavigate('routines-templates')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '10px',
            textAlign: 'left',
            cursor: 'pointer',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 500
          }}
        >
          <span>Switch Mode</span>
          <span style={{ color: '#9A938E' }}>›</span>
        </button>
        
        <button
          onClick={() => onNavigate && onNavigate('routines-upcoming')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '10px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 500
          }}
        >
          <span>Plan Hard Weeks</span>
          <span style={{ color: '#9A938E' }}>›</span>
        </button>
      </div>

      {/* Info Card - Only if has routine */}
      {routine && custodyInfo.handover && (
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E5E5E5',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '13px',
          color: '#6B7280',
          fontStyle: 'italic'
        }}>
          {custodyInfo.handover}
        </div>
      )}
    </div>
  );
}
