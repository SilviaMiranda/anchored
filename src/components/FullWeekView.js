import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

export default function FullWeekView({ onBack, onOpenDay }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [mode, setMode] = useState('regular');

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

  const getModeInfo = (mode, hasKids) => {
    if (hasKids) {
      const kidsModesMap = {
        regular: { emoji: '🟢', name: 'Regular', desc: 'Normal routine mode' },
        hard: { emoji: '🟡', name: 'Hard', desc: "You're in Hard Mode. Screens unlimited, easy meals fine, homework optional. This is smart adaptation." },
        hardest: { emoji: '🔴', name: 'Hardest', desc: "You're in Survival Mode. Only goal: everyone alive and fed. You're doing GREAT." }
      };
      return kidsModesMap[mode] || kidsModesMap.regular;
    } else {
      const soloModesMap = {
        regular: { emoji: '🟢', name: 'Regular Solo', desc: 'Balanced recovery and prep week' },
        hard: { emoji: '🟡', name: 'Recovery', desc: "You're in Recovery Mode. Extra rest this week. Sleep in, take it easy, no guilt." },
        hardest: { emoji: '🔴', name: 'Hustle', desc: "You're in Hustle Mode. Prepping hard for next kids week. Batch cooking, organizing, getting ahead!" }
      };
      return soloModesMap[mode] || soloModesMap.regular;
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCurrentRoutine();
      setRoutine(data);
      setMode(data.mode || 'regular');
      setError(null);
    } catch (e) {
      setError('No routine for this week.');
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleTask = async (day, section, taskIndex) => {
    if (!routine?.weekStartDate) return;
    
    try {
      const updated = { ...routine };
      const task = updated.dailyRoutines[day].tasks[section][taskIndex];
      task.completed = !task.completed;
      
      await ApiService.updateRoutine(routine.weekStartDate, updated);
      await load();
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
  const custodyInfo = getCustodyInfo();
  const modeInfo = getModeInfo(mode, custodyInfo.hasKids);

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
            <span>{modeInfo.emoji} {modeInfo.name}</span>
            <span>{custodyInfo.display}</span>
          </div>

          {/* Days */}
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
            const dayData = routine?.dailyRoutines?.[day];
            const isToday = day === todayKey;
            const totalTasks = ['morning', 'afterSchool', 'evening']
              .reduce((sum, section) => sum + (dayData?.tasks?.[section]?.length || 0), 0);
            const doneTasks = ['morning', 'afterSchool', 'evening']
              .reduce((sum, section) => 
                sum + (dayData?.tasks?.[section]?.filter(t => t.completed).length || 0), 0);

            if (!dayData) return null;

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
                      const tasks = dayData?.tasks?.[section] || [];
                      if (tasks.length === 0) return null;

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
                                checked={task.completed}
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
