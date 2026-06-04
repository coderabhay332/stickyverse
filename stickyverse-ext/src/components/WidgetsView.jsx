import React from 'react';
import { useAppContext } from '../App';

export function WidgetsView() {
  const { notes, links } = useAppContext();

  const today = new Date().toDateString();
  const todayNotes = notes.filter(note => new Date(note.created).toDateString() === today);
  const completedTasks = notes.filter(note => note.status === 'completed');
  const todayLinks = links.filter(link => new Date(link.savedAt || Date.now()).toDateString() === today);

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="view-head">
        <h2 className="view-title">🧩 Widgets</h2>
        <p className="view-sub">Configure and view your productivity dashboard widgets</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '24px',
        marginTop: '24px'
      }}>
        {/* Weather Widget */}
        <div className="widget weather-widget" style={{ minHeight: '140px' }}>
          <div className="weather-header">
            <span className="weather-location">📍 Ahmedabad, IN</span>
            <span className="weather-menu">⋮</span>
          </div>
          <div className="weather-main" style={{ marginTop: '12px' }}>
            <span className="weather-icon" style={{ fontSize: '3rem' }}>⛅</span>
            <div>
              <div className="weather-temp" style={{ fontSize: '1.8rem', fontWeight: 700 }}>32°C</div>
              <div className="weather-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>Partly Cloudy</div>
            </div>
          </div>
        </div>

        {/* Work Stats Widget */}
        <div className="widget stats-widget" style={{ minHeight: '140px' }}>
          <div className="widget-header" style={{ fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            <span>📊</span> Work Stats
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{todayNotes.length}</div>
              <div className="stat-label">Notes Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{completedTasks.length}</div>
              <div className="stat-label">Tasks Done</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{todayLinks.length}</div>
              <div className="stat-label">Links Saved</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1.2h</div>
              <div className="stat-label">Focus Time</div>
            </div>
          </div>
        </div>

        {/* Focus Widget Description */}
        <div className="widget" style={{ minHeight: '140px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>🎯 Today's Focus</div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Type your main priority in the bar at the top of the canvas. Keep it visible to stay on track throughout the day.
          </p>
        </div>

        {/* Pomodoro Description */}
        <div className="widget" style={{ minHeight: '140px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>🍅 Pomodoro Timer</div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Use the focus timer in the right sidebar panel to segment work into 25-minute intervals. Stay disciplined and focused.
          </p>
        </div>
      </div>
    </div>
  );
}
