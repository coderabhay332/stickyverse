import React from 'react';
import { useAppContext } from '../App';

export function TopBar() {
  const { setModalOpen, setModalType, user, signIn, signOut, searchQuery, setSearchQuery } = useAppContext();

  return (
    <div className="topbar">
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
      <div className="topbar-actions">
        <button
          className="topbar-btn"
          onClick={() => { setModalType('link'); setModalOpen(true); }}
          title="Save current tab"
        >
          🔖 Save Tab
        </button>

        {user ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'rgba(255,255,255,0.55)',
              padding: '0 4px',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                display: 'inline-block'
              }} />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>
            <button className="topbar-btn" onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <button className="topbar-btn primary" onClick={signIn}>
            Sign In ✨
          </button>
        )}
      </div>
    </div>
  );
}
