import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';

function energyToScriptKey(energy) {
  if (energy === 'full') return 'gentle';
  if (energy === 'running') return 'balanced';
  if (energy === 'survival') return 'tough';
  return 'balanced';
}

function stripParenthetical(text) {
  if (typeof text !== 'string') return '';
  const idx = text.indexOf(' (');
  return idx === -1 ? text : text.slice(0, idx);
}

export default function BothSiblingConflictAnswer({ energy, situations }) {
  const [libraryDoc, setLibraryDoc] = useState(null);
  const [libraryError, setLibraryError] = useState(null);

  const scriptKey = energyToScriptKey(energy);
  const siblingSituation = situations?.['emma-sibling-conflict'];
  const script = siblingSituation?.scripts?.[scriptKey];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.getConsequenceLibrary();
        if (!cancelled) {
          setLibraryDoc(data && typeof data === 'object' ? data : {});
          setLibraryError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLibraryDoc(null);
          setLibraryError('Could not load consequence library.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const libraryRoot = useMemo(() => {
    if (!libraryDoc || typeof libraryDoc !== 'object') return null;
    return libraryDoc?.['consequence-library'] || libraryDoc;
  }, [libraryDoc]);

  const leoOptions = useMemo(() => {
    const items = libraryRoot?.leo?.['consequence-bank']?.['immediate-small']?.items;
    if (!Array.isArray(items)) return [];

    const first = items.find((t) => typeof t === 'string' && t.startsWith('Leaves the room / goes to his space for 5 minutes'));
    const second = items.find((t) => typeof t === 'string' && t.startsWith('Misses the next fun thing in the sequence'));

    return [stripParenthetical(first), stripParenthetical(second)].filter(Boolean);
  }, [libraryRoot]);

  const emmaOptions = useMemo(() => {
    const items = libraryRoot?.emma?.['consequence-bank']?.['what-works']?.items;
    if (!Array.isArray(items)) return [];
    return items.slice(0, 3).filter((t) => typeof t === 'string');
  }, [libraryRoot]);

  return (
    <>
      {/* Step 0 banner */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        color: '#92400E',
        padding: '10px 12px',
        borderRadius: '999px',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '12px'
      }}>
        Step 0: Separate them. Then come back here.
      </div>

      {/* SAY */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#9D4EDD'
        }}>
          1. Say
        </h3>
        <div style={{
          fontSize: '1.05em',
          fontWeight: 500,
          background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(255,107,107,0.10))',
          padding: '16px',
          borderRadius: '12px',
          borderLeft: '4px solid #F59E0B',
          fontStyle: 'italic',
          lineHeight: 1.6
        }}>
          {script?.say ? `"${script.say}"` : 'Loading script…'}
        </div>
      </div>

      {/* DO */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#4D96FF'
        }}>
          2. Do
        </h3>
        <div style={{ lineHeight: 1.7 }}>
          {script?.do || 'Loading…'}
        </div>
      </div>

      {/* CONSEQUENCE */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#6BCB77'
        }}>
          3. Consequence
        </h3>

        {libraryError ? (
          <div style={{ color: '#C53030', fontSize: '0.95em' }}>{libraryError}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '14px',
              padding: '14px'
            }}>
              <div style={{ fontWeight: 800, color: '#92400E', marginBottom: '10px', letterSpacing: '0.5px' }}>
                LEO
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#78350F' }}>
                {(leoOptions.length ? leoOptions : [
                  'Leaves the room / goes to his space for 5 minutes',
                  'Misses the next fun thing in the sequence'
                ]).map((t, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{
              background: '#F7FAFC',
              border: '1px solid #E5E5E5',
              borderRadius: '14px',
              padding: '14px'
            }}>
              <div style={{ fontWeight: 800, color: '#2D3748', marginBottom: '10px', letterSpacing: '0.5px' }}>
                EMMA
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
                {(emmaOptions.length ? emmaOptions : ['Loading…']).map((t, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
