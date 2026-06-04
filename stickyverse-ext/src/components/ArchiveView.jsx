import React from 'react';
import { useAppContext } from '../App';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';

export function ArchiveView() {
  const { notes, setNotes } = useAppContext();
  const archived = notes.filter(n => n.archived);

  const handleRestore = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, archived: false } : n));
  };

  return (
    <div>
      <div className="view-head">
        <h2 className="view-title">📦 Archive</h2>
        <p className="view-sub">Notes you've archived — restore them anytime</p>
      </div>
      {archived.length === 0
        ? <EmptyState message="Archive is empty" action="Archive a note to move it here" />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {archived.map((note, i) => (
              <div key={note.id} style={{ position: 'relative', opacity: 0.75 }}>
                <NoteCard note={note} index={i} />
                <button
                  onClick={() => handleRestore(note.id)}
                  style={{
                    position: 'absolute', top: 8, left: 8,
                    padding: '4px 10px', borderRadius: 99,
                    background: 'rgba(124,58,237,0.8)', color: '#fff',
                    border: 'none', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                  }}
                >
                  ↩ Restore
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
