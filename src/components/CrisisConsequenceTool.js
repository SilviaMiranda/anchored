import React, { useEffect, useMemo, useState } from 'react';
import { User, Users, Zap } from 'lucide-react';
import ApiService from '../services/api';
import BothSiblingConflictAnswer from './BothSiblingConflictAnswer';

function energyToScriptKey(energy) {
  if (energy === 'full') return 'gentle';
  if (energy === 'running') return 'balanced';
  if (energy === 'survival') return 'tough';
  return 'balanced';
}

function getLibraryRoot(doc) {
  if (!doc || typeof doc !== 'object') return null;
  return doc?.['consequence-library'] || doc;
}

function stripParenthetical(text) {
  if (typeof text !== 'string') return '';
  const idx = text.indexOf(' (');
  return idx === -1 ? text : text.slice(0, idx);
}

const WHO = {
  leo: { key: 'leo', title: 'Leo (8)', icon: User },
  emma: { key: 'emma', title: 'Emma (13)', icon: User },
  both: { key: 'both', title: 'Both', icon: Users }
};

const STEP2_OPTIONS = {
  leo: [
    { label: "He's being defiant / refusing", situationId: 'leo-defiant', tier: 'medium' },
    { label: 'He melted down', situationId: 'leo-meltdown', tier: 'minor' },
    { label: 'He hit or hurt Emma', situationId: 'leo-hit', tier: 'medium' },
    { label: 'He said something rude to me', situationId: 'leo-disrespect-rude-words', tier: 'minor' },
    { label: 'Impulsive act — now blaming someone else', situationId: 'leo-impulsive-act-blame', tier: 'minor' },
    { label: "He's escalating / pre-meltdown", situationId: 'leo-overstimulated-pre-meltdown', tier: 'minor' },
    { label: 'Transition is failing', situationId: 'leo-transition-resistance', tier: 'minor' }
  ],
  emma: [
    { label: "She's shut down", situationId: 'emma-emotional-shutdown' },
    { label: "She's exploding / spiralling", situationId: 'emma-demand-avoidance' },
    { label: "She's being disrespectful", situationId: 'emma-demand-avoidance' },
    { label: 'Sibling conflict with Leo', situationId: 'emma-sibling-conflict' },
    { label: "She's refusing a demand", situationId: 'emma-demand-avoidance' },
    { label: "She's feeling invisible / overlooked", situationId: 'emma-feeling-invisible' }
  ],
  both: [
    { label: 'Sibling conflict / both fighting', situationId: 'sibling-both' }
  ]
};

