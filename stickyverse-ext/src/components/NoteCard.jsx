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
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString([], { month: 'short' });
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day} ${month} ${year} · ${timeStr}`;
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

  const handleColorChange = async (colorName) => {
    const updated = { ...note, color: colorName, updated: Date.now() };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (user && supabase) await supabase.from('notes').update({ color: updated.color }).eq('id', note.id);
  };

  const handleToggleChecklist = async (e, lineIndex) => {
    e.stopPropagation();
    const contentLines = (note.content || '').split('\n');
    const isChecklistTag = note.tag === 'checklist';
    let checklistCount = 0;
    
    const updatedLines = contentLines.map(line => {
      const isChecked = line.startsWith('[x]') || line.startsWith('[x] ');
      const isUnchecked = line.startsWith('[ ]') || line.startsWith('[ ] ');
      const isChecklistItem = isChecklistTag ? line.trim() !== '' : (isChecked || isUnchecked);
      
      if (isChecklistItem) {
        if (checklistCount === lineIndex) {
          checklistCount++;
          if (isChecked) {
            const cleanText = line.replace(/^\[x\]\s?/, '');
            return '[ ] ' + cleanText;
          } else {
            const cleanText = line.replace(/^\[ \]\s?/, '').replace(/^(•|-)\s?/, '');
            return '[x] ' + cleanText;
          }
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

  // Parse content lines in original order for rendering
  const contentLines = (note.content || '').split('\n');
  const isChecklistTag = note.tag === 'checklist';
  let checklistCount = 0;

  const renderedContentLines = contentLines.map((line, idx) => {
    const isChecked = line.startsWith('[x]') || line.startsWith('[x] ');
    const isUnchecked = line.startsWith('[ ]') || line.startsWith('[ ] ');
    const isChecklistItem = isChecklistTag ? line.trim() !== '' : (isChecked || isUnchecked);

    if (isChecklistItem) {
      const currentChecklistIndex = checklistCount;
      checklistCount++;

      const cleanText = line
        .replace(/^\[x\]\s?/, '')
        .replace(/^\[ \]\s?/, '')
        .replace(/^(•|-)\s?/, '');

      return (
        <div 
          key={idx}
          className={`checklist-item ${isChecked ? 'checked' : ''}`}
          onClick={(e) => handleToggleChecklist(e, currentChecklistIndex)}
          style={{ cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <span className="checkbox">✓</span>
          <span>{cleanText || '\u00A0'}</span>
        </div>
      );
    }

    // Check if it's a bullet/dash list item
    const isBulletItem = line.startsWith('•') || line.startsWith('• ') || line.startsWith('-') || line.startsWith('- ');
    if (isBulletItem && !isChecklistTag) {
      const cleanText = line.replace(/^(•|-)\s?/, '');
      return (
        <div 
          key={idx} 
          className="bullet-item" 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center', 
            margin: '6px 0', 
            paddingLeft: '4px',
            opacity: 0.85
          }}
        >
          <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '14.5px', fontWeight: 'bold' }}>-</span>
          <span>{cleanText || '\u00A0'}</span>
        </div>
      );
    }

    // Otherwise, regular line of text
    if (line.trim() === '') {
      return <div key={idx} style={{ height: '8px' }} />;
    }

    return (
      <div key={idx} className="note-text-line" style={{ margin: '2px 0' }}>
        {line}
      </div>
    );
  });

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
      className={`note-card note-${note.color || 'purple'} font-${note.font || 'default'} ${hasSpiral ? 'has-spiral' : ''}`}
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
            {renderedContentLines.length > 0 && (
              <div className="note-content" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {renderedContentLines}
              </div>
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

        {/* Reminder Badge */}
        {note.reminder && (
          <div style={{ marginTop: 8 }}>
            <span className="reminder-badge" style={{
              background: 'rgba(236,72,153,0.12)',
              border: '1px solid rgba(236,72,153,0.3)',
              color: '#F472B6',
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}>
              ⏰ {new Date(note.reminder).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
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
            <div className="note-color-picker-wrapper" onClick={e => e.stopPropagation()}>
              <button 
                type="button" 
                className="note-action-btn" 
                title="Change Color"
                onClick={e => e.preventDefault()}
              >
                🎨
              </button>
              <div className="note-color-palette-popover">
                {Object.keys(COLOR_MAP).map(cName => (
                  <div 
                    key={cName}
                    className="color-dot"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(cName);
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: COLOR_MAP[cName],
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                    title={cName}
                  />
                ))}
              </div>
            </div>
            <button className="note-action-btn" onClick={handleCycleStatus} title="Cycle Status">🏷️</button>
            <button className="note-action-btn" onClick={handleArchive} title="Archive">📦</button>
            <button className="note-action-btn" onClick={handleDelete} title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}