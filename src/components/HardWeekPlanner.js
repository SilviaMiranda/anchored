import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ApiService from '../services/api';

export default function HardWeekPlanner({ onNavigate }) {
  const [routines, setRoutines] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);

  // Generate 8 weeks ahead starting from current week
  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const upcomingWeeks = useMemo(() => {
    const weeks = [];
    const currentMonday = getMonday();
    for (let i = 0; i < 8; i++) {
      const weekMonday = new Date(currentMonday);
      weekMonday.setDate(weekMonday.getDate() + (i * 7));
      const weekStartStr = weekMonday.toISOString().split('T')[0];
      
      const weekEnd = new Date(weekMonday);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      const weekTiming = i === 0 ? 'current' : i === 1 ? 'nextWeek' : 'future';
      const label = i === 0 ? 'This week' : i === 1 ? 'Next week' : `${i} weeks ahead`;
      
      weeks.push({
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
        weekMonday: weekMonday,
        start: weekStartStr,
        label: label,
        timing: weekTiming
      });
    }
    return weeks;
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // Load all routines for upcoming weeks
      const routinesMap = {};
      for (const week of upcomingWeeks) {
        try {
          const routine = await ApiService.getRoutine(week.weekStartDate);
          if (routine) {
            routinesMap[week.weekStartDate] = routine;
          }
        } catch (e) {
          // Week doesn't have routine yet, that's fine
        }
      }
      setRoutines(routinesMap);
    } catch (e) {
      console.error('Failed to load routines:', e);
    } finally {
      setLoading(false);
    }
  }, [upcomingWeeks]);

  useEffect(() => { load(); }, [load]);

  const formatWeekDates = (weekStart) => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[start.getMonth()]} ${start.getDate()}-${monthNames[end.getMonth()]} ${end.getDate()}`;
  };

  const saveException = async (weekStartDate, exceptionData) => {
    try {
      let routine = routines[weekStartDate];
      if (!routine) {
        // Create a minimal routine if it doesn't exist
        routine = {
          weekStartDate,
          mode: 'regular',
          dailyRoutines: {},
          weekException: exceptionData
        };
        // Use POST to create new routine
        await ApiService.upsertRoutine(weekStartDate, routine);
      } else {
        // Use PUT to update existing routine
        routine.weekException = exceptionData;
        await ApiService.updateRoutine(weekStartDate, { weekException: exceptionData });
      }
      
      await load();
    } catch (e) {
      console.error('Failed to save exception:', e);
      alert('Failed to save exception. Please try again.');
    }
  };

  const toggleFlag = async (weekStartDate) => {
    try {
      const routine = routines[weekStartDate];
      const isFlagged = routine?.weekException && typeof routine.weekException === 'object';
      
      if (isFlagged) {
        // Unflag - remove exception via PUT
        if (routine) {
          await ApiService.updateRoutine(weekStartDate, { weekException: null });
        }
        await load();
      } else {
        // Flag - create minimal exception
        const exceptionData = {
          summary: '',
          prepTasks: [],
          scheduleNotes: ''
        };
        await saveException(weekStartDate, exceptionData);
        // Expand to edit
        setExpandedWeek(weekStartDate);
      }
    } catch (e) {
      console.error('Failed to toggle flag:', e);
      alert('Failed to update week flag. Please try again.');
    }
  };

  const toggleExpand = (weekStartDate) => {
    setExpandedWeek(expandedWeek === weekStartDate ? null : weekStartDate);
  };

  const WeekCard = ({ week }) => {
    const routine = routines[week.weekStartDate];
    const isFlagged = routine?.weekException && typeof routine.weekException === 'object';
    const isCurrent = week.timing === 'current';
    const isNext = week.timing === 'nextWeek';
    const isExpanded = expandedWeek === week.start;
    
    const [summary, setSummary] = useState(isFlagged ? (routine?.weekException?.summary || '') : '');
    const [prepTasks, setPrepTasks] = useState(
      isFlagged && routine?.weekException?.prepTasks 
        ? routine.weekException.prepTasks.map(t => t?.text || '')
        : ['']
    );
    const [scheduleNotes, setScheduleNotes] = useState(
      isFlagged ? (routine?.weekException?.scheduleNotes || '') : ''
    );

    // Sync form when routine changes
    useEffect(() => {
      if (routine?.weekException) {
        setSummary(routine.weekException.summary || '');
        setPrepTasks(
          routine.weekException.prepTasks?.map(t => t?.text || '') || ['']
        );
        setScheduleNotes(routine.weekException.scheduleNotes || '');
      }
    }, [routine?.weekException]);

    const handleSave = async () => {
      if (summary.trim()) {
        const exceptionData = {
          summary: summary.trim(),
          prepTasks: prepTasks
            .filter(t => t.trim())
            .map((text, i) => ({ id: `prep-${i}`, text: text.trim(), done: false })),
          scheduleNotes: scheduleNotes.trim()
        };
        await saveException(week.weekStartDate, exceptionData);
        setExpandedWeek(null);
      }
    };

    return (
      <div 
        style={{
          position: 'relative',
          marginBottom: '16px',
          paddingLeft: '48px'
        }}
      >
        {/* Timeline dot */}
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '12px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: isFlagged ? '#FCD34D' : 
                     isCurrent ? '#9D4EDD' : 
                     'white',
          border: `2px solid ${isFlagged ? '#F59E0B' : 
                               isCurrent ? '#9D4EDD' : 
                               '#E5E5E5'}`,
          zIndex: 1
        }} />

        {/* Week card */}
        <div 
          onClick={() => toggleExpand(week.start)}
          style={{
            background: isFlagged ? '#FFFBEB' : 'white',
            border: `2px solid ${isFlagged ? '#FCD34D' : '#E5E5E5'}`,
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#2D3748',
                marginBottom: '4px'
              }}>
                {formatWeekDates(week.start)}
              </div>
              <div style={{
                fontSize: '12px',
                color: isCurrent ? '#9D4EDD' : 
                       isNext ? '#F59E0B' : 
                       '#9A938E',
                fontWeight: isCurrent || isNext ? 600 : 400,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                {week.label}
              </div>
              
              {isFlagged && routine?.weekException?.summary && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#92400E',
                  fontWeight: 500
                }}>
                  ⚠️ {routine.weekException.summary}
                </div>
              )}
            </div>

            <label 
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: isFlagged ? '#92400E' : '#9A938E',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                background: isFlagged ? '#FEF3C7' : '#F3F4F6'
              }}
            >
              <input 
                type="checkbox"
                checked={isFlagged}
                onChange={() => toggleFlag(week.start)}
                style={{ cursor: 'pointer' }}
              />
              {isFlagged ? 'Hard' : 'Flag'}
            </label>
          </div>

          {/* Expanded form */}
          {isExpanded && isFlagged && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #FCD34D' }}
            >
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Brief summary: Handover Tuesday • Grandma away"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #FCD34D',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '12px'
                }}
              />

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#6B7280' }}>
                  Prep Tasks:
                </div>
                {prepTasks.map((task, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <input
                      value={task}
                      onChange={(e) => {
                        const updated = [...prepTasks];
                        updated[idx] = e.target.value;
                        setPrepTasks(updated);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="e.g., Ask grandpa to pick up kids"
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrepTasks(prepTasks.filter((_, i) => i !== idx));
                      }}
                      style={{
                        padding: '8px',
                        background: '#FEE2E2',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrepTasks([...prepTasks, '']);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#F3F4F6',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Task
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#6B7280' }}>
                  Schedule Notes (optional):
                </div>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="Mon-Wed: Office&#10;Tue 5:55pm: Leave for delivery"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    minHeight: '80px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#9D4EDD',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedWeek(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ 
        marginTop: 0, 
        color: '#2D3748', 
        fontSize: '24px',
        marginBottom: '8px'
      }}>
        Plan Ahead
      </h2>
      <p style={{ 
        color: '#6B7280', 
        fontSize: '14px',
        marginBottom: '24px'
      }}>
        Flag hard weeks and add prep notes
      </p>

      {loading ? (
        <div style={{ color: '#9A938E', textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Vertical timeline line */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '12px',
            bottom: '12px',
            width: '2px',
            background: 'linear-gradient(to bottom, #E5E5E5 0%, #E5E5E5 100%)'
          }} />

          {upcomingWeeks.map((week) => (
            <WeekCard
              key={week.weekStartDate}
              week={week}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => onNavigate && onNavigate('routines')}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          right: '20px',
          padding: '12px',
          background: 'white',
          border: '2px solid #E5E5E5',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Back to Routines
      </button>
    </div>
  );
}
