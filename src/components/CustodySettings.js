import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function CustodySettings({ onBack, onSave, currentSettings }) {
  const [custodyType, setCustodyType] = useState(currentSettings?.custodyType || 'no');
  const [currentWeekHasKids, setCurrentWeekHasKids] = useState(
    currentSettings?.currentWeekHasKids !== undefined ? currentSettings.currentWeekHasKids : true
  );

  const getCurrentMondayDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    return monday.toISOString().split('T')[0];
  };

  const handleSave = () => {
    const custodySettings = {
      custodyType: custodyType,
      currentWeekHasKids: currentWeekHasKids,
      weekStartDate: getCurrentMondayDate(),
      handoverDay: 'monday',
      handoverLocation: 'school',
      dropoffTime: '09:00',
      pickupTime: '16:30',
      notes: 'Week with me: Pick up Mon 4:30pm, drop off next Mon 9am. Week with dad: Dad picks up Mon afternoon, drops off next Mon 9am.'
    };
    
    localStorage.setItem('custodySettings', JSON.stringify(custodySettings));
    onSave && onSave(custodySettings);
    alert('Custody schedule saved!');
    onBack && onBack();
  };

  const mondayDate = getCurrentMondayDate();

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
              This week (starting Monday {new Date(mondayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}):
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
        </div>
      )}

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '1.05em',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(157, 78, 221, 0.3)',
          marginTop: '16px'
        }}
      >
        Save Schedule
      </button>
    </div>
  );
}
