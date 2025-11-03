import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';

function getCurrentSectionKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'afterSchool';
  if (hour >= 15 && hour < 18) return 'afterSchool';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'nextDay';
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function TodayView({ onBack, selectedDayKey, onNavigate }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const currentWeekMonday = getMonday(today);
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksDiff = Math.floor((currentWeekMonday - referenceWeekStart) / msPerWeek);
        const hasKids = custodySettings.currentWeekHasKids ? 
          (weeksDiff % 2 === 0) : 
          (weeksDiff % 2 === 1);
        
        if (hasKids) {
          return { 
            hasKids: true, 
            display: '👨‍👩‍👧‍👦 Kids with you Mon afternoon - Mon morning'
          };
        } else {
          return { 
            hasKids: false, 
            display: '🏠 Kids at dad\'s this week'
          };
        }
      }
      
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    } catch (e) {
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    }
  };

  const getModeInfo = (mode, hasKids) => {
    if (hasKids) {
      const kidsModesMap = {
        regular: { emoji: '🟢', name: 'Regular', desc: 'Normal routine mode' },
        hard: { emoji: '🟡', name: 'Hard', desc: "You're in Hard Mode." },
        hardest: { emoji: '🔴', name: 'Survival', desc: "You're in Survival Mode." }
      };
      return kidsModesMap[mode] || kidsModesMap.regular;
    } else {
      const soloModesMap = {
        regular: { emoji: '🟢', name: 'Regular Solo', desc: 'Balanced recovery and prep week' },
        hard: { emoji: '🟡', name: 'Recovery', desc: "You're in Recovery Mode." },
        hardest: { emoji: '🔴', name: 'Hustle', desc: "You're in Hustle Mode." }
      };
      return soloModesMap[mode] || soloModesMap.regular;
    }
  };

  const getExceptionData = () => {
    const weekException = routine?.weekException;
    if (!weekException) return null;
    if (typeof weekException === 'string') return null; // Legacy format
    return weekException;
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCurrentRoutine();
      setRoutine(data);
      setError(null);
    } catch (e) {
      setRoutine(null);
      setError('No current routine. Switch Mode to start.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const todayKey = useMemo(() => {
    const day = new Date().getDay();
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][day];
  }, []);

  const displayDayKey = selectedDayKey || todayKey;

  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDay();
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][day];
  }, []);

  const currentSection = getCurrentSectionKey();
  const custodyInfo = getCustodyInfo();
  const mode = routine?.mode || 'regular';
  const modeInfo = getModeInfo(mode, custodyInfo.hasKids);
  const exceptionData = getExceptionData();

  const toggleTask = async (dayKey, section, taskIndex) => {
    if (!routine?.weekStartDate) return;
    
    try {
      const updated = { ...routine };
      const task = updated.dailyRoutines[dayKey].tasks[section][taskIndex];
      task.completed = !task.completed;
      
      await ApiService.updateRoutine(routine.weekStartDate, { dailyRoutines: updated.dailyRoutines });
      await load();
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const hasIncompleteTasks = (section) => {
    const tasks = routine?.dailyRoutines?.[displayDayKey]?.tasks?.[section] || [];
    return tasks.some(t => !t.completed);
  };

  // Calculate the date for the displayed day
  const getDisplayDate = () => {
    if (!routine?.weekStartDate) return formatDate(new Date());
    
    if (selectedDayKey && selectedDayKey !== todayKey) {
      const weekStart = new Date(routine.weekStartDate);
      const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
      const dayIndex = dayOrder.indexOf(selectedDayKey);
      if (dayIndex >= 0) {
        const selectedDate = new Date(weekStart);
        selectedDate.setDate(weekStart.getDate() + dayIndex);
        return formatDate(selectedDate);
      }
    }
    return formatDate(new Date());
  };

  const headerDate = getDisplayDate();

  // Helper: Render tasks directly (no collapse)
  const renderTasksExpanded = (section, dayKeyOverride = null) => {
    const dayKey = dayKeyOverride || displayDayKey;
    const tasks = routine?.dailyRoutines?.[dayKey]?.tasks?.[section] || [];
    
    if (tasks.length === 0) return null;

    return tasks.map((task, idx) => (
      <label
        key={idx}
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '8px',
          cursor: 'pointer',
          alignItems: 'start'
        }}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(dayKey, section, idx)}
          style={{ marginTop: '2px', cursor: 'pointer' }}
        />
        <span style={{
          fontSize: '14px',
          color: task.completed ? '#9A938E' : '#2D3748',
          textDecoration: task.completed ? 'line-through' : 'none',
          lineHeight: 1.5
        }}>
          {task.text}
        </span>
      </label>
    ));
  };

  const handleNavigate = (screen) => {
    if (onNavigate) {
      onNavigate(screen);
    } else if (screen === 'routines-home' && onBack) {
      onBack();
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#2D3748' }}>
          Today
        </h2>
        <button 
          onClick={() => {
            if (onNavigate) {
              onNavigate('routines-week');
            } else if (onBack) {
              onBack();
            }
          }}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Full Week →
        </button>
      </div>

      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>}

      {routine && (
        <>
          {/* Date + Mode */}
          <div style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '16px'
          }}>
            {headerDate} · {modeInfo.emoji} {modeInfo.name}
          </div>

          {/* Special Week Alert (if exists) */}
          {exceptionData && (
            <div style={{
              background: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#92400E',
                marginBottom: '4px'
              }}>
                ⚠️ Special Week
              </div>
              <div style={{ fontSize: '12px', color: '#B45309' }}>
                {exceptionData.summary}
              </div>
              <button
                onClick={() => handleNavigate('routines')}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#92400E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View full alert & prep tasks
              </button>
            </div>
          )}

          {/* Right Now Section */}
          {currentSection !== 'nextDay' && (!selectedDayKey || selectedDayKey === todayKey) && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(157,78,221,0.1), rgba(255,107,203,0.1))',
              border: '2px solid rgba(157,78,221,0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#9D4EDD',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px'
              }}>
                ⚡ Right Now
              </div>
              {renderTasksExpanded(currentSection)}
            </div>
          )}

          {/* Coming Up Sections (auto-expanded) */}
          {(() => {
            if (selectedDayKey && selectedDayKey !== todayKey) {
              // Viewing a past/future day - show all sections
              return ['morning', 'afterSchool', 'evening'].map(section => {
                const tasks = routine?.dailyRoutines?.[displayDayKey]?.tasks?.[section] || [];
                if (tasks.length === 0) return null;

                return (
                  <div key={section} style={{
                    background: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4B5563',
                      marginBottom: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {section === 'afterSchool' ? 'After School' : section}
                    </div>
                    {renderTasksExpanded(section)}
                  </div>
                );
              });
            }

            if (currentSection === 'nextDay') {
              // Sunday evening - show remaining tasks and tomorrow preview
              const incompleteSections = ['morning', 'afterSchool', 'evening'].filter(section => {
                const tasks = routine?.dailyRoutines?.[displayDayKey]?.tasks?.[section] || [];
                return tasks.some(t => !t.completed);
              });

              return (
                <>
                  {incompleteSections.length > 0 && (
                    <>
                      <div style={{
                        fontSize: '12px',
                        color: '#9A938E',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        marginBottom: '8px'
                      }}>
                        Still to do today
                      </div>
                      {incompleteSections.map(section => (
                        <div key={section} style={{
                          background: 'white',
                          border: '1px solid #E5E5E5',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#4B5563',
                            marginBottom: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {section === 'afterSchool' ? 'After School' : section}
                          </div>
                          {renderTasksExpanded(section)}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Tomorrow Preview */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E5E5E5',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                      marginBottom: '12px'
                    }}>
                      Tomorrow Morning Preview
                    </div>
                    {renderTasksExpanded('morning', tomorrowKey)}
                  </div>
                </>
              );
            }

            // Normal day - show Right Now + Coming Up
            return ['morning', 'afterSchool', 'evening']
              .filter(s => s !== currentSection && hasIncompleteTasks(s))
              .map(section => (
                <div key={section} style={{
                  background: 'white',
                  border: '1px solid #E5E5E5',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#4B5563',
                    marginBottom: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {section === 'afterSchool' ? 'After School' : section}
                  </div>
                  {renderTasksExpanded(section)}
                </div>
              ));
          })()}
        </>
      )}
    </div>
  );
}
