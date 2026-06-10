import React from 'react';
import { useAppContext } from '../App';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';

export function StarredView() {
  const { notes } = useAppContext();
  const starred = notes.filter(n => n.starred && !n.archived && n.title !== '__sv_streaks__');

  return (
    <div>
      <div className="view-head">
        <h2 className="view-title">⭐ Starred Notes</h2>
        <p className="view-sub">Notes you've starred for quick access</p>
      </div>
      {starred.length === 0
        ? <EmptyState message="No starred notes" action="Star a note to see it here" />
        : (
          <div className="notes-masonry">
            {starred.map((note, i) => <NoteCard key={note.id} note={note} index={i} />)}
          </div>
        )
      }
    </div>
  );
}
