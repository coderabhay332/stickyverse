import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSupabase } from './hooks/useSupabase';
import './styles/popup.css';

function Popup() {
  const { user, loading, signIn, signOut } = useSupabase();
  const [stats, setStats] = useState({ notes: 0, links: 0, goals: 0 });

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      try {
        const notes = JSON.parse(localStorage.getItem('sv_notes') || '[]');
        const links = JSON.parse(localStorage.getItem('sv_links') || '[]');
        const goals = JSON.parse(localStorage.getItem('sv_goals') || '[]');
        
        setStats({
          notes: notes.filter(n => !n.archived).length,
          links: links.length,
          goals: goals.filter(g => g.status !== 'completed').length
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
    
    // Listen for storage changes
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenNewTab = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
  };

  if (loading) {
    return (
      <div className="popup loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="popup">
      <div className="popup-header">
        <h1>StickyVerse ✨</h1>
        <div className="auth-status">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button onClick={signOut} className="sign-out-btn">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={signIn} className="sign-in-btn">
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="popup-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.notes}</div>
            <div className="stat-label">Notes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.links}</div>
            <div className="stat-label">Links</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.goals}</div>
            <div className="stat-label">Goals</div>
          </div>
        </div>

        <div className="actions">
          <button onClick={handleOpenNewTab} className="primary-btn">
            Open Workspace
          </button>
        </div>

        {user && (
          <div className="sync-status">
            <span className="sync-indicator active"></span>
            <span>Cloud sync active</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Initialize popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
