import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar } from 'lucide-react';

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
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
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
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '15px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            color: '#6b7280',
            padding: '8px'
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '10px',
        color: '#1f2937'
      }}>
        Custody Schedule
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '30px',
        fontSize: '14px'
      }}>
        Set up your custody pattern so the app can adapt routines and reminders to your schedule.
      </p>

      {/* Custody Type Selection */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ 
          display: 'block', 
          fontWeight: '600', 
          marginBottom: '12px',
          color: '#374151'
        }}>
          Do you have a custody schedule?
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: custodyType === 'no' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: custodyType === 'no' ? '#eff6ff' : '#fff'
          }}>
            <input
              type="radio"
              name="custodyType"
              value="no"
              checked={custodyType === 'no'}
              onChange={(e) => setCustodyType(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <div>
              <div style={{ fontWeight: '500' }}>No, kids are always with me</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                You have full custody or no custody arrangement
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: custodyType === 'alternating' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: custodyType === 'alternating' ? '#eff6ff' : '#fff'
          }}>
            <input
              type="radio"
              name="custodyType"
              value="alternating"
              checked={custodyType === 'alternating'}
              onChange={(e) => setCustodyType(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <div>
              <div style={{ fontWeight: '500' }}>Yes, alternating weeks</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Kids alternate between you and the other parent every week
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: custodyType === 'specific' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: custodyType === 'specific' ? '#eff6ff' : '#fff'
          }}>
            <input
              type="radio"
              name="custodyType"
              value="specific"
              checked={custodyType === 'specific'}
              onChange={(e) => setCustodyType(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <div>
              <div style={{ fontWeight: '500' }}>Yes, specific schedule</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Kids are with you on certain days each week
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Alternating Weeks Configuration */}
      {custodyType === 'alternating' && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '15px',
            color: '#374151'
          }}>
            Configure Alternating Weeks
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#4b5563'
            }}>
              Are the kids with you this week?
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentWeekHasKids(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: currentWeekHasKids ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: currentWeekHasKids ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontWeight: currentWeekHasKids ? '600' : '400',
                  color: currentWeekHasKids ? '#1e40af' : '#6b7280'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setCurrentWeekHasKids(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: !currentWeekHasKids ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: !currentWeekHasKids ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontWeight: !currentWeekHasKids ? '600' : '400',
                  color: !currentWeekHasKids ? '#1e40af' : '#6b7280'
                }}
              >
                No
              </button>
            </div>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginTop: '8px'
            }}>
              We'll use this week as a reference to calculate future weeks
            </p>
          </div>

          <div style={{
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Calendar size={16} style={{ color: '#3b82f6' }} />
              <span style={{ fontWeight: '500', fontSize: '14px' }}>Handover Details</span>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              <strong>When:</strong> Monday at school<br />
              <strong>Pick-up:</strong> 4:30pm<br />
              <strong>Drop-off:</strong> Next Monday, 9:00am
            </div>
          </div>
        </div>
      )}

      {/* Specific Schedule Configuration */}
      {custodyType === 'specific' && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '15px',
            color: '#374151'
          }}>
            Select the days your kids are with you
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {daysOfWeek.map(day => (
              <label
                key={day.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: specificDays.includes(day.id) ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: specificDays.includes(day.id) ? '#eff6ff' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={specificDays.includes(day.id)}
                  onChange={() => toggleDay(day.id)}
                  style={{ 
                    marginRight: '10px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ 
                  fontWeight: specificDays.includes(day.id) ? '600' : '400',
                  color: specificDays.includes(day.id) ? '#1e40af' : '#374151'
                }}>
                  {day.label}
                </span>
              </label>
            ))}
          </div>

          {specificDays.length === 0 && (
            <p style={{ 
              fontSize: '13px', 
              color: '#dc2626', 
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              Please select at least one day
            </p>
          )}
        </div>
      )}

      {/* Notes Section */}
      {custodyType === 'specific' && (
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#374151'
          }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about handover times, locations, or special arrangements..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={custodyType === 'specific' && specificDays.length === 0}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: (custodyType === 'specific' && specificDays.length === 0) ? '#d1d5db' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: (custodyType === 'specific' && specificDays.length === 0) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (custodyType !== 'specific' || specificDays.length > 0) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (custodyType !== 'specific' || specificDays.length > 0) {
            e.target.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        <Save size={20} />
        Save Custody Settings
      </button>

      {/* Help Text */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px'
      }}>
        <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
          <strong>💡 Tip:</strong> The app will use these settings to automatically show you relevant routines and reminders for weeks when your kids are with you.
        </p>
      </div>
    </div>
  );
};

export default CustodySettings;