import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';

const TAG_COLORS = { note: 'purple', task: 'blue', checklist: 'blue', idea: 'yellow', quote: 'green', link: 'pink' };
const TAGS = ['note', 'task', 'checklist', 'idea', 'quote'];
const COLORS = [
  { id: 'purple', hex: '#EDE9FE' },
  { id: 'blue',   hex: '#DBEAFE' },
  { id: 'green',  hex: '#D1FAE5' },
  { id: 'yellow', hex: '#FEF9C3' },
  { id: 'pink',   hex: '#FCE7F3' },
  { id: 'orange', hex: '#FFEDD5' },
  { id: 'cream',  hex: '#FFFBEB' },
  { id: 'dark',   hex: '#1E1B4B' },
];
const PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'];

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

export function Modal({ type, onClose }) {
  const { setNotes, user, supabase, editingNote, setEditingNote, premiumUnlocked, setShowPremiumModal } = useAppContext();
  const [title, setTitle] = useState(editingNote && editingNote.title ? editingNote.title : '');
  const [content, setContent] = useState(editingNote && editingNote.content ? editingNote.content : (type === 'checklist' || type === 'task') ? '[ ] ' : '');
  const [color, setColor] = useState(editingNote && editingNote.color ? editingNote.color : 'purple');
  const [customColor, setCustomColor] = useState(editingNote && editingNote.customColor ? editingNote.customColor : '');
  const [tag, setTag] = useState(editingNote && editingNote.tag ? editingNote.tag : 'note');
  const [priority, setPriority] = useState(editingNote && editingNote.priority ? editingNote.priority : 'none');
  const [status, setStatus] = useState(editingNote && editingNote.status ? editingNote.status : 'none');
  const [font, setFont] = useState(editingNote && editingNote.font ? editingNote.font : 'default');
  const [reminder, setReminder] = useState(editingNote && editingNote.reminder ? editingNote.reminder : '');
  const [saving, setSaving] = useState(false);

  const savedIdRef = useRef(editingNote ? editingNote.id : null);
  const hasCreatedRef = useRef(!!editingNote);

  // Automatically insert checklist box or hyphen for new empty notes when tag toggles
  useEffect(() => {
    if (!editingNote && !title.trim() && !content.trim()) {
      if (tag === 'checklist') {
        setContent('[ ] ');
      } else if (tag === 'task') {
        setContent('- ');
      } else {
        setContent('');
      }
    }
  }, [tag]);

  // Handle smart lists (Space/Enter checkbox behaviors)
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // Get current line
      const beforeCursor = text.substring(0, start);
      const afterCursor = text.substring(end);
      const linesBefore = beforeCursor.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      // If hitting enter on an empty prefix, delete the prefix instead of making a new line
      if (currentLine === '[ ] ' || currentLine === '[x] ' || currentLine === '• ' || currentLine === '- ') {
        e.preventDefault();
        const newText = text.substring(0, start - currentLine.length) + '\n' + afterCursor;
        setContent(newText);
        const newCursorPos = start - currentLine.length + 1;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }

      // Check if current line has prefix to propagate
      let prefix = '';
      if (currentLine.startsWith('[x] ')) {
        prefix = '[ ] ';
      } else if (currentLine.startsWith('[ ] ')) {
        prefix = '[ ] ';
      } else if (currentLine.startsWith('• ')) {
        prefix = '• ';
      } else if (currentLine.startsWith('- ')) {
        prefix = '- ';
      } else if (tag === 'checklist') {
        prefix = '[ ] ';
      } else if (tag === 'task') {
        prefix = '- ';
      }

      if (prefix) {
        e.preventDefault();
        const newText = beforeCursor + '\n' + prefix + afterCursor;
        setContent(newText);

        const newCursorPos = start + 1 + prefix.length;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  // Autosave effect
  useEffect(() => {
    if (!hasCreatedRef.current && !title.trim() && !content.trim()) return;

    let targetId = savedIdRef.current;
    let isNew = !hasCreatedRef.current;

    // Reset reminderTriggered if the reminder changes or is newly set
    const isReminderChanged = editingNote ? editingNote.reminder !== reminder : reminder !== '';

    // Helper to format note for Supabase sync (to avoid columns count mismatch or violating CHECK constraints)
    const toRow = (n) => ({
      id: n.id,
      user_id: user?.id,
      title: n.title,
      content: n.content,
      type: n.tag === 'checklist' ? 'checklist' : n.tag === 'quote' ? 'quote' : 'note',
      style: n.tag === 'quote' ? 'polaroid' : 'regular', // standard fallback style
      color: ['purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark'].includes(n.color) ? n.color : 'purple', // db enum valid value
      tag: n.tag || 'note',
      status: n.status || 'none',
      priority: n.priority || 'medium',
      pinned: !!n.pinned,
      starred: !!n.starred,
      items: n.items || null,
      author: n.tag === 'quote' ? (n.title || '') : null,
      created_at: new Date(n.created).toISOString(),
      updated_at: new Date(n.updated).toISOString(),
    });

    if (isNew) {
      targetId = `note_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
      savedIdRef.current = targetId;
      hasCreatedRef.current = true;

      const newNote = {
        id: targetId,
        title: title.trim() || null,
        content: content.trim(),
        color,
        customColor: customColor || null,
        tag,
        priority,
        status,
        font,
        reminder: reminder || null,
        reminderTriggered: false,
        pinned: false,
        starred: false,
        archived: false,
        created: Date.now(),
        updated: Date.now(),
      };

      setNotes(prev => [newNote, ...prev]);

      if (user && supabase) {
        Promise.resolve(supabase.from('notes').insert(toRow(newNote))).catch(console.error);
      }
    } else {
      setNotes(prev => prev.map(n => n.id === targetId ? {
        ...n,
        title: title.trim() || null,
        content: content.trim(),
        color,
        customColor: customColor || null,
        tag,
        priority,
        status,
        font,
        reminder: reminder || null,
        reminderTriggered: isReminderChanged ? false : n.reminderTriggered,
        updated: Date.now()
      } : n));

      const timer = setTimeout(() => {
        if (user && supabase) {
          const updatedNote = {
            id: targetId,
            title: title.trim() || null,
            content: content.trim(),
            color,
            customColor: customColor || null,
            tag,
            priority,
            status,
            font,
            reminder: reminder || null,
            created: editingNote ? editingNote.created : Date.now(),
            updated: Date.now()
          };
          Promise.resolve(supabase.from('notes').update(toRow(updatedNote)).eq('id', targetId)).catch(console.error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [title, content, color, customColor, tag, priority, status, font, reminder]);

  const handleClose = () => {
    // Cleanup blank auto-created cards
    if (hasCreatedRef.current && !title.trim() && !content.trim()) {
      const targetId = savedIdRef.current;
      setNotes(prev => prev.filter(n => n.id !== targetId));
      if (user && supabase) {
        Promise.resolve(supabase.from('notes').delete().eq('id', targetId)).catch(console.error);
      }
    }
    setEditingNote(null);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this note?')) {
      const targetId = savedIdRef.current;
      setNotes(prev => prev.filter(n => n.id !== targetId));
      if (user && supabase) {
        try {
          await supabase.from('notes').delete().eq('id', targetId);
        } catch (e) {
          console.error(e);
        }
      }
      setEditingNote(null);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setEditingNote(null);
    onClose();
  };

  const handleApplyTemplate = (e) => {
    const selected = e.target.value;
    if (!selected) return;
    const template = TEMPLATES_MAP[selected];
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setColor(template.color);
      setTag(template.tag);
      setPriority(template.priority || 'none');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`modal font-${font}`}>
        <div className="modal-header">
          <h2>{editingNote ? '✏️ Edit' : '✨ New'} {tag.charAt(0).toUpperCase() + tag.slice(1)}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Tag selector */}
          <div className="form-group">
            <label>Type</label>
            <div className="tag-selector">
              {TAGS.map(t => (
                <button key={t} type="button" className={`tag-btn ${tag === t ? 'active' : ''}`} onClick={() => setTag(t)}>
                  {t === 'note' ? '📝' : t === 'task' ? '✅' : t === 'checklist' ? '☑️' : t === 'idea' ? '💡' : '💬'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selector dropdown */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Insert Template</span>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>(Fills title, content, color, and type)</span>
            </label>
            <select
              className="glass-select"
              value=""
              onChange={handleApplyTemplate}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            >
              <option value="">-- Apply a Template --</option>
              <option value="meeting">📝 Meeting Notes</option>
              <option value="project">🚀 Project Plan</option>
              <option value="daily">☀️ Daily Review</option>
              <option value="habit">✅ Habit Tracker</option>
              <option value="learning">📚 Learning Log</option>
              <option value="gratitude">🙏 Gratitude Journal</option>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter a title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content</label>
            <textarea
              className="modal-textarea"
              placeholder={tag === 'task' ? "• Task item\n• Another task\n[x] Completed task" : tag === 'checklist' ? "Attendees & Time\nAgenda Items\nKey Decisions" : "Write something..."}
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {COLORS.map(c => (
                <div
                  key={c.id}
                  className={`color-swatch ${color === c.id && !customColor ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    setColor(c.id);
                    setCustomColor('');
                  }}
                  title={c.id}
                />
              ))}
              {/* Custom Color Picker Swatch */}
              <div
                className={`color-swatch custom-swatch ${customColor ? 'selected' : ''}`}
                style={{
                  background: customColor || 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  border: customColor ? '2px solid #fff' : 'none'
                }}
                title="Custom Color"
                onClick={() => document.getElementById('custom-color-input').click()}
              >
                🌈
                <input
                  type="color"
                  id="custom-color-input"
                  value={customColor || '#7C3AED'}
                  onChange={e => {
                    setCustomColor(e.target.value);
                    setColor('custom'); // standard color key ignored since customColor takes priority
                  }}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <div className="tag-selector">
              {PRIORITIES.map(p => (
                <button key={p} type="button" className={`tag-btn ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                  {p === 'none' ? 'None' : p === 'low' ? '🟢 Low' : p === 'medium' ? '🟡 Medium' : p === 'high' ? '🟠 High' : '🔴 Urgent'}
                </button>
              ))}
            </div>
          </div>

          {/* Work Status */}
          <div className="form-group">
            <label>Work Status</label>
            <select
              className="glass-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
            >
              <option value="none">— None —</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="delayed">⏳ Delayed</option>
              <option value="waiting">🕐 Waiting for Approval</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          {/* Reminder Date & Time */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⏰ Set Reminder (Optional)</span>
              {reminder && (
                <button
                  type="button"
                  onClick={() => setReminder('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '0 4px',
                    fontWeight: 600,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Clear
                </button>
              )}
            </label>
            <input
              type="datetime-local"
              className="modal-input"
              value={reminder}
              onChange={e => setReminder(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          {/* Font Selector */}
          <div className="form-group">
            <label>Font Style</label>
            <div className="tag-selector" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'default', label: 'Sans', premium: false },
                { id: 'handwriting', label: 'Cursive', premium: false },
                { id: 'mono', label: 'Mono', premium: false },
                { id: 'serif', label: 'Serif', premium: false },
                { id: 'signature', label: '✒️ Signature 👑', premium: true },
                { id: 'playful', label: '🎈 Playful 👑', premium: true },
                { id: 'chalkboard', label: '✏️ Chalkboard 👑', premium: true },
                { id: 'dyslexic', label: '👁️ Dyslexic 👑', premium: true },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`tag-btn ${font === f.id ? 'active' : ''}`}
                  onClick={() => {
                    if (f.premium && !premiumUnlocked) {
                      setShowPremiumModal(true);
                    } else {
                      setFont(f.id);
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {savedIdRef.current && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleDelete}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', fontSize: '12px' }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-cancel" onClick={handleClose}>Cancel</button>
              <button type="submit" className="btn-submit">Done</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
