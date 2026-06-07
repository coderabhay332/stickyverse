import React from 'react';
import { useAppContext } from '../App';

export function SettingsView() {
  const { theme, setTheme, THEMES, globalFont, setGlobalFont, user, signIn, signOut, notes } = useAppContext();

  const clearData = () => {
    if (window.confirm('Clear all local data? This cannot be undone.')) {
      localStorage.removeItem('sv_notes');
      localStorage.removeItem('sv_links');
      localStorage.removeItem('sv_goals');
      window.location.reload();
    }
  };

  const downloadCSV = () => {
    if (!notes || notes.length === 0) {
      alert("No notes to export!");
      return;
    }
    
    // Define headers
    const headers = ["ID", "Title", "Content", "Type", "Status", "Priority", "Pinned", "Starred", "Archived", "Created Date", "Updated Date"];
    
    // Escape helper for CSV cells
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      // Replace double quotes with two double quotes
      str = str.replace(/"/g, '""');
      // If it contains double quotes, commas, newlines, wrap it in double quotes
      if (/[",\n\r]/.test(str)) {
        str = `"${str}"`;
      }
      return str;
    };

    const rows = notes.map(n => [
      n.id,
      n.title || "",
      n.content || "",
      n.tag || "note",
      n.status || "none",
      n.priority || "none",
      n.pinned ? "Yes" : "No",
      n.starred ? "Yes" : "No",
      n.archived ? "Yes" : "No",
      new Date(n.created).toISOString(),
      new Date(n.updated).toISOString()
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(escapeCSV).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stickyverse_notes_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Font Section */}
      <div className="settings-section">
        <div className="settings-section-title">✍️ Dashboard Font</div>
        <div className="widget" style={{ padding: '16px' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
            Choose the global font style for your workspace dashboard and note text:
          </div>
          <div className="tag-selector" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'sans', label: '✍️ Sans Serif (Modern)' },
              { id: 'serif', label: '📖 Serif (Editorial)' },
              { id: 'handwriting', label: '🎨 Handwriting (Retro)' },
              { id: 'mono', label: '💻 Monospace (Developer)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`tag-btn ${globalFont === f.id ? 'active' : ''}`}
                onClick={() => setGlobalFont(f.id)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              >
                {f.label}
              </button>
            ))}
          </div>
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
              onClick={downloadCSV}
              style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#a7f3d0' }}
            >
              📥 Download CSV Backup
            </button>
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