export default function CrisisConsequenceTool({ energy, situations, onClose }) {
  const [step, setStep] = useState(1);
  const [who, setWho] = useState(null);
  const [selected, setSelected] = useState(null);
  const [libraryDoc, setLibraryDoc] = useState(null);
  const [libraryError, setLibraryError] = useState(null);

  const scriptKey = energyToScriptKey(energy);

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
    return () => { cancelled = true; };
  }, []);

  const libraryRoot = useMemo(() => getLibraryRoot(libraryDoc), [libraryDoc]);

  const answerSituationId = useMemo(() => {
    if (!selected) return null;
    if (selected.situationId === 'sibling-both') return 'emma-sibling-conflict';
    return selected.situationId;
  }, [selected]);

  const answerSituation = useMemo(() => {
    if (!answerSituationId) return null;
    return situations?.[answerSituationId] || null;
  }, [situations, answerSituationId]);

  const answerScript = answerSituation?.scripts?.[scriptKey];

  const [dontOpen, setDontOpen] = useState(false);
  useEffect(() => { setDontOpen(false); }, [step, who, selected, scriptKey]);

  const leoConsequenceItems = useMemo(() => {
    const bank = libraryRoot?.leo?.['consequence-bank'];
    if (!bank) return [];
    const tier = selected?.tier === 'medium' ? 'medium' : 'immediate-small';
    const items = bank?.[tier]?.items;
    if (!Array.isArray(items)) return [];
    return items.slice(0, 3).filter((t) => typeof t === 'string').map(stripParenthetical);
  }, [libraryRoot, selected]);

  const leoNatural = useMemo(() => {
    const items = libraryRoot?.leo?.['consequence-bank']?.natural?.items;
    if (!Array.isArray(items)) return null;
    const t = items.find((x) => typeof x === 'string');
    return t ? stripParenthetical(t) : null;
  }, [libraryRoot]);

  const emmaConsequenceItems = useMemo(() => {
    const items = libraryRoot?.emma?.['consequence-bank']?.['what-works']?.items;
    if (!Array.isArray(items)) return [];
    return items.slice(0, 3).filter((t) => typeof t === 'string');
  }, [libraryRoot]);

  const amberCard = {
    background: 'white',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  };

  const amberIconWrap = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.35), rgba(245, 158, 11, 0.20))'
  };

  if (step === 1) {
    return (
      <div>
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '14px',
          color: '#92400E',
          fontWeight: 600,
          lineHeight: 1.4
        }}>
          3 taps to an answer.
        </div>

        {Object.values(WHO).map(({ key, title, icon: Icon }) => (
          <div
            key={key}
            onClick={() => {
              setWho(key);
              setStep(2);
            }}
            style={amberCard}
          >
            <div style={amberIconWrap}>
              <Icon size={28} strokeWidth={2} color="#B45309" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1em', fontWeight: 700, color: '#2D3748' }}>{title}</div>
              <div style={{ fontSize: '0.9em', color: '#9A938E' }}>Tap to choose</div>
            </div>
            <div style={{ color: '#9A938E', fontSize: '1.25em' }}>›</div>
          </div>
        ))}
      </div>
    );
  }

  if (step === 2) {
    const options = STEP2_OPTIONS[who] || [];
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setStep(1);
          }}
          style={{
            background: 'rgba(245, 158, 11, 0.16)',
            border: 'none',
            color: '#B45309',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          ← Back
        </button>

        {options.map((opt) => (
          <div
            key={opt.label}
            onClick={() => {
              setSelected(opt);
              setStep(3);
            }}
            style={amberCard}
          >
            <div style={amberIconWrap}>
              <Zap size={28} strokeWidth={2} color="#B45309" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1em', fontWeight: 700, color: '#2D3748' }}>{opt.label}</div>
              <div style={{ fontSize: '0.85em', color: '#9A938E' }}>Tap for the script</div>
            </div>
            <div style={{ color: '#9A938E', fontSize: '1.25em' }}>›</div>
          </div>
        ))}
      </div>
    );
  }

  // step === 3
  if (selected?.situationId === 'sibling-both') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep(2)}
          style={{
            background: 'rgba(245, 158, 11, 0.16)',
            border: 'none',
            color: '#B45309',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          ← Back
        </button>
        <BothSiblingConflictAnswer energy={energy} situations={situations} />
      </div>
    );
  }

  const showConsequences = who === 'leo' || who === 'emma';

  return (
    <div>
      <button
        type="button"
        onClick={() => setStep(2)}
        style={{
          background: 'rgba(245, 158, 11, 0.16)',
          border: 'none',
          color: '#B45309',
          padding: '10px 16px',
          borderRadius: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        ← Back
      </button>

      {/* SAY */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <div style={{
          fontSize: '0.75em',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 800,
          color: '#B45309',
          marginBottom: '10px'
        }}>
          What to say
        </div>
        <div style={{
          fontSize: '1.05em',
          fontWeight: 500,
          background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.10))',
          padding: '16px',
          borderRadius: '12px',
          borderLeft: '4px solid #F59E0B',
          fontStyle: 'italic',
          lineHeight: 1.6
        }}>
          {answerScript?.say ? `"${answerScript.say}"` : 'Loading script…'}
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
        <div style={{
          fontSize: '0.75em',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 800,
          color: '#B45309',
          marginBottom: '10px'
        }}>
          What to do
        </div>
        <div style={{ lineHeight: 1.7 }}>
          {answerScript?.do || 'Loading…'}
        </div>
      </div>

      {/* CONSEQUENCE */}
      {showConsequences && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #E5E5E5'
        }}>
          <div style={{
            fontSize: '0.75em',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 800,
            color: '#B45309',
            marginBottom: '10px'
          }}>
            Consequence
          </div>

          {libraryError ? (
            <div style={{ color: '#C53030', fontSize: '0.95em' }}>{libraryError}</div>
          ) : who === 'emma' ? (
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
              {(emmaConsequenceItems.length ? emmaConsequenceItems : ['Loading…']).map((t, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
              ))}
            </ul>
          ) : (
            <>
              {leoNatural && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px',
                  fontWeight: 600
                }}>
                  Natural consequence (if available): {leoNatural}
                </div>
              )}
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
                {(leoConsequenceItems.length ? leoConsequenceItems : ['Loading…']).map((t, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* DON'T (collapsed by default) */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '8px',
        border: '1px solid #E5E5E5'
      }}>
        <button
          type="button"
          onClick={() => setDontOpen(!dontOpen)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 800,
            color: '#B45309',
            letterSpacing: '0.5px'
          }}
        >
          <span>DON’T</span>
          <span style={{ color: '#9A938E', fontSize: '1.1em' }}>{dontOpen ? '▼' : '▶'}</span>
        </button>
        {dontOpen && (
          <ul style={{ margin: '12px 0 0', paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
            {(Array.isArray(answerScript?.dont) ? answerScript.dont : []).map((t, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          border: '2px solid #F59E0B',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#B45309',
          fontWeight: 800,
          cursor: 'pointer'
        }}
      >
        Done
      </button>
    </div>
  );
}

