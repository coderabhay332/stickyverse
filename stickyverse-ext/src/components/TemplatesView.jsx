import React from 'react';
import { useAppContext } from '../App';

const TEMPLATES = [
  { id: 'meeting',   title: 'Meeting Notes',   em: '📝', desc: 'Attendees, agenda, action items checklist' },
  { id: 'project',   title: 'Project Plan',    em: '🚀', desc: 'Milestones, tasks, objectives checklist' },
  { id: 'daily',     title: 'Daily Review',    em: '☀️', desc: 'Reflection on wins and priorities checklist' },
  { id: 'habit',     title: 'Habit Tracker',   em: '✅', desc: 'Daily habit and routines checklist' },
  { id: 'learning',  title: 'Learning Log',    em: '📚', desc: 'Format for documenting concepts and questions' },
  { id: 'gratitude', title: 'Gratitude Journal',em: '🙏', desc: 'Simple log for gratitude list and wins' },
];

export function TemplatesView() {
  const { setNotes, setView, user, supabase } = useAppContext();

  const handleCreateFromTemplate = async (type) => {
    const templates = {
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

    const template = templates[type];
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
      
      setView('home'); // Go to Home to see the new note card!
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="view-head">
        <h2 className="view-title">📝 Templates</h2>
        <p className="view-sub">Quick-start templates for common tasks and productivity structures</p>
      </div>

      <div className="templates-grid" style={{ marginTop: '24px' }}>
        {TEMPLATES.map(t => (
          <div
            key={t.id}
            className="template-card"
            onClick={() => handleCreateFromTemplate(t.id)}
          >
            <div className="template-icon">{t.em}</div>
            <div className="template-title">{t.title}</div>
            <div className="template-desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
