import React from 'react';
import { useAppContext } from '../App';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';

export function PinnedView() {
  const { notes } = useAppContext();
  const pinned = notes.filter(n => n.pinned && !n.archived);

  return (
    <div>
      <div className="view-head">
        <h2 className="view-title">📌 Pinned Notes</h2>
        <p className="view-sub">Your most important notes, always at the top</p>
      </div>
      {pinned.length === 0
        ? <EmptyState message="No pinned notes" action="Pin a note to see it here" />
        : (
          <div className="notes-masonry">
            {pinned.map((note, i) => <NoteCard key={note.id} note={note} index={i} />)}
          </div>
        )
      }
    </div>
  );
}
