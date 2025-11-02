import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Square, CheckSquare, Lightbulb } from 'lucide-react';
import ApiService from '../services/api';

function getCurrentSectionKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'afterSchool'; // transition mapped to afterSchool
  if (hour >= 15 && hour < 18) return 'afterSchool';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'nextDay';
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function TodayView({ onBack }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showMealSuggestions, setShowMealSuggestions] = useState({});

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

  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDay();
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][day];
  }, []);

  const currentSection = getCurrentSectionKey();

  useEffect(() => {
    setExpanded({ [currentSection]: true });
  }, [currentSection]);

  const toggleTask = async (section, task) => {
    if (!routine) return;
    const updated = { ...routine };
    const tasks = updated.dailyRoutines?.[todayKey]?.tasks?.[section] || [];
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) tasks[idx] = { ...tasks[idx], completed: !tasks[idx].completed };
    try {
      await ApiService.updateRoutine(updated.weekStartDate, { dailyRoutines: updated.dailyRoutines });
      await load();
    } catch (e) {}
  };

  const markSectionDone = async (section) => {
    if (!routine) return;
    const updated = { ...routine };
    const tasks = updated.dailyRoutines?.[todayKey]?.tasks?.[section] || [];
    updated.dailyRoutines[todayKey].tasks[section] = tasks.map((t) => ({ ...t, completed: true }));
    try {
      await ApiService.updateRoutine(updated.weekStartDate, { dailyRoutines: updated.dailyRoutines });
      await load();
    } catch (e) {}
  };

  const renderTasks = (sectionKey, title, dayKeyOverride = null) => {
    const dayKey = dayKeyOverride || todayKey;
    const items = routine?.dailyRoutines?.[dayKey]?.tasks?.[sectionKey] || [];
    const count = items.length;
    const isExpanded = !!expanded[sectionKey];
    if (count === 0) return null;
    return (
      <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
        <div onClick={() => setExpanded((s) => ({ ...s, [sectionKey]: !s[sectionKey] }))} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600, fontSize: '18px', color: '#2D3748' }}>{title}</div>
          <div style={{ color: '#9A938E', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>{count} tasks {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} style={{ transform: 'rotate(180deg)' }} />}</div>
        </div>
        {isExpanded && (
          <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
            {items.map((t) => {
              const isDinner = t.text.toLowerCase().includes('dinner');
              const taskKey = `${sectionKey}-${t.id}`;
              return (
                <div key={t.id}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                    {t.completed ? <CheckSquare size={20} color="#10B981" strokeWidth={2} /> : <Square size={20} color="#9A938E" strokeWidth={2} />}
                    <input type="checkbox" checked={!!t.completed} onChange={() => toggleTask(sectionKey, t)} style={{ display: 'none' }} />
                    <div style={{ flex: 1, fontSize: '16px', color: t.completed ? '#9A938E' : '#2D3748', textDecoration: t.completed ? 'line-through' : 'none' }}>{shortText(t.text)}</div>
                  </label>
                  {isDinner && !t.completed && (
                    <div style={{ marginLeft: '30px', marginTop: '4px' }}>
                      <button onClick={() => setShowMealSuggestions({ ...showMealSuggestions, [taskKey]: !showMealSuggestions[taskKey] })} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E5E5E5', background: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280' }}>
                        <Lightbulb size={14} /> Need meal ideas?
                      </button>
                      {showMealSuggestions[taskKey] && (
                        <div style={{ marginTop: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
                          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#2D3748' }}>Easy Meal Ideas</div>
                          <div style={{ fontSize: '14px', color: '#4B5563', marginBottom: '6px' }}><strong>Ultra-Simple:</strong> Rotisserie chicken + salad, Pasta + jar sauce, Frozen pizza, Quesadillas, Cereal</div>
                          <div style={{ fontSize: '14px', color: '#4B5563', marginBottom: '6px' }}><strong>Simple:</strong> Tacos, Stir fry, Grilled cheese + soup, Breakfast for dinner</div>
                          <div style={{ fontSize: '14px', color: '#4B5563' }}><strong>Takeout:</strong> Pizza, Chinese, Burgers</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => markSectionDone(sectionKey)} style={{ marginTop: '6px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E5E5E5', background: 'white', fontWeight: 600 }}>Mark Section Done</button>
          </div>
        )}
      </div>
    );
  };

  const shortText = (txt = '') => {
    const noParen = txt.split('(')[0].trim();
    return noParen.length > 32 ? noParen.slice(0, 32) + '…' : noParen;
  };

  const now = new Date();
  const headerDate = formatDate(now);
  const mode = routine?.mode || 'regular';
  const kidsWeek = routine?.kidsWithUser !== false;

  // Get correct mode display
  const getModeDisplay = () => {
    if (kidsWeek) {
      if (mode === 'regular') return { emoji: '🟢', name: 'Regular' };
      if (mode === 'hard') return { emoji: '🟡', name: 'Hard' };
      if (mode === 'hardest') return { emoji: '🔴', name: 'Survival' };
    } else {
      if (mode === 'regular') return { emoji: '🟢', name: 'Regular Solo' };
      if (mode === 'hard') return { emoji: '🟡', name: 'Recovery' };
      if (mode === 'hardest') return { emoji: '🔴', name: 'Hustle' };
    }
    return { emoji: '🟢', name: 'Regular' };
  };

  const modeInfo = getModeDisplay();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontSize: '24px', fontWeight: 700 }}>Today</h2>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #E5E5E5', background: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={18} />Back</button>
      </div>

      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px' }}>{error}</div>}

      {routine && (
        <>
          <div style={{ marginBottom: '8px', color: '#6B7280', fontSize: '14px' }}>{headerDate}</div>
          <div style={{ marginBottom: '16px', color: '#2D3748', fontWeight: 700 }}>
            {modeInfo.emoji} {modeInfo.name}
          </div>

          {/* Current Day Tasks - Even if outside main hours */}
          {currentSection === 'nextDay' ? (
            <>
              {/* Show remaining sections from today if any incomplete */}
              {['morning', 'afterSchool', 'evening'].map(section => {
                const tasks = routine?.dailyRoutines?.[todayKey]?.tasks?.[section] || [];
                const incompleteTasks = tasks.filter(t => !t.completed);
                if (incompleteTasks.length === 0) return null;
                
                return (
                  <div key={section} style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9A938E',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Still to do today
                    </div>
                    {renderTasks(section, sectionTitle(section))}
                  </div>
                );
              })}
              
              {/* Next Day Preview */}
              <div style={{
                fontSize: '12px',
                color: '#9A938E',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '24px',
                marginBottom: '8px'
              }}>
                Tomorrow preview
              </div>
              {renderTasks('morning', 'Morning', tomorrowKey)}
            </>
          ) : (
            <>
              {/* RIGHT NOW section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, rgba(157,78,221,0.1), rgba(255,107,203,0.1))',
                  border: '1px solid rgba(157,78,221,0.3)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#9D4EDD',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  ⚡ Right Now
                </div>
                {renderTasks(currentSection, sectionTitle(currentSection))}
              </div>

              {/* Coming Up Today */}
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#9A938E',
                textTransform: 'uppercase',
                marginTop: '24px',
                marginBottom: '12px'
              }}>
                Coming Up Today
              </div>
              {['morning','afterSchool','evening'].filter(s => s !== currentSection).map(s => 
                <div key={s} style={{ marginBottom: '12px' }}>
                  {renderTasks(s, sectionTitle(s))}
                </div>
              )}
            </>
          )}

        </>
      )}
    </div>
  );
}

function sectionTitle(key) {
  if (key === 'morning') return 'Morning';
  if (key === 'afterSchool') return 'After School';
  if (key === 'evening') return 'Evening';
  return 'Tasks';
}


