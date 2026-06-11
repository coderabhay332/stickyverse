import React, { useState } from 'react';
import { useAppContext } from '../App';

export function TopBar() {
  const { 
    setModalOpen, 
    setModalType, 
    setEditingNote, 
    user, 
    supabase, 
    searchQuery, 
    setSearchQuery,
    notes,
    setNotes
  } = useAppContext();

  const [showNotifications, setShowNotifications] = useState(false);

  const triggeredNotes = notes.filter(n => n.reminder && n.reminderTriggered);

  const handleClearNotif = async (e, noteId) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, reminder: null, reminderTriggered: false, updated: Date.now(), synced: false } : n);
    setNotes(updatedNotes);
    if (user && supabase) {
      const { error } = await supabase.from('notes').update({
        items: {
          customColor: note.customColor || null,
          fontColor: note.fontColor || null,
          realPriority: note.priority || 'none',
          reminder: null,
          reminderTriggered: false
        },
        updated_at: new Date().toISOString()
      }).eq('id', noteId);
      if (!error) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, synced: true } : n));
      }
    }
  };

  const handleClearAllNotifs = async () => {
    const updatedNotes = notes.map(n => n.reminderTriggered ? { ...n, reminder: null, reminderTriggered: false, updated: Date.now(), synced: false } : n);
    setNotes(updatedNotes);
    if (user && supabase) {
      const triggeredIds = triggeredNotes.map(n => n.id);
      for (const id of triggeredIds) {
        try {
          const note = notes.find(n => n.id === id);
          if (note) {
            const { error } = await supabase.from('notes').update({
              items: {
                customColor: note.customColor || null,
                fontColor: note.fontColor || null,
                realPriority: note.priority || 'none',
                reminder: null,
                reminderTriggered: false
              },
              updated_at: new Date().toISOString()
            }).eq('id', id);
            if (!error) {
              setNotes(prev => prev.map(n => n.id === id ? { ...n, synced: true } : n));
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleNotifClick = (note) => {
    setEditingNote(note);
    setModalType(note.tag || 'note');
    setModalOpen(true);
    setShowNotifications(false);
  };

  return (
    <div className="topbar" style={{ position: 'relative' }}>
      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search notes, tasks, ideas..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <span className="search-hint">⌘K</span>
      </div>

      {/* Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notification Bell Button */}
        <button
          className="topbar-btn"
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ position: 'relative', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px' }}
          title="Notifications"
        >
          🔔 {triggeredNotes.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {triggeredNotes.length}
            </span>
          )}
        </button>
      </div>

      {showNotifications && (
        <div className="notif-dropdown" style={{
          position: 'absolute',
          top: '52px',
          right: '0px',
          width: '320px',
          background: 'rgba(26, 22, 40, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>🔔 Reminders</span>
            {triggeredNotes.length > 0 && (
              <button 
                onClick={handleClearAllNotifs}
                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear All
              </button>
            )}
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {triggeredNotes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '16px 0' }}>
                No active reminders
              </div>
            ) : (
              triggeredNotes.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotifClick(n)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', gap: '8px', 
                    padding: '8px 10px', background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', 
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title || 'Reminder'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {n.content || 'Your reminder is due'}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleClearNotif(e, n.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', alignSelf: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
