import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';
import { getWeekInfo } from '../utils/getWeekInfo';

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
  const [collapsedSections, setCollapsedSections] = useState({
    morning: false,
    afterSchool: false,
    evening: false,
    tomorrow: true
  });

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
      // Debug: log routine structure (only if issues)
      if (data && !data.dailyRoutines) {
        console.warn('Routine loaded but dailyRoutines is missing:', data);
      }
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

  // Get week info using unified helper (checks exception first)
  const weekInfo = getWeekInfo(routine);
  const modeInfo = weekInfo.modeDisplay;
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
    if (!routine || !routine.dailyRoutines) return null;
    
    const dayData = routine.dailyRoutines[dayKey];
    if (!dayData || !dayData.tasks) return null;
    
    const tasks = dayData.tasks[section];
    if (!Array.isArray(tasks) || tasks.length === 0) return null;

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
          checked={task.completed || false}
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

  // Helper: Render a section with title (supports collapse)
  const renderSection = (section, isRightNow, dayKeyOverride = null) => {
    const dayKey = dayKeyOverride || displayDayKey;
    if (!routine || !routine.dailyRoutines) return null;
    
    const dayData = routine.dailyRoutines[dayKey];
    if (!dayData || !dayData.tasks) return null;
    
    const tasks = dayData.tasks[section];
    if (!Array.isArray(tasks) || tasks.length === 0) return null;
    
    const title = section === 'afterSchool' ? 'After School' : 
                  section.charAt(0).toUpperCase() + section.slice(1);
    
    const isCollapsed = !isRightNow && collapsedSections[section];
    const incompleteTasks = tasks.filter(t => !t.completed).length;

    return (
      <div key={section} style={{
        background: isRightNow 
          ? 'linear-gradient(135deg, rgba(157,78,221,0.1), rgba(255,107,203,0.1))'
          : 'white',
        border: isRightNow 
          ? '2px solid rgba(157,78,221,0.3)'
          : '1px solid #E5E5E5',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div
          onClick={() => !isRightNow && setCollapsedSections({...collapsedSections, [section]: !isCollapsed})}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isCollapsed ? 0 : '12px',
            cursor: isRightNow ? 'default' : 'pointer'
          }}
        >
          <div>
            {isRightNow && (
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#9D4EDD',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                ⚡ Right Now
                        </div>
                      )}
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#4B5563',
              textTransform: 'capitalize'
            }}>
              {title}
              {isCollapsed && (
                <span style={{ fontSize: '13px', color: '#9A938E', marginLeft: '8px', fontWeight: 400 }}>
                  ({incompleteTasks} incomplete)
                </span>
                  )}
                </div>
          </div>
          {!isRightNow && (
            <div style={{ fontSize: '16px', color: '#9A938E' }}>
              {isCollapsed ? '▶' : '▼'}
          </div>
        )}
        </div>

        {!isCollapsed && tasks.map((task, idx) => (
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
              checked={task.completed || false}
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
        ))}
      </div>
    );
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              if (onNavigate) {
                onNavigate('routines');
              }
            }}
            style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Routines
          </button>
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
      </div>

      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          {error}
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('routines-templates');
                }
              }}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Create Routine
            </button>
          </div>
        </div>
      )}

      {routine && !routine.dailyRoutines && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          Routine exists but has no daily routines. Switch Mode to create tasks from a template.
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('routines');
                }
              }}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Switch Mode
            </button>
          </div>
        </div>
      )}

      {routine && routine.dailyRoutines && !routine.dailyRoutines[displayDayKey] && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          Routine exists but has no tasks for {displayDayKey.charAt(0).toUpperCase() + displayDayKey.slice(1)}. 
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#92400E' }}>
            Available days: {Object.keys(routine.dailyRoutines).join(', ')}
          </div>
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('routines');
                }
              }}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Switch Mode to Recreate
            </button>
          </div>
        </div>
      )}

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
                onClick={() => {
                  if (onNavigate) {
                    // Navigate to routines with alert expanded
                    onNavigate('routines', { expandAlert: true });
                  }
                }}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#92400E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                View prep tasks →
              </button>
            </div>
          )}

          {/* Current Section Tasks - Normal day view */}
          {currentSection !== 'nextDay' && (!selectedDayKey || selectedDayKey === todayKey) && (
            <>
              {/* Right Now Section */}
              {renderSection(currentSection, true)}
              
              {/* Other sections - show ALL, not just incomplete */}
              {['morning', 'afterSchool', 'evening']
                .filter(s => s !== currentSection)
                .map(section => renderSection(section, false))}
            </>
          )}

          {/* Viewing past/future day - show all sections */}
          {selectedDayKey && selectedDayKey !== todayKey && (
            <>
              {['morning', 'afterSchool', 'evening'].map(section => renderSection(section, false))}
            </>
          )}

          {/* Tomorrow Preview - Sunday evening (after 10pm) */}
          {currentSection === 'nextDay' && (!selectedDayKey || selectedDayKey === todayKey) && (
            <>
              {/* Show ALL remaining sections for today, not just incomplete */}
              {(() => {
                const remainingSections = ['morning', 'afterSchool', 'evening'].filter(section => {
                  const dayData = routine?.dailyRoutines?.[displayDayKey];
                  const tasks = dayData?.tasks?.[section] || [];
                  return tasks && tasks.length > 0;
                });
                
                if (remainingSections.length > 0) {
                  return (
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
                      {remainingSections.map(section => renderSection(section, false))}
                    </>
                  );
                }
                return null;
              })()}

              {/* Tomorrow Preview - Collapsible */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E5E5E5',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => setCollapsedSections({...collapsedSections, tomorrow: !collapsedSections.tomorrow})}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6B7280'
                  }}>
                    Tomorrow Morning Preview
                  </div>
                  <div style={{ fontSize: '16px', color: '#9A938E' }}>
                    {collapsedSections.tomorrow ? '▶' : '▼'}
            </div>
          </div>
                {!collapsedSections.tomorrow && (
                  <div style={{ marginTop: '12px' }}>
                    {renderTasksExpanded('morning', tomorrowKey)}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
