import React from 'react';
import { useAppContext } from '../App';

const NAV_NAVIGATION = [
  { id: 'home',      label: 'Home',       icon: '🏠' },
  { id: 'pinned',    label: 'Pinned',     icon: '📌' },
  { id: 'links',     label: 'Link Vault', icon: '🔗' },
  { id: 'templates', label: 'Templates',  icon: '📝' },
  { id: 'widgets',   label: 'Widgets',    icon: '🧩' },
  { id: 'archive',   label: 'Archive',    icon: '📦' },
];

const NAV_CUSTOMIZE = [
  { id: 'themes',    label: 'Themes',     icon: '🎨' },
  { id: 'settings',  label: 'Settings',   icon: '⚙️' },
];

export function Sidebar() {
  const { view, setView, notes, links, user, signIn, signOut } = useAppContext();

  const pinnedCount = notes.filter(n => n.pinned && !n.archived).length;
  const linksCount = links.length;
  const archiveCount = notes.filter(n => n.archived).length;

  const getCount = (id) => {
    if (id === 'pinned') return pinnedCount;
    if (id === 'links') return linksCount;
    if (id === 'archive') return archiveCount;
    return null;
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo" onClick={() => setView('home')}>
        <div className="logo-mark">✦</div>
        <div className="logo-text">
          <span className="logo-sticky">Sticky</span>
          <span className="logo-verse">Verse</span>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="nav-group">
        <div className="nav-section-label">Navigation</div>
        {NAV_NAVIGATION.map(item => {
          const count = getCount(item.id);
          return (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {count > 0 && <span className="nav-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Customize Group */}
      <div className="nav-group" style={{ marginTop: '16px' }}>
        <div className="nav-section-label">Customize</div>
        {NAV_CUSTOMIZE.map(item => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer / Follow Button & Account */}
      <div className="sb-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {user ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.55)',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                display: 'inline-block'
              }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {user.email}
              </span>
            </div>
            <button 
              className="follow-btn" 
              onClick={signOut}
              style={{
                borderRadius: '8px',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            className="follow-btn" 
            onClick={signIn}
            style={{
              borderRadius: '8px',
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              cursor: 'pointer'
            }}
          >
            Sign In ✨
          </button>
        )}

        <a className="follow-btn" href="https://x.com/zero2tenx" target="_blank" rel="noopener noreferrer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Follow @zero2tenx
        </a>
      </div>
    </aside>
  );
}