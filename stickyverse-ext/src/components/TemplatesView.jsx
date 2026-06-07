import React, { useState } from 'react';
import { useAppContext } from '../App';

const TEMPLATES = [
  { id: 'meeting',   title: 'Meeting Notes',   em: '📝', desc: 'Attendees, agenda, action items checklist' },
  { id: 'project',   title: 'Project Plan',    em: '🚀', desc: 'Milestones, tasks, objectives checklist' },
  { id: 'daily',     title: 'Daily Review',    em: '☀️', desc: 'Reflection on wins and priorities checklist' },
  { id: 'habit',     title: 'Habit Tracker',   em: '✅', desc: 'Daily habit and routines checklist' },
  { id: 'learning',  title: 'Learning Log',    em: '📚', desc: 'Format for documenting concepts and questions' },
  { id: 'gratitude', title: 'Gratitude Journal',em: '🙏', desc: 'Simple log for gratitude list and wins' },
];

const TEMPLATES_MAP = {
  meeting: {
    title: 'Meeting Notes 📝',
    content: '• Attendees & Time\n• Agenda Items\n• Key Decisions\n• Action Items\n• Follow-up Tasks',
    color: 'purple',
    tag: 'task',
    priority: 'none'
  },
  project: {
    title: 'Project Plan 🚀',
    content: '• Define Objectives\n• Research & Planning\n• Create Timeline\n• Assign Tasks\n• Set Milestones',
    color: 'blue',
    tag: 'task',
    priority: 'medium'
  },
  daily: {
    title: 'Daily Review ☀️',
    content: '• What went well today?\n• What could be improved?\n• Top priorities for tomorrow\n• Lessons learned',
    color: 'yellow',
    tag: 'note',
    priority: 'none'
  },
  habit: {
    title: 'Habit Tracker ✅',
    content: '• Morning Routine\n• Exercise\n• Reading\n• Meditation\n• Healthy Meals',
    color: 'green',
    tag: 'task',
    priority: 'none'
  },
  learning: {
    title: 'Learning Log 📚',
    content: 'What I learned today:\n\nKey concepts:\n- \n- \n- \n\nQuestions to explore:\n- \n- \n- ',
    color: 'orange',
    tag: 'note',
    priority: 'none'
  },
  gratitude: {
    title: 'Gratitude Journal 🙏',
    content: 'Today I am grateful for:\n\n1. \n2. \n3.\n\nSmall wins today:\n- \n- ',
    color: 'pink',
    tag: 'quote',
    priority: 'none'
  }
};

const COLOR_MAP = {
  purple: '#EDE9FE',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  yellow: '#FEF9C3',
  pink: '#FCE7F3',
  orange: '#FFEDD5',
  cream: '#FFFBEB',
  dark: '#1E1B4B'
};

export function TemplatesView() {
  const { setNotes, setView, user, supabase } = useAppContext();
  const [previewId, setPreviewId] = useState(null);

  const handleCreateFromTemplate = async (type) => {
    const template = TEMPLATES_MAP[type];
    if (template) {
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        title: template.title,
        content: template.content,
        color: template.color,
        tag: template.tag,
        priority: template.priority,
        status: 'none',
        pinned: false,
        starred: false,
        archived: false,
        created: Date.now(),
        updated: Date.now()
      };

      setNotes(prev => [newNote, ...prev]);

      if (user && supabase) {
        try { await supabase.from('notes').insert(newNote); } catch (e) { console.log('Failed to sync template note:', e.message); }
      }
      
      setPreviewId(null);
      setView('home');
    }
  };

  const previewTemplate = TEMPLATES_MAP[previewId];

  return (
    <div style={{ maxWidth: 900, position: 'relative' }}>
      <div className="view-head">
        <h2 className="view-title">📝 Templates</h2>
        <p className="view-sub">Quick-start templates for common tasks and productivity structures</p>
      </div>

      <div className="templates-grid" style={{ marginTop: '24px' }}>
        {TEMPLATES.map(t => (
          <div
            key={t.id}
            className="template-card"
            onClick={() => setPreviewId(t.id)}
          >
            <div className="template-icon">{t.em}</div>
            <div className="template-title">{t.title}</div>
            <div className="template-desc">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewId && previewTemplate && (
        <div className="modal-overlay" onClick={() => setPreviewId(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2>📋 Template Preview</h2>
              <button className="modal-close" onClick={() => setPreviewId(null)}>×</button>
            </div>
            
            <div style={{ margin: '16px 0' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Geist Mono, monospace', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                Previewing: {previewTemplate.title}
              </div>
              <div style={{ 
                background: COLOR_MAP[previewTemplate.color] || '#EDE9FE', 
                color: previewTemplate.color === 'dark' ? '#ede9fe' : '#2a2050',
                padding: '16px', 
                borderRadius: '12px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                fontFamily: previewTemplate.tag === 'task' ? 'inherit' : 'Caveat, cursive',
                fontSize: previewTemplate.tag === 'task' ? '13px' : '17px',
                whiteSpace: 'pre-wrap',
                maxHeight: '280px',
                overflowY: 'auto'
              }}>
                <strong>{previewTemplate.title}</strong>
                <div style={{ marginTop: '8px', lineHeight: 1.5 }}>
                  {previewTemplate.content}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setPreviewId(null)}>Cancel</button>
              <button className="btn-submit" onClick={() => handleCreateFromTemplate(previewId)}>
                ✨ Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
