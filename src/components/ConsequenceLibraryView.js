import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

/**
 * Read-only view of backend/data/consequence-library.json (served via GET /api/consequence-library).
 */
export default function ConsequenceLibraryView() {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getConsequenceLibrary();
        if (!cancelled) {
          setDoc(data && typeof data === 'object' ? data : {});
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Could not load consequence library. Is the API running?');
          setDoc(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9A938E' }}>
        Loading consequence library…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 20px', color: '#C53030', fontSize: '0.95em' }}>
        {error}
      </div>
    );
  }

  const root = doc?.['consequence-library'] || doc;
  if (!root || typeof root !== 'object') {
    return (
      <div style={{ padding: '24px 20px', color: '#9A938E' }}>
        No consequence library data yet.
      </div>
    );
  }

  const renderListSection = (title, items) => {
    if (!items || !items.length) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#9D4EDD', fontSize: '1em', marginBottom: '10px' }}>{title}</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
          {items.map((t, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
          ))}
        </ul>
      </div>
    );
  };

  const cp = root['core-principles'];
  const leo = root.leo;
  const emma = root.emma;
  const ya = root['your-adhd'];
  const qdg = root['quick-decision-guide'];

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <h2 style={{ marginTop: 0, color: '#2D3748', fontSize: '1.25em' }}>
        {root.title || 'Consequence quick reference'}
      </h2>
      {root.description && (
        <p style={{ color: '#718096', fontSize: '0.95em', lineHeight: 1.6, marginBottom: '20px' }}>
          {root.description}
        </p>
      )}

      {cp?.items && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ color: '#9D4EDD', marginTop: 0, fontSize: '1.05em' }}>{cp.title}</h3>
          {cp.items.map((item) => (
            <div key={item.id || item.principle} style={{ marginBottom: '14px' }}>
              <strong style={{ color: '#2D3748' }}>{item.principle}</strong>
              <p style={{ margin: '6px 0 0', color: '#4A5568', fontSize: '0.9em', lineHeight: 1.55 }}>
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {leo && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ color: '#9D4EDD', marginTop: 0, fontSize: '1.05em' }}>{leo.title}</h3>
          {leo['approach-note'] && (
            <p style={{ color: '#718096', fontSize: '0.9em', lineHeight: 1.55, marginBottom: '12px' }}>
              {leo['approach-note']}
            </p>
          )}
          {Object.entries(leo['consequence-bank'] || {}).map(([key, block]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              {renderListSection(block.title, block.items)}
            </div>
          ))}
        </div>
      )}

      {emma && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ color: '#9D4EDD', marginTop: 0, fontSize: '1.05em' }}>{emma.title}</h3>
          {emma['approach-note'] && (
            <p style={{ color: '#718096', fontSize: '0.9em', lineHeight: 1.55, marginBottom: '12px' }}>
              {emma['approach-note']}
            </p>
          )}
          {Object.entries(emma['consequence-bank'] || {}).map(([key, block]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              {renderListSection(block.title, block.items)}
            </div>
          ))}
        </div>
      )}

      {ya?.items && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ color: '#9D4EDD', marginTop: 0, fontSize: '1.05em' }}>{ya.title}</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6, color: '#4A5568' }}>
            {ya.items.map((row) => (
              <li key={row.id} style={{ marginBottom: '10px' }}>{row.note}</li>
            ))}
          </ul>
        </div>
      )}

      {qdg?.steps && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ color: '#9D4EDD', marginTop: 0, fontSize: '1.05em' }}>{qdg.title}</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.65, color: '#4A5568' }}>
            {qdg.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
