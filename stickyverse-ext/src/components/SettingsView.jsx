import React from 'react';
import { useAppContext } from '../App';

export function SettingsView() {
  const { theme, setTheme, THEMES, user, signIn, signOut } = useAppContext();

  const clearData = () => {
    if (window.confirm('Clear all local data? This cannot be undone.')) {
      localStorage.removeItem('sv_notes');
      localStorage.removeItem('sv_links');
      localStorage.removeItem('sv_goals');
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="view-head">
        <h2 className="view-title">⚙️ Settings</h2>
        <p className="view-sub">Customize your StickyVerse experience</p>
      </div>

      {/* Theme Section */}
      <div className="settings-section">
        <div className="settings-section-title">🎨 Theme</div>
        <div className="theme-grid">
          {THEMES.map(t => (
            <div
              key={t.id}
              className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
              style={{ background: t.bg }}
              title={t.label}
            >
              <div
                className="theme-swatch-preview"
                style={{ background: `linear-gradient(135deg, ${t.b1}, ${t.b4})` }}
              />
              <div className="theme-swatch-name" style={{ color: t.text }}>
                {t.em} {t.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="settings-section">
        <div className="settings-section-title">👤 Account</div>
        <div className="widget" style={{ marginBottom: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Geist Mono, monospace' }}>
                  {user.email}
                </div>
                <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  Cloud sync active
                </div>
              </div>
              <button className="topbar-btn" onClick={signOut} style={{ marginTop: 0 }}>Sign Out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Guest Mode</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Sign in to sync notes across devices</div>
              </div>
              <button className="topbar-btn primary" onClick={signIn}>Sign In with Email ✨</button>
            </div>
          )}
        </div>
      </div>

      {/* Data Section */}
      <div className="settings-section">
        <div className="settings-section-title">💾 Data</div>
        <div className="widget">
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.5 }}>
            All notes are stored locally in your browser. Sign in to enable cloud backup and sync across devices.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="topbar-btn"
              onClick={clearData}
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="settings-section">
        <div className="settings-section-title">ℹ️ About</div>
        <div className="widget">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>✦</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                StickyVerse ✨
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Geist Mono, monospace' }}>
                v1.0.0 · Your aesthetic productivity OS
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Built with ❤️ by{' '}
            <a href="https://x.com/zero2tenx" target="_blank" rel="noopener noreferrer"
               style={{ color: '#d2bbff', textDecoration: 'none' }}>@zero2tenx</a>
          </div>
        </div>
      </div>
    </div>
  );
}
