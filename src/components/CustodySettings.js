import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const CustodySettings = ({ onBack, onSave, currentSettings = {} }) => {
  const [custodyType, setCustodyType] = useState(currentSettings.custodyType || 'no');
  const [currentWeekHasKids, setCurrentWeekHasKids] = useState(
    currentSettings.currentWeekHasKids !== undefined ? currentSettings.currentWeekHasKids : true
  );
  const [weekStartDate, setWeekStartDate] = useState(
    currentSettings.weekStartDate || getCurrentMonday()
  );
  const [specificDays, setSpecificDays] = useState(
    currentSettings.specificDays || []
  );
  const [notes, setNotes] = useState(currentSettings.notes || '');

  const daysOfWeek = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' }
  ];

  function getCurrentMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // adjust when day is sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split('T')[0];
  }

  const handleSave = () => {
    const settings = {
      custodyType,
      currentWeekHasKids,
      weekStartDate,
      specificDays: custodyType === 'specific' ? specificDays : [],
      handoverDay: 'monday',
      handoverLocation: 'school',
      dropoffTime: '09:00',
      pickupTime: '16:30',
      notes: custodyType === 'alternating' 
        ? 'Week with me: Pick up Mon 4:30pm, drop off next Mon 9am. Week with dad: Dad picks up Mon afternoon, drops off next Mon 9am.'
        : notes
    };

    localStorage.setItem('custodySettings', JSON.stringify(settings));
    onSave(settings);
  };

  const toggleDay = (dayId) => {
    setSpecificDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(d => d !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontSize: '24px', fontWeight: 700 }}>Custody Schedule</h2>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #E5E5E5', background: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={18} />Back
        </button>
      </div>

      {/* Pattern Selection */}
      <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, marginBottom: '12px', color: '#2D3748', display: 'block' }}>
          Do you share custody?
        </div>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <div 
            onClick={() => setCustodyType('no')} 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '12px', 
              borderRadius: '10px', 
              border: custodyType === 'no' ? '2px solid #9D4EDD' : '1px solid #E5E5E5', 
              background: custodyType === 'no' ? '#F3E8FF' : 'white',
              cursor: 'pointer' 
            }}
          >
            <input type="radio" checked={custodyType === 'no'} readOnly />
            <div>No, kids always with me</div>
          </div>
          
          <div 
            onClick={() => setCustodyType('alternating')} 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '12px', 
              borderRadius: '10px', 
              border: custodyType === 'alternating' ? '2px solid #9D4EDD' : '1px solid #E5E5E5',
              background: custodyType === 'alternating' ? '#F3E8FF' : 'white',
              cursor: 'pointer' 
            }}
          >
            <input type="radio" checked={custodyType === 'alternating'} readOnly />
            <div>Yes, alternating weeks</div>
          </div>
          
          <div 
            onClick={() => setCustodyType('specific')} 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '12px', 
              borderRadius: '10px', 
              border: custodyType === 'specific' ? '2px solid #9D4EDD' : '1px solid #E5E5E5',
              background: custodyType === 'specific' ? '#F3E8FF' : 'white',
              cursor: 'pointer' 
            }}
          >
            <input type="radio" checked={custodyType === 'specific'} readOnly />
            <div>Yes, specific schedule</div>
          </div>
        </div>
      </div>

      {/* Alternating Weeks Configuration */}
      {custodyType === 'alternating' && (
        <>
          <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, marginBottom: '12px', color: '#2D3748', display: 'block' }}>
              This week (starting Monday {new Date(weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}):
            </div>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              <div 
                onClick={() => setCurrentWeekHasKids(true)} 
                style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: currentWeekHasKids === true ? '2px solid #9D4EDD' : '1px solid #E5E5E5',
                  background: currentWeekHasKids === true ? '#F3E8FF' : 'white',
                  cursor: 'pointer' 
                }}
              >
                <input type="radio" checked={currentWeekHasKids === true} readOnly />
                <div>👨‍👩‍👧‍👦 Kids with you</div>
              </div>
              
              <div 
                onClick={() => setCurrentWeekHasKids(false)} 
                style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: currentWeekHasKids === false ? '2px solid #9D4EDD' : '1px solid #E5E5E5',
                  background: currentWeekHasKids === false ? '#F3E8FF' : 'white',
                  cursor: 'pointer' 
                }}
              >
                <input type="radio" checked={currentWeekHasKids === false} readOnly />
                <div>🏠 Kids with other parent</div>
              </div>
              
              <div style={{ fontSize: '0.85em', color: '#9A938E', marginTop: '8px', fontStyle: 'italic', paddingLeft: '22px' }}>
                Pattern repeats every 2 weeks
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, marginBottom: '12px', color: '#2D3748', display: 'block' }}>
              Handover details:
            </div>
            
            <div style={{ background: '#F7FAFC', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Handover day:</strong> Monday
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Drop-off location:</strong> School
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Drop-off time:</strong> 9:00 AM
              </div>
              
              <div>
                <strong>Pick-up time:</strong> 4:30 PM (after school)
              </div>
            </div>
            
            <div style={{ fontSize: '0.85em', color: '#9A938E', marginTop: '12px', lineHeight: 1.6 }}>
              Week with you: You pick up Monday 4:30pm, drop off next Monday 9am<br/>
              Week with dad: Dad picks up Monday afternoon, drops off next Monday 9am
            </div>
          </div>
        </>
      )}

      {/* Specific Schedule Configuration */}
      {custodyType === 'specific' && (
        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: '#2D3748', display: 'block' }}>
            When are kids with you? (same every week)
          </div>
          <div style={{ fontSize: '0.9em', color: '#6B7280', marginBottom: '12px' }}>
            Select the days your kids are with you
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {daysOfWeek.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: specificDays.includes(day.id) ? '2px solid #9D4EDD' : '1px solid #E5E5E5',
                  background: specificDays.includes(day.id) ? '#F3E8FF' : 'white',
                  color: specificDays.includes(day.id) ? '#9D4EDD' : '#6B7280',
                  fontWeight: specificDays.includes(day.id) ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                  minWidth: '50px',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {day.short}
              </button>
            ))}
          </div>

          {specificDays.length === 0 && (
            <div style={{ 
              fontSize: '0.85em', 
              color: '#DC2626', 
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              Please select at least one day
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      {custodyType === 'specific' && (
        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#2D3748', display: 'block' }}>
            Notes (optional)
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about handover times, locations, or special arrangements..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              color: '#2D3748'
            }}
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={custodyType === 'specific' && specificDays.length === 0}
        style={{
          width: '100%',
          padding: '16px',
          background: (custodyType === 'specific' && specificDays.length === 0) 
            ? '#E5E5E5' 
            : 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
          color: (custodyType === 'specific' && specificDays.length === 0) ? '#9A938E' : 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '1.05em',
          fontWeight: 600,
          cursor: (custodyType === 'specific' && specificDays.length === 0) ? 'not-allowed' : 'pointer',
          boxShadow: (custodyType === 'specific' && specificDays.length === 0) 
            ? 'none' 
            : '0 4px 12px rgba(157, 78, 221, 0.3)',
          marginTop: '16px'
        }}
      >
        Save Schedule
      </button>
    </div>
  );
};

export default CustodySettings;