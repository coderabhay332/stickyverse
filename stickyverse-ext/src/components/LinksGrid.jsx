import React, { useState } from 'react';
import { useAppContext } from '../App';
import { EmptyState } from './EmptyState';

export function LinksGrid() {
  const { links, setLinks, searchQuery, user, supabase } = useAppContext();
  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
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
      title: customTitle.trim() || hostname,
      host: hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      note: customTitle.trim(),
      created: Date.now(),
    };

    setLinks(prev => [newLink, ...prev]);
    setUrl('');
    setCustomTitle('');
    setSaving(false);
  };

  const handleDelete = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (link.title || '').toLowerCase().includes(q) ||
      (link.url || '').toLowerCase().includes(q) ||
      (link.note || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="view-head">
        <h2 className="view-title">🔗 Link Vault</h2>
        <p className="view-sub">Save any URL — sites, videos, tools, inspiration</p>
      </div>

      {/* URL Input Form */}
      <div className="link-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>🔗</span>
          <input
            type="text"
            placeholder="Paste any URL (e.g. google.com)..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13.5px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>✍️</span>
          <input
            type="text"
            placeholder="Add a note or label to trace it back (optional)..."
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13.5px' }}
          />
          <button className="link-save-btn" onClick={handleSave} disabled={saving} style={{ padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>
            {saving ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <EmptyState message={searchQuery ? "No matching links found" : "No saved links"} action="Paste a URL above to save it" />
      ) : (
        <div className="links-masonry">
          {filteredLinks.map((link, i) => (
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
                  {link.note && link.note !== link.title && (
                    <div className="link-note" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>✍️</span> {link.note}
                    </div>
                  )}
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
