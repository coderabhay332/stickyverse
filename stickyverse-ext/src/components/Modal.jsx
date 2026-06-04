import React, { useState } from 'react';
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

export function Modal({ type, onClose }) {
  const { setNotes, setLinks, user, supabase, editingNote, setEditingNote } = useAppContext();
  const [title, setTitle] = useState(editingNote ? editingNote.title || '' : '');
  const [content, setContent] = useState(editingNote ? editingNote.content || '' : '');
  const [color, setColor] = useState(editingNote ? editingNote.color : 'purple');
  const [tag, setTag] = useState(editingNote ? editingNote.tag : 'note');
  const [priority, setPriority] = useState(editingNote ? editingNote.priority : 'none');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setEditingNote(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    setSaving(true);

    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        title: title.trim() || null,
        content: content.trim(),
        color, tag, priority,
        updated: Date.now(),
      };

      setNotes(prev => prev.map(n => n.id === editingNote.id ? updatedNote : n));

      if (user && supabase) {
        try {
          await supabase.from('notes').update({
            title: updatedNote.title,
            content: updatedNote.content,
            color: updatedNote.color,
            tag: updatedNote.tag,
            priority: updatedNote.priority,
            updated: updatedNote.updated,
          }).eq('id', editingNote.id);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        title: title.trim() || null,
        content: content.trim(),
        color, tag, priority,
        status: 'none',
        pinned: false, starred: false, archived: false,
        created: Date.now(), updated: Date.now(),
      };

      setNotes(prev => [newNote, ...prev]);

      if (user && supabase) {
        try { await supabase.from('notes').insert(newNote); } catch {}
      }
    }

    setSaving(false);
    setEditingNote(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{editingNote ? '✏️ Edit' : '✨ New'} {tag.charAt(0).toUpperCase() + tag.slice(1)}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div
                  key={c.id}
                  className={`color-swatch ${color === c.id ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.id)}
                  title={c.id}
                />
              ))}
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

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Saving...' : editingNote ? '✨ Update Note' : '✨ Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
