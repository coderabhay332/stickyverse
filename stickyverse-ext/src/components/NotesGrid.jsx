import React, { useMemo } from 'react';
import { useAppContext } from '../App';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';

const TEMPLATES = [
  { id: 'meeting',   title: 'Meeting Notes',   em: '📝', desc: 'Attendees, agenda, action items checklist' },
  { id: 'project',   title: 'Project Plan',    em: '🚀', desc: 'Milestones, tasks, objectives checklist' },
  { id: 'daily',     title: 'Daily Review',    em: '☀️', desc: 'Reflection on wins and priorities checklist' },
  { id: 'habit',     title: 'Habit Tracker',   em: '✅', desc: 'Daily habit and routines checklist' },
  { id: 'learning',  title: 'Learning Log',    em: '📚', desc: 'Format for documenting concepts and questions' },
  { id: 'gratitude', title: 'Gratitude Journal',em: '🙏', desc: 'Simple log for gratitude list and wins' },
];

export function NotesGrid() {
  const { notes, filter, sortBy, searchQuery, setNotes, user, supabase } = useAppContext();

  const filtered = useMemo(() => {
    let arr = notes.filter(n => !n.archived);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (filter !== 'all') arr = arr.filter(n => n.tag === filter);

    // Sort
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
    return [...arr].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':      return a.created - b.created;
        case 'updated':     return (b.updated || b.created) - (a.updated || a.created);
        case 'priority':    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'alphabetical':return (a.title || '').localeCompare(b.title || '');
        default:            return b.created - a.created;
      }
    });
  }, [notes, filter, sortBy, searchQuery]);

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
    }
  };

  if (filtered.length === 0) {
    return (
      <div>
        <EmptyState message="No notes here yet" action="Click the + button to create your first note" />
        
        {/* Quick Templates Row */}
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
          <div style={{
            fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16
          }}>
            ✨ Quick Start Templates
          </div>
          <div className="templates-grid">
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                className="template-card"
                onClick={() => handleCreateFromTemplate(t.id)}
                style={{ padding: '16px 12px' }}
              >
                <div className="template-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>{t.em}</div>
                <div className="template-title" style={{ fontSize: '0.85rem', marginBottom: 2 }}>{t.title}</div>
                <div className="template-desc" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Separate pinned and non-pinned
  const pinned = filtered.filter(n => n.pinned);
  const nonPinned = filtered.filter(n => !n.pinned);

  return (
    <div>
      {/* Pinned Section */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div style={{
            fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span>📌</span> Pinned Notes
          </div>
          <div className="notes-masonry">
            {pinned.map((note, i) => <NoteCard key={note.id} note={note} index={i} />)}
          </div>
        </div>
      )}

      {/* Unified Notes Wall */}
      <div>
        {pinned.length > 0 && nonPinned.length > 0 && (
          <div style={{
            fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span>📝</span> Board Notes
          </div>
        )}
        <div className="notes-masonry">
          {nonPinned.map((note, i) => (
            <NoteCard key={note.id} note={note} index={pinned.length + i} />
          ))}
        </div>
      </div>

      {/* Quick Templates Row */}
      <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
        <div style={{
          fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16
        }}>
          ✨ Quick Start Templates
        </div>
        <div className="templates-grid">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="template-card"
              onClick={() => handleCreateFromTemplate(t.id)}
              style={{ padding: '16px 12px' }}
            >
              <div className="template-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>{t.em}</div>
              <div className="template-title" style={{ fontSize: '0.85rem', marginBottom: 2 }}>{t.title}</div>
              <div className="template-desc" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
