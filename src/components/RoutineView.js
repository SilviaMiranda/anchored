import React, { useEffect, useState } from 'react';
import Api from '../services/api';
import ModeSelector from './ModeSelector';
import DailyTaskList from './DailyTaskList';
import WeeklyCalendar from './WeeklyCalendar';
import PrepChecklist from './PrepChecklist';
import RoutineTemplateLibrary from './RoutineTemplateLibrary';

export default function RoutineView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [mode, setMode] = useState('regular');
  const [showTemplates, setShowTemplates] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await Api.getCurrentRoutine();
      setRoutine(data);
      setMode(data.mode || 'regular');
      setError(null);
    } catch (e) {
      setError('No current routine found. Create one from a template.');
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleModeChange = async (nextMode) => {
    setMode(nextMode);
    if (!routine?.weekStartDate) return;
    try {
      await Api.updateRoutine(routine.weekStartDate, { mode: nextMode });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (dayKey, section, task) => {
    if (!routine) return;
    const updated = { ...routine };
    const tasks = updated.dailyRoutines?.[dayKey]?.tasks?.[section] || [];
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) tasks[idx] = { ...tasks[idx], completed: !tasks[idx].completed };
    try {
      await Api.updateRoutine(updated.weekStartDate, { dailyRoutines: updated.dailyRoutines });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const getMondayOfCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    return monday.toISOString().slice(0, 10);
  };

  const buildRoutineFromTemplate = (tplId, tpl) => {
    const weekStartDate = getMondayOfCurrentWeek();
    const start = new Date(weekStartDate);
    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);
    const weekEndDate = weekEnd.toISOString().slice(0, 10);

    const makeTasks = (arr = []) => (arr || []).map((t, idx) => ({ id: `${tplId}-${idx}-${Math.random().toString(36).slice(2, 7)}`, text: t.text, completed: false }));

    const dailyRoutines = Object.fromEntries(Object.entries(tpl.days || {}).map(([day, sections]) => ([
      day,
      {
        date: '',
        tasks: {
          morning: makeTasks(sections.morning || sections.daily),
          afterSchool: makeTasks(sections.afterSchool || sections.day || sections.afternoon),
          evening: [
            ...makeTasks(sections.evening),
            ...makeTasks(sections.tasks)
          ],
          parentTasks: makeTasks(sections.parentTasks)
        },
        notes: sections.notes || '',
        mood: null
      }
    ])));

    return {
      weekStartDate,
      weekEndDate,
      mode: tpl.mode || 'regular',
      kidsWithUser: !!tpl.kidsPresent,
      dailyRoutines
    };
  };

  const applyTemplate = async (tplId, tpl) => {
    try {
      const newRoutine = buildRoutineFromTemplate(tplId, tpl);
      await Api.upsertRoutine(newRoutine.weekStartDate, newRoutine);
      setShowTemplates(false);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#9D4EDD' }}>Weekly Routine</h2>
      {loading && <div style={{ color: '#9A938E' }}>Loading...</div>}
      {error && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
          {error}
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => setShowTemplates(true)} style={{ padding: '10px 12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', fontWeight: 600, color: 'white' }}>Create from Template</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {mode === 'hard' && (
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0C4A6E', padding: '12px', borderRadius: '12px' }}>
            You're in Hard Mode. Screens unlimited, easy meals fine, homework optional. This is smart adaptation.
          </div>
        )}
        {mode === 'hardest' && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#7F1D1D', padding: '12px', borderRadius: '12px' }}>
            You're in Survival Mode. Only goal: everyone alive and fed. You're doing GREAT.
          </div>
        )}
        <ModeSelector mode={mode} onChange={handleModeChange} />
        <WeeklyCalendar weekStartDate={routine?.weekStartDate} mode={mode} dailyRoutines={routine?.dailyRoutines} />
        {routine?.weekStartDate && (
          <PrepChecklist weekId={routine.weekStartDate} />
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowTemplates((v) => !v)} style={{ padding: '10px 12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', fontWeight: 600, color: 'white' }}>Create from Template</button>
          <button onClick={() => onNavigate && onNavigate('routines-upcoming')} style={{ padding: '10px 12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)', fontWeight: 600, color: 'white' }}>Upcoming</button>
          <button onClick={() => onNavigate && onNavigate('routines-kids')} style={{ padding: '10px 12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)', fontWeight: 600, color: 'white' }}>Kids View</button>
        </div>
      </div>

      {showTemplates && (
        <div style={{ marginTop: '12px' }}>
          <RoutineTemplateLibrary onApply={applyTemplate} />
        </div>
      )}

      {routine && (
        <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
          {dayOrder.map((d) => {
            const day = routine.dailyRoutines?.[d];
            if (!day) return null;
            return (
              <div key={d} style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
                <h3 style={{ margin: 0, marginBottom: '8px', color: '#4D96FF', textTransform: 'capitalize' }}>{d}</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <DailyTaskList title="Morning" tasks={day.tasks?.morning || []} onToggle={(t) => toggleTask(d, 'morning', t)} />
                  <DailyTaskList title="After School" tasks={day.tasks?.afterSchool || []} onToggle={(t) => toggleTask(d, 'afterSchool', t)} />
                  <DailyTaskList title="Evening" tasks={day.tasks?.evening || []} onToggle={(t) => toggleTask(d, 'evening', t)} />
                  <DailyTaskList title="Parent Tasks" tasks={day.tasks?.parentTasks || []} onToggle={(t) => toggleTask(d, 'parentTasks', t)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


