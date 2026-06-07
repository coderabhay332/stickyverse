import React, { useState } from 'react';
import { useAppContext } from '../App';

const WALLPAPERS = [
  { id: 'none', name: 'None (Solid Color)', url: 'none', preview: 'rgba(255,255,255,0.05)' },
  { id: 'lofi', name: 'Lofi Desk ☕', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=120' },
  { id: 'cyber', name: 'Neon City 🌌', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=120' },
  { id: 'minimal', name: 'Warm Textures 🍃', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=120' },
  { id: 'forest', name: 'Deep Forest 🌲', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=120' },
  { id: 'ocean', name: 'Ocean Shore 🌊', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=120' },
  { id: 'rose', name: 'Pastel Clouds 🌸', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200', preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=120' },
];

export function ThemesView() {
  const { theme, setTheme, THEMES, wallpaper, setWallpaper, premiumUnlocked, setShowPremiumModal } = useAppContext();
  const [customUrl, setCustomUrl] = useState(
    wallpaper && !WALLPAPERS.find(w => w.url === wallpaper) && wallpaper !== 'none' ? wallpaper : ''
  );

  const handleSelectWallpaper = (url) => {
    if (url !== 'none' && !premiumUnlocked) {
      setShowPremiumModal(true);
      return;
    }
    setWallpaper(url);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!premiumUnlocked) {
      setShowPremiumModal(true);
      return;
    }
    if (customUrl.trim()) {
      setWallpaper(customUrl.trim());
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="view-head">
        <h2 className="view-title">🎨 Themes & Wallpapers</h2>
        <p className="view-sub">Pick your vibe — choose from curated palettes or set a background wallpaper</p>
      </div>

      {/* Palette Section */}
      <div className="settings-section" style={{ marginTop: '24px' }}>
        <div className="settings-section-title">✨ Curated Palettes</div>
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

      {/* Wallpaper Section */}
      <div className="settings-section" style={{ marginTop: '32px' }}>
        <div className="settings-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🖼️ Wallpaper Backgrounds 👑</span>
          {!premiumUnlocked && (
            <span style={{ fontSize: '11px', color: '#a78bfa', textTransform: 'none', letterSpacing: 'normal' }}>
              🔒 Upgrade to unlock wallpapers
            </span>
          )}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '12px'
        }}>
          {WALLPAPERS.map(w => {
            const isSelected = wallpaper === w.url;
            const isNone = w.id === 'none';
            return (
              <div
                key={w.id}
                onClick={() => handleSelectWallpaper(w.url)}
                style={{
                  height: '84px',
                  borderRadius: '12px',
                  border: isSelected ? '2.5px solid #d2bbff' : '1.5px solid rgba(255,255,255,0.08)',
                  background: isNone ? w.preview : `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${w.preview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '8px',
                  boxShadow: isSelected ? '0 0 10px rgba(210,187,255,0.3)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                title={w.name}
              >
                {!isNone && !premiumUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.6)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>
                    🔒
                  </div>
                )}
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)',
                  width: '100%',
                  textAlign: 'center',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  {w.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Custom URL Input */}
        <form onSubmit={handleApplyCustomUrl} style={{ marginTop: '20px' }}>
          <div className="widget" style={{ padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
              Custom Background Image URL 🔗
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                className="modal-input"
                placeholder="https://example.com/wallpaper.jpg"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(236,72,153,0.2)'
                }}
              >
                Apply URL
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
              Tip: Copy any image address from Unsplash or Pinterest and paste it here.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
