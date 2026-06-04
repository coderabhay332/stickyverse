import React from 'react';
import { useAppContext } from '../App';

export function ThemesView() {
  const { theme, setTheme, THEMES } = useAppContext();

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="view-head">
        <h2 className="view-title">🎨 Themes</h2>
        <p className="view-sub">Pick your vibe — choose from our curated aesthetic palettes</p>
      </div>

      <div className="theme-grid" style={{ marginTop: '24px' }}>
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
  );
}
