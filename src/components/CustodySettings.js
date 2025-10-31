import React, { useState } from 'react';
import { ChevronLeft, Users, Home, Calendar as CalendarIcon } from 'lucide-react';

export default function CustodySettings({ onBack, onSave, currentSettings }) {
  const [hasCustody, setHasCustody] = useState(currentSettings?.hasCustodySchedule !== false);
  const [pattern, setPattern] = useState(currentSettings?.custodyPattern || 'no');
  const [schedule, setSchedule] = useState(currentSettings?.custodySchedule || {
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  });

  const handleSave = () => {
    const settings = {
      hasCustodySchedule: hasCustody && pattern !== 'no',
      custodyPattern: pattern,
      custodySchedule: pattern === 'specific' ? schedule : null,
      kidsWithMeWeeks: pattern === 'alternating' ? calculateAlternatingWeeks() : null
    };
    onSave && onSave(settings);
    onBack && onBack();
  };

  const calculateAlternatingWeeks = () => {
    const weeks = [];
    const now = new Date();
    const getMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = (day + 6) % 7;
      d.setDate(d.getDate() - diff);
      return d.toISOString().slice(0, 10);
    };
    const thisMonday = getMonday(now);
    const week1 = new Date(thisMonday);
    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(week1);
      weekStart.setDate(week1.getDate() + (i * 14));
      weeks.push(getMonday(weekStart));
    }
    return weeks;
  };

  const toggleDay = (day) => {
    setSchedule({ ...schedule, [day]: !schedule[day] });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontSize: '24px', fontWeight: 700 }}>Custody Schedule</h2>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #E5E5E5', background: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={18} />Back</button>
      </div>

      <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, marginBottom: '12px', color: '#2D3748' }}>Do you share custody?</div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <label onClick={() => { setPattern('no'); setHasCustody(false); }} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', border: pattern === 'no' ? '2px solid #9D4EDD' : '1px solid #E5E5E5', cursor: 'pointer' }}>
            <input type="radio" checked={pattern === 'no'} onChange={() => { setPattern('no'); setHasCustody(false); }} />
            <div>No, kids always with me</div>
          </label>
          <label onClick={() => { setPattern('alternating'); setHasCustody(true); }} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', border: pattern === 'alternating' ? '2px solid #9D4EDD' : '1px solid #E5E5E5', cursor: 'pointer' }}>
            <input type="radio" checked={pattern === 'alternating'} onChange={() => { setPattern('alternating'); setHasCustody(true); }} />
            <div>Yes, alternating weeks</div>
          </label>
          <label onClick={() => { setPattern('specific'); setHasCustody(true); }} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', border: pattern === 'specific' ? '2px solid #9D4EDD' : '1px solid #E5E5E5', cursor: 'pointer' }}>
            <input type="radio" checked={pattern === 'specific'} onChange={() => { setPattern('specific'); setHasCustody(true); }} />
            <div>Yes, specific schedule</div>
          </label>
        </div>
      </div>

      {pattern === 'specific' && (
        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#2D3748' }}>When are kids with you?</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
              <button key={d} onClick={() => toggleDay(d)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: schedule[d] ? '2px solid #9D4EDD' : '1px solid #E5E5E5', background: schedule[d] ? '#F3E8FF' : 'white', fontWeight: 600, textTransform: 'capitalize', fontSize: '12px' }}>{d.slice(0, 3)}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" checked={true} />
              <div style={{ fontSize: '14px' }}>Same every week</div>
            </label>
          </div>
        </div>
      )}

      <button onClick={handleSave} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white', fontWeight: 700, marginTop: '16px' }}>Save Schedule</button>
    </div>
  );
}

