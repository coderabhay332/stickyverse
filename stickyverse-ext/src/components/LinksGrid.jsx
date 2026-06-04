import React, { useState } from 'react';
import { useAppContext } from '../App';
import { EmptyState } from './EmptyState';

export function LinksGrid() {
  const { links, setLinks, user, supabase } = useAppContext();
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) return;
    let linkUrl = url.trim();
    if (!linkUrl.startsWith('http')) linkUrl = 'https://' + linkUrl;

    let hostname = linkUrl;
    try { hostname = new URL(linkUrl).hostname; } catch {}

    setSaving(true);
    const newLink = {
      id: `link_${Date.now()}`,
      url: linkUrl,
      title: hostname,
      host: hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      created: Date.now(),
    };

    setLinks(prev => [newLink, ...prev]);
    setUrl('');
    setSaving(false);
  };

  const handleDelete = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div>
      <div className="view-head">
        <h2 className="view-title">🔗 Link Vault</h2>
        <p className="view-sub">Save any URL — sites, videos, tools, inspiration</p>
      </div>

      {/* URL Input */}
      <div className="link-input-row">
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>🔗</span>
        <input
          type="text"
          placeholder="Paste any URL and press Enter…"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button className="link-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? '...' : 'Save'}
        </button>
      </div>

      {links.length === 0 ? (
        <EmptyState message="No saved links" action="Paste a URL above to save it" />
      ) : (
        <div className="links-masonry">
          {links.map((link, i) => (
            <div
              key={link.id || i}
              style={{ position: 'relative' }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
              >
                {link.favicon ? (
                  <img
                    src={link.favicon}
                    alt=""
                    className="link-favicon"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="link-favicon-placeholder">🌐</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="link-title">{link.title || 'Untitled'}</div>
                  <div className="link-url">{link.host || link.url}</div>
                </div>
              </a>
              <button
                onClick={() => handleDelete(link.id)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 22, height: 22, borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 11, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
                title="Delete"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
