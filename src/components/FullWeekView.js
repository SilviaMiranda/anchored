import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import { getWeekInfo } from '../utils/getWeekInfo';

export default function FullWeekView({ onBack, onOpenDay }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  // Use unified helper for week info (checks exception first)
  const weekInfo = routine ? getWeekInfo(routine) : null;

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCurrentRoutine();
      setRoutine(data);
      setError(null);
      // Debug: log routine structure
      if (data && !data.dailyRoutines) {
        console.warn('Routine loaded but dailyRoutines is missing:', data);
      }
    } catch (e) {
      setError('No routine for this week.');
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleTask = async (day, section, taskIndex) => {
    if (!routine?.weekStartDate || !routine?.dailyRoutines?.[day]?.tasks?.[section]) return;
    
    try {
      const updated = { ...routine };
      if (!updated.dailyRoutines[day].tasks[section][taskIndex]) return;
      
      const task = updated.dailyRoutines[day].tasks[section][taskIndex];
      task.completed = !task.completed;
      
      await ApiService.updateRoutine(routine.weekStartDate, { dailyRoutines: updated.dailyRoutines });
      await load();
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#2D3748' }}>
          Full Week
        </h2>
        <button onClick={onBack} style={{
          padding: '8px 16px',
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          ← Back
        </button>
      </div>

      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>}

      {routine && (
        <>
          {/* Week overview */}
          {weekInfo && (
            <div style={{
              background: '#F8FAFC',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#6B7280'
            }}>
              <span>{weekInfo.modeDisplay.emoji} {weekInfo.modeDisplay.name}</span>
              <span>{weekInfo.custodyDisplay}</span>
            </div>
          )}

          {/* Days */}
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
            const dayData = routine?.dailyRoutines?.[day];
            const isToday = day === todayKey;
            
            // Calculate tasks safely
            let totalTasks = 0;
            let doneTasks = 0;
            
            if (dayData && dayData.tasks) {
              ['morning', 'afterSchool', 'evening'].forEach(section => {
                const tasks = dayData.tasks[section] || [];
                if (Array.isArray(tasks)) {
                  totalTasks += tasks.length;
                  doneTasks += tasks.filter(t => t && t.completed).length;
                }
              });
            }

            return (
              <div
                key={day}
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                style={{
                  background: isToday ? '#F5F3FF' : 'white',
                  border: `2px solid ${isToday ? '#9D4EDD' : '#E5E5E5'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
              >
                {/* Day header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#2D3748',
                        textTransform: 'capitalize'
                      }}>
                        {day}
                      </h3>
                      {isToday && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#9D4EDD',
                          background: '#F5F3FF',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6B7280'
                    }}>
                      {doneTasks} of {totalTasks} done
                    </div>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    color: '#9A938E',
                    transition: 'transform 0.2s',
                    transform: expandedDay === day ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                </div>
                </div>

                {/* Expanded tasks - ALL sections visible at once */}
                {expandedDay === day && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E5E5' }}>
                    {['morning', 'afterSchool', 'evening'].map(section => {
                      if (!dayData || !dayData.tasks) return null;
                      const tasks = dayData.tasks[section] || [];
                      if (!Array.isArray(tasks) || tasks.length === 0) return null;

                      return (
                        <div key={section} style={{ marginBottom: '20px' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#4B5563',
                            marginBottom: '10px',
                            textTransform: 'capitalize'
                          }}>
                            {section === 'afterSchool' ? 'After School' : section}
                          </div>
                          {tasks.map((task, idx) => (
                            <label
                              key={idx}
                              onClick={(e) => e.stopPropagation()}
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
                                onChange={() => toggleTask(day, section, idx)}
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
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
