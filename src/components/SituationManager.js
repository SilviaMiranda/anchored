import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const SituationManager = ({ situations, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSituation, setEditingSituation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    scripts: {
      gentle: { say: '', do: '', dont: [], why: '', tough: '' },
      balanced: { say: '', do: '', dont: [], why: '', tough: '' },
      tough: { say: '', do: '', dont: [], why: '', tough: '' }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSituation) {
        await fetch(`http://localhost:5000/api/situations/${editingSituation}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:5000/api/situations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      setShowForm(false);
      setEditingSituation(null);
      setFormData({
        title: '',
        scripts: {
          gentle: { say: '', do: '', dont: [], why: '', tough: '' },
          balanced: { say: '', do: '', dont: [], why: '', tough: '' },
          tough: { say: '', do: '', dont: [], why: '', tough: '' }
        }
      });
      onRefresh();
    } catch (error) {
      console.error('Error saving situation:', error);
      alert('Error saving situation. Please try again.');
    }
  };

  const handleEdit = (situation) => {
    setFormData({
      title: situation.title,
      scripts: situation.scripts
    });
    setEditingSituation(situation.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this situation?')) {
      try {
        await fetch(`http://localhost:5000/api/situations/${id}`, {
          method: 'DELETE'
        });
        onRefresh();
      } catch (error) {
        console.error('Error deleting situation:', error);
        alert('Error deleting situation. Please try again.');
      }
    }
  };

  const updateScript = (style, field, value) => {
    setFormData(prev => ({
      ...prev,
      scripts: {
        ...prev.scripts,
        [style]: {
          ...prev.scripts[style],
          [field]: field === 'dont' ? value.split('\n').filter(line => line.trim()) : value
        }
      }
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#9D4EDD', margin: 0 }}>Manage Situations</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <Plus size={20} />
          Add Situation
        </button>
      </div>

      {/* Existing Situations */}
      <div style={{ marginBottom: '20px' }}>
        {Object.values(situations).map(situation => (
          <div key={situation.id} style={{
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#2D3748' }}>{situation.title}</h3>
              <p style={{ margin: 0, color: '#9A938E', fontSize: '0.9em' }}>
                ID: {situation.id} • Created: {new Date(situation.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEdit(situation)}
                style={{
                  background: '#4D96FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(situation.id)}
                style={{
                  background: '#FF6B6B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#9D4EDD' }}>
                {editingSituation ? 'Edit Situation' : 'Add New Situation'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSituation(null);
                  setFormData({
                    title: '',
                    scripts: {
                      gentle: { say: '', do: '', dont: [], why: '', tough: '' },
                      balanced: { say: '', do: '', dont: [], why: '', tough: '' },
                      tough: { say: '', do: '', dont: [], why: '', tough: '' }
                    }
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} color="#9A938E" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Situation Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              {['gentle', 'balanced', 'tough'].map(style => (
                <div key={style} style={{
                  background: '#F7FAFC',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    color: '#4D96FF',
                    textTransform: 'capitalize'
                  }}>
                    {style} Response
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      What to Say
                    </label>
                    <textarea
                      value={formData.scripts[style].say}
                      onChange={(e) => updateScript(style, 'say', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="What should I say in this situation?"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      What to Do
                    </label>
                    <textarea
                      value={formData.scripts[style].do}
                      onChange={(e) => updateScript(style, 'do', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="What actions should I take?"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      What NOT to Do (one per line)
                    </label>
                    <textarea
                      value={formData.scripts[style].dont.join('\n')}
                      onChange={(e) => updateScript(style, 'dont', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="What should I avoid doing?"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Why This Works
                    </label>
                    <textarea
                      value={formData.scripts[style].why}
                      onChange={(e) => updateScript(style, 'why', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px',
                        minHeight: '60px',
                        resize: 'vertical'
                      }}
                      placeholder="Why does this approach work?"
                    />
                  </div>

                  {style === 'tough' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Tough Love Reminder (optional)
                      </label>
                      <textarea
                        value={formData.scripts[style].tough || ''}
                        onChange={(e) => updateScript(style, 'tough', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #E5E5E5',
                          borderRadius: '8px',
                          minHeight: '60px',
                          resize: 'vertical'
                        }}
                        placeholder="Additional reminder for tough love mode"
                      />
                    </div>
                  )}
                </div>
              ))}

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSituation(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #E5E5E5',
                    background: 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={20} />
                  {editingSituation ? 'Update' : 'Create'} Situation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SituationManager;



