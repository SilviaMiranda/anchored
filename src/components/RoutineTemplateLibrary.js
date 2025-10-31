import React, { useEffect, useState } from 'react';
import Api from '../services/api';

export default function RoutineTemplateLibrary({ onApply }) {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await Api.getTemplates();
        setTemplates(data || {});
      } catch (e) {
        console.error('Failed to load templates', e);
        setError('Failed to load templates. Ensure the backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '16px' }}>
      <h3 style={{ marginTop: 0, color: '#9D4EDD' }}>Templates</h3>
      {loading ? <div style={{ color: '#9A938E' }}>Loading...</div> : error ? (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#7F1D1D', padding: '12px', borderRadius: '12px' }}>{error}</div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(templates).map(([id, tpl]) => (
            <div key={id} style={{ border: '1px solid #F1F1F1', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontWeight: 600 }}>{tpl.name || id}</div>
              <div style={{ color: '#9A938E', fontSize: '0.9em', marginBottom: '6px' }}>Mode: {tpl.mode}</div>
              {tpl.description && (
                <div style={{ color: '#6B7280', fontSize: '0.9em', marginBottom: '8px' }}>{tpl.description}</div>
              )}
              {/* Preview */}
              {tpl.days && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {Object.keys(tpl.days).slice(0, 3).map((d) => (
                    <span key={d} style={{ padding: '6px 8px', border: '1px solid #EEE', borderRadius: '8px', fontSize: '0.85em', color: '#4B5563', textTransform: 'capitalize' }}>{d}</span>
                  ))}
                  {Object.keys(tpl.days).length > 3 && (
                    <span style={{ padding: '6px 8px', border: '1px solid #EEE', borderRadius: '8px', fontSize: '0.85em', color: '#4B5563' }}>+{Object.keys(tpl.days).length - 3} more</span>
                  )}
                </div>
              )}
              {onApply && (
                <button onClick={() => onApply(id, tpl)} style={{ marginTop: '4px', padding: '10px 12px', border: 'none', borderRadius: '10px', fontWeight: 600, background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white' }}>Use This Template</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


