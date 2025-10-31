import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Star, ArrowRight, ChevronRight } from 'lucide-react';

const LearningModules = () => {
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/learning-modules');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Failed to load learning modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#6BCB77';
      case 'Medium': return '#FFD93D';
      case 'Hard': return '#FF6B6B';
      default: return '#4D96FF';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'quick-wins': return '⚡';
      case 'core-skills': return '🧠';
      case 'building-independence': return '🏗️';
      case 'self-regulation': return '🛡️';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9A938E' }}>
        Loading learning modules...
      </div>
    );
  }

  if (selectedModule) {
    return (
      <ModuleDetail 
        module={selectedModule} 
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  if (selectedCategory) {
    const category = modules[selectedCategory];
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          cursor: 'pointer'
        }} onClick={() => setSelectedCategory(null)}>
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
          <h2 style={{ margin: 0, color: '#9D4EDD' }}>
            {getCategoryIcon(selectedCategory)} {category.title}
          </h2>
        </div>
        
        <p style={{ color: '#9A938E', marginBottom: '24px' }}>
          {category.description}
        </p>

        <div style={{ display: 'grid', gap: '16px' }}>
          {Object.values(category.modules).map(module => (
            <div
              key={module.id}
              onClick={() => setSelectedModule(module)}
              style={{
                background: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#2D3748' }}>
                  {module.title}
                </h3>
                <p style={{ margin: '0 0 12px 0', color: '#9A938E', fontSize: '0.9em' }}>
                  {module.whenToUse}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8em',
                    color: '#718096'
                  }}>
                    <Clock size={14} />
                    {module.duration}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8em',
                    color: getDifficultyColor(module.difficulty)
                  }}>
                    <Star size={14} />
                    {module.difficulty}
                  </div>
                </div>
              </div>
              <ChevronRight size={20} color="#9A938E" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#9D4EDD', marginBottom: '24px' }}>
        📚 Learning Modules
      </h2>
      <p style={{ color: '#9A938E', marginBottom: '32px', lineHeight: 1.6 }}>
        Bite-sized lessons to build your parenting skills. Start with Quick Wins for immediate impact, 
        then dive deeper into Core Skills and Building Independence.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {Object.entries(modules).map(([key, category]) => (
          <div
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              background: 'white',
              border: '1px solid #E5E5E5',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '1.5em' }}>
                  {getCategoryIcon(key)}
                </span>
                <h3 style={{ margin: 0, color: '#2D3748' }}>
                  {category.title}
                </h3>
              </div>
              <p style={{ margin: '0 0 12px 0', color: '#9A938E', fontSize: '0.9em' }}>
                {category.description}
              </p>
              <div style={{
                fontSize: '0.8em',
                color: '#718096'
              }}>
                {Object.keys(category.modules).length} modules
              </div>
            </div>
            <ChevronRight size={20} color="#9A938E" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ModuleDetail = ({ module, onBack }) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        cursor: 'pointer'
      }} onClick={onBack}>
        <ArrowRight size={20} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
        <h2 style={{ margin: 0, color: '#9D4EDD' }}>{module.title}</h2>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #BAE6FD'
      }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.9em',
            color: '#0369A1'
          }}>
            <Clock size={16} />
            {module.duration}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.9em',
            color: '#0369A1'
          }}>
            <Star size={16} />
            {module.difficulty}
          </div>
        </div>
        <p style={{ margin: 0, color: '#0C4A6E', fontWeight: 500 }}>
          {module.whenToUse}
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          color: '#4D96FF',
          marginBottom: '12px',
          fontSize: '1.1em'
        }}>
          The Technique
        </h3>
        <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
          {module.technique}
        </p>
        <h4 style={{
          color: '#6BCB77',
          marginBottom: '8px',
          fontSize: '1em'
        }}>
          Why This Works
        </h4>
        <p style={{ lineHeight: 1.6, color: '#9A938E' }}>
          {module.whyItWorks}
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          color: '#9D4EDD',
          marginBottom: '12px',
          fontSize: '1.1em'
        }}>
          How to Do It
        </h3>
        <ol style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
          {module.steps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {module.examples && module.examples.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #E5E5E5'
        }}>
          <h3 style={{
            color: '#FF6B6B',
            marginBottom: '12px',
            fontSize: '1.1em'
          }}>
            Examples
          </h3>
          {module.examples.map((example, index) => (
            <div key={index} style={{
              background: '#FEF2F2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '8px',
              fontSize: '0.9em',
              lineHeight: 1.5
            }}>
              {example}
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #BBF7D0'
      }}>
        <h3 style={{
          color: '#166534',
          marginBottom: '12px',
          fontSize: '1.1em'
        }}>
          Practice Challenge
        </h3>
        <p style={{ margin: 0, color: '#15803D', lineHeight: 1.6 }}>
          {module.practice}
        </p>
      </div>

      <button
        onClick={onBack}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '1em',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(157, 78, 221, 0.4)'
        }}
      >
        Got It! Back to Learning
      </button>
    </div>
  );
};

export default LearningModules;



