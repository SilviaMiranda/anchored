import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ApiService from '../services/api';

export default function TemplateSelection({ onBack, onStarted }) {
  const [loading, setLoading] = useState(false);

  const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    return monday.toISOString().slice(0, 10);
  };

  /**
   * Determines if current week has kids based on custody settings
   * Returns { hasKids: boolean }
   */
  const getCustodyInfo = () => {
    try {
      const custodySettings = JSON.parse(localStorage.getItem('custodySettings') || '{}');
      
      if (!custodySettings.custodyType || custodySettings.custodyType === 'no') {
        return { hasKids: true };
      }
      
      if (custodySettings.custodyType === 'alternating') {
        const referenceWeekStart = new Date(custodySettings.weekStartDate);
        const currentWeekMonday = getMondayOfCurrentWeek();
        const currMonday = new Date(currentWeekMonday);
        
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksDiff = Math.floor((currMonday - referenceWeekStart) / msPerWeek);
        
        const hasKids = custodySettings.currentWeekHasKids ? 
          (weeksDiff % 2 === 0) : 
          (weeksDiff % 2 === 1);
        
        return { hasKids };
      }
      
      return { hasKids: true };
    } catch (e) {
      return { hasKids: true };
    }
  };

  const custodyInfo = getCustodyInfo();
  const isKidsWeek = custodyInfo.hasKids;

  const buildRoutineFromTemplate = async (mode, kidsPresent) => {
    const weekStartDate = getMondayOfCurrentWeek();
    const start = new Date(weekStartDate);
    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);
    const weekEndDate = weekEnd.toISOString().slice(0, 10);

    // Map mode to template ID based on kids presence
    let templateId;
    if (kidsPresent) {
      // Kids week templates
      if (mode === 'regular') templateId = 'regular-with-kids';
      else if (mode === 'hard') templateId = 'hard-with-kids';
      else if (mode === 'hardest') templateId = 'hardest-survival';
    } else {
      // Solo week templates
      if (mode === 'regular') templateId = 'regular-solo';
      else if (mode === 'hard') templateId = 'recovery-solo';
      else if (mode === 'hardest') templateId = 'hustle-solo';
    }

    try {
      // Get the template
      const template = await ApiService.getTemplate(templateId);

      const makeTasks = (arr = []) => (arr || []).map((t, idx) => ({
        id: `${templateId}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        text: t.text,
        completed: false
      }));

      const dailyRoutines = Object.fromEntries(
        Object.entries(template.days || {}).map(([day, sections]) => [
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
        ])
      );

      const newRoutine = {
        weekStartDate,
        weekEndDate,
        mode,
        kidsWithUser: kidsPresent,
        dailyRoutines
      };

      await ApiService.upsertRoutine(weekStartDate, newRoutine);
      alert(`✓ Started ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode!`);
      onStarted && onStarted();
    } catch (error) {
      console.error('Failed to create routine:', error);
      alert('Failed to create routine. Please try again.');
    }
  };

  const startRoutine = async (mode) => {
    setLoading(true);
    try {
      const kidsPresent = isKidsWeek;
      await buildRoutineFromTemplate(mode, kidsPresent);
    } catch (error) {
      console.error('Failed to create routine:', error);
      alert('Failed to create routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Define modes based on week type
  const kidsWeekModes = [
    {
      id: 'regular',
      emoji: '🟢',
      name: 'Regular Mode',
      subtitle: 'Normal week, full routine',
      chooseIf: 'Normal week, usual support available',
      includes: [
        'Full meals together',
        'Homework help',
        'Bedtime routines',
        'Quality time with kids'
      ]
    },
    {
      id: 'hard',
      emoji: '🟡',
      name: 'Hard Mode',
      subtitle: 'Simplified expectations',
      chooseIf: 'High stress, limited support, or surviving',
      includes: [
        'Easy meals OK',
        'Homework optional',
        'Flexible bedtimes',
        'Unlimited screens'
      ]
    },
    {
      id: 'hardest',
      emoji: '🔴',
      name: 'Survival Mode',
      subtitle: 'Bare minimum only',
      chooseIf: 'Crisis mode, need everyone alive and fed',
      includes: [
        'Kids fed (anything counts)',
        'Kids supervised',
        'Kids eventually in bed',
        "That's it."
      ]
    }
  ];

  const soloWeekModes = [
    {
      id: 'regular',
      emoji: '🟢',
      name: 'Regular Solo Week',
      subtitle: 'Balanced recovery & prep',
      chooseIf: 'Normal energy, balanced week ahead',
      includes: [
        'Good sleep (not excessive)',
        'Meal prep for kids week',
        'Admin & appointments',
        'Social time & hobbies'
      ]
    },
    {
      id: 'hard',
      emoji: '🟡',
      name: 'Recovery Solo Week',
      subtitle: 'Extra rest - you\'re depleted',
      chooseIf: 'Exhausted after hard kids week',
      includes: [
        'Sleep as much as needed',
        'Minimal obligations',
        'Gentle self-care',
        'No guilt about rest'
      ]
    },
    {
      id: 'hardest',
      emoji: '🔴',
      name: 'Hustle Solo Week',
      subtitle: 'High prep mode',
      chooseIf: 'Preparing for tough kids week ahead',
      includes: [
        'Batch cook 5+ meals',
        'All appointments scheduled',
        'House fully organized',
        'Deep work on projects'
      ]
    }
  ];

  const modes = isKidsWeek ? kidsWeekModes : soloWeekModes;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontWeight: 700, fontSize: '24px' }}>
          {isKidsWeek ? 'Choose Kids Week Routine' : 'Choose Solo Week Routine'}
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: '8px 12px',
            border: '1px solid #E5E5E5',
            borderRadius: '10px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
        {isKidsWeek 
          ? 'Select the mode that fits your week with the kids'
          : 'Select the mode that fits your solo week'}
      </p>

      {modes.map(mode => (
        <div
          key={mode.id}
          style={{
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '32px' }}>{mode.emoji}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#2D3748' }}>{mode.name}</div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>{mode.subtitle}</div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#4B5563', marginBottom: '4px' }}>Choose this if:</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>{mode.chooseIf}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#4B5563', marginBottom: '8px' }}>What's included:</div>
            <div style={{ display: 'grid', gap: '6px' }}>
              {mode.includes.map((item, idx) => (
                <div key={idx} style={{ fontSize: '14px', color: '#6B7280' }}>• {item}</div>
              ))}
            </div>
          </div>

          <button
            onClick={() => startRoutine(mode.id)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(157, 78, 221, 0.3)'
            }}
          >
            {loading ? 'Creating...' : `Start ${mode.name}`}
          </button>
        </div>
      ))}
    </div>
  );
}

