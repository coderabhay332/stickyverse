import React, { useState } from 'react';
import { useAppContext } from '../App';

const TAG_ICONS = { note: '📝', task: '✅', checklist: '☑️', idea: '💡', quote: '💬', link: '🔗' };
const TAG_LABELS = { note: 'Note', task: 'Task', checklist: 'Checklist', idea: 'Idea', quote: 'Quote', link: 'Link' };

const COLOR_MAP = {
  yellow: '#FEF9C3', pink: '#FCE7F3', purple: '#EDE9FE',
  green: '#D1FAE5', blue: '#DBEAFE', orange: '#FFEDD5',
  cream: '#FFFBEB', dark: '#1E1B4B',
};

const STATUS_MAP = {
  'completed':   { label: '✅ Completed',            cls: 'status-completed'   },
  'in-progress': { label: '🔄 In Progress',          cls: 'status-in-progress' },
  'delayed':     { label: '⏳ Delayed',               cls: 'status-delayed'     },
  'waiting':     { label: '🕐 Waiting for Approval', cls: 'status-waiting'     },
  'cancelled':   { label: '❌ Cancelled',             cls: 'status-cancelled'   },
};

const fmtFullDate = ts => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  
  // Strip time from both dates to compare calendar days
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = nowDate - dDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else if (diffDays < 7 && diffDays > 0) {
    return `${d.toLocaleDateString([], {weekday:'short'})}, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else {
    return d.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'}) + ' · ' +
           d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }
};

export function NoteCard({ note, index }) {
  const { setNotes, user, supabase, setEditingNote, setModalType, setModalOpen } = useAppContext();
  const [hovered, setHovered] = useState(false);

  const bgColor = COLOR_MAP[note.color] || '#EDE9FE';
  const isDark = note.color === 'dark';
  const textColor = isDark ? '#c7d2fe' : undefined;

  const hasWashiTape = note.hasTape || note.tag === 'idea' || note.tag === 'quote';
  const hasSpiral = note.style === 'notebook' || note.tag === 'task' || note.tag === 'checklist';

  const handlePin = async (e) => {
    e.stopPropagation();
    const updated = { ...note, pinned: !note.pinned, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ pinned: updated.pinned }).eq('id', note.id);
  };

  const handleStar = async (e) => {
    e.stopPropagation();
    const updated = { ...note, starred: !note.starred, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ starred: updated.starred }).eq('id', note.id);
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    const updated = { ...note, archived: true, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ archived: true }).eq('id', note.id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== note.id));
    if (user && supabase) await supabase.from('notes').delete().eq('id', note.id);
  };

  const handleCycleStatus = async (e) => {
    e.stopPropagation();
    const CYCLE = ['none', 'in-progress', 'completed', 'delayed', 'waiting', 'cancelled'];
    const idx = CYCLE.indexOf(note.status || 'none');
    const nextStatus = CYCLE[(idx + 1) % CYCLE.length];
    const updated = { ...note, status: nextStatus, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ status: updated.status }).eq('id', note.id);
  };

  const handleToggleCompleted = async (e) => {
    e.stopPropagation();
    const isCompleted = note.status === 'completed';
    const nextStatus = isCompleted ? 'none' : 'completed';
    const updated = { ...note, status: nextStatus, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ status: updated.status }).eq('id', note.id);
  };

  const handleToggleChecklist = async (e, lineIndex) => {
    e.stopPropagation();
    const isChecklistTag = note.tag === 'checklist';
    const contentLines = (note.content || '').split('\n');
    
    let checklistCount = 0;
    const updatedLines = contentLines.map(line => {
      const isChecklistItem = isChecklistTag 
        ? line.trim() !== ''
        : (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('[ ]') || line.startsWith('[x]'));
        
      if (isChecklistItem) {
        if (checklistCount === lineIndex) {
          checklistCount++;
          let cleanLine = line;
          let wasChecked = false;
          
          if (line.startsWith('[x]')) {
            cleanLine = line.substring(3).trim();
            wasChecked = true;
          } else if (line.startsWith('[ ]')) {
            cleanLine = line.substring(3).trim();
            wasChecked = false;
          } else if (line.startsWith('• ')) {
            cleanLine = line.substring(2).trim();
            wasChecked = false;
          } else if (line.startsWith('- ')) {
            cleanLine = line.substring(2).trim();
            wasChecked = false;
          } else {
            cleanLine = line.trim();
            wasChecked = false;
          }
          
          return wasChecked ? '[ ] ' + cleanLine : '[x] ' + cleanLine;
        }
        checklistCount++;
      }
      return line;
    });

    const updatedContent = updatedLines.join('\n');
    const updated = { ...note, content: updatedContent, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ content: updated.content }).eq('id', note.id);
  };

  // Parse content lines
  const isChecklistTag = note.tag === 'checklist';
  const lines = (note.content || '').split('\n');
  
  let checklistItems = [];
  let regularContent = '';
  
  if (isChecklistTag) {
    checklistItems = lines
      .filter(l => l.trim() !== '')
      .map(line => {
        if (line.startsWith('[x]') || line.startsWith('[ ]') || line.startsWith('• ') || line.startsWith('- ')) {
          return line;
        }
        return '[ ] ' + line;
      });
  } else {
    checklistItems = lines.filter(l => l.startsWith('• ') || l.startsWith('- ') || l.startsWith('[ ]') || l.startsWith('[x]'));
    const regularLines = lines.filter(l => !l.startsWith('• ') && !l.startsWith('- ') && !l.startsWith('[ ]') && !l.startsWith('[x]'));
    regularContent = regularLines.join('\n').trim();
  }

  const tapeColorClass = note.tapeColor || 'tape-yellow';

  const handleCardClick = (e) => {
    if (
      e.target.closest('.note-actions') || 
      e.target.closest('.note-action-btn') || 
      e.target.closest('.checkbox') || 
      e.target.closest('.note-status')
    ) {
      return;
    }
    setEditingNote(note);
    setModalType('note');
    setModalOpen(true);
  };

  const defaultDoodle = note.doodle || (note.tag === 'task' ? '🚀' : note.tag === 'idea' ? '💡' : note.tag === 'quote' ? '💬' : null);

  return (
    <div
      className={`note-card note-${note.color || 'purple'} ${hasSpiral ? 'has-spiral' : ''}`}
      style={{
        animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      {/* Pushpin */}
      {(note.pinned || (note.pin && note.pin !== 'none')) && (
        <div className={`pushpin pin-${note.pin || 'red'}`}>
          <div className="pin-head" />
          <div className="pin-stem" />
        </div>
      )}

      {/* Washi Tape */}
      {hasWashiTape && <div className={`washi-tape ${tapeColorClass}`} />}

      {/* Left Spiral binding */}
      {hasSpiral && (
        <div className="spiral-binding-left">
          {[...Array(8)].map((_, i) => <div key={i} className="spiral-ring-left" />)}
        </div>
      )}

      <div className="note-inner" data-canvas-id={note.id}>
        {/* Status Badge */}
        {note.status && note.status !== 'none' && STATUS_MAP[note.status] && (
          <div 
            className={`note-status ${STATUS_MAP[note.status].cls}`}
            onClick={handleCycleStatus}
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            {STATUS_MAP[note.status].label}
          </div>
        )}

        {/* Tag badge (if different from default note) */}
        {note.tag && note.tag !== 'note' && (
          <div className="note-tag" style={{ display: note.status && note.status !== 'none' ? 'block' : 'inline-block' }}>
            {TAG_ICONS[note.tag]} {TAG_LABELS[note.tag]}
          </div>
        )}

        {/* Content Body */}
        {note.tag === 'quote' ? (
          <div className="quote-body" style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="quote-marks" style={{ fontSize: '36px', color: '#EC4899', lineHeight: 0.8, marginBottom: 8, fontFamily: 'Georgia, serif' }}>”</div>
            <div className="note-content" style={{ fontStyle: 'italic', fontSize: '16px', marginBottom: 12, fontFamily: 'Caveat, cursive', color: isDark ? '#ede9fe' : '#2a2050' }}>
              {note.content}
            </div>
            {note.title && (
              <div className="quote-author" style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', color: '#EC4899', fontWeight: 'bold' }}>
                — {note.title}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Title */}
            {note.title && (
              <div className="note-title">
                {note.title}
              </div>
            )}

            {/* Regular content */}
            {regularContent && (
              <div className="note-content">{regularContent}</div>
            )}

            {/* Checklist items */}
            {checklistItems.length > 0 && (
              <ul className="checklist" style={{ marginTop: regularContent ? 10 : 0 }}>
                {checklistItems.map((item, i) => {
                  const isChecked = item.startsWith('[x]');
                  const text = item.replace(/^(\[x\]|\[\s\]|\[ \]|•|-)\s?/, '').trim();
                  return (
                    <li 
                      key={i} 
                      className={`checklist-item ${isChecked ? 'checked' : ''}`}
                      onClick={(e) => handleToggleChecklist(e, i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="checkbox">{isChecked ? '✓' : ''}</span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* Priority Badge */}
        {note.priority && note.priority !== 'none' && (
          <div style={{ marginTop: 8 }}>
            <span className={`priority-badge priority-${note.priority}`}>
              {{ low: '🟢 Low', medium: '🟡 Med', high: '🔴 High', urgent: '🚨 Urgent' }[note.priority] || note.priority.toUpperCase()}
            </span>
          </div>
        )}

        {/* Doodle in background */}
        {defaultDoodle && (
          <div className="note-doodle">{defaultDoodle}</div>
        )}

        {/* Folded corner */}
        <div className="folded-corner" />

        {/* Footer */}
        <div className="note-footer">
          <span className="note-date">📅 {fmtFullDate(note.created)}</span>
          <div className="note-actions" style={{ opacity: hovered ? 1 : 0 }}>
            <button 
              className="note-action-btn" 
              onClick={handleToggleCompleted} 
              title={note.status === 'completed' ? 'Mark Active' : 'Mark Completed'}
              style={{ color: note.status === 'completed' ? '#10B981' : 'inherit' }}
            >
              {note.status === 'completed' ? '✅' : '✔️'}
            </button>
            <button className="note-action-btn" onClick={handlePin} title={note.pinned ? 'Unpin' : 'Pin'}>
              {note.pinned ? '📍' : '📌'}
            </button>
            <button className="note-action-btn" onClick={handleStar} title={note.starred ? 'Unstar' : 'Star'}>
              {note.starred ? '⭐' : '☆'}
            </button>
            <button className="note-action-btn" onClick={handleCycleStatus} title="Cycle Status">🏷️</button>
            <button className="note-action-btn" onClick={handleArchive} title="Archive">📦</button>
            <button className="note-action-btn" onClick={handleDelete} title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}