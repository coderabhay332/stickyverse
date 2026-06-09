import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';

const QUOTES = [
  { text: 'Small progress is still progress. Keep going.', author: '— Unknown' },
  { text: 'The secret of getting ahead is getting started.', author: '— Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: '— Tim Ferriss' },
  { text: 'Done is better than perfect.', author: '— Mark Zuckerberg' },
  { text: 'Your only limit is your mind.', author: '— Unknown' },
];

export function RightPanel() {
  const { 
    notes, 
    links,
    pomodoroTime,
    setPomodoroTime,
    pomodoroTotal,
    isPomodoroRunning,
    handleStartPomodoro
  } = useAppContext();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const formatPomodoro = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const pomodoroProgress = ((pomodoroTotal - pomodoroTime) / pomodoroTotal) * 100;

  // Calculate dynamic stats
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const notesToday = notes.filter(n => (n.created || Date.now()) >= todayStart).length;
  const tasksDone = notes.filter(n => n.status === 'completed').length;
  const linksSaved = links.length + notes.filter(n => n.tag === 'link').length;

  return (
    <aside className="right-panel">
      {/* Pomodoro Widget */}
      <div className="widget">
        <div className="pomodoro-label">
          <span className="pomodoro-indicator" style={{ animationPlayState: isPomodoroRunning ? 'running' : 'paused' }} />
          Pomodoro Timer
        </div>
        <div className="pomodoro-time">{formatPomodoro(pomodoroTime)}</div>
        <div className="pomodoro-progress">
          <div className="pomodoro-progress-fill" style={{ width: `${pomodoroProgress}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="pomodoro-btn"
            onClick={handleStartPomodoro}
          >
            {isPomodoroRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={() => { setPomodoroTime(pomodoroTotal); setIsPomodoroRunning(false); }}
            style={{
              padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13,
              transition: 'all var(--transition)'
            }}
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Work Stats */}
      <div className="widget stats-widget">
        <div className="widget-header">
          <span>📊</span>
          Work Stats
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{notesToday}</div>
            <div className="stat-label">Notes Today</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{tasksDone}</div>
            <div className="stat-label">Tasks Done</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{linksSaved}</div>
            <div className="stat-label">Links Saved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ fontSize: 18 }}>
              {Math.round(((pomodoroTotal - pomodoroTime) / 3600) * 10) / 10}h
            </div>
            <div className="stat-label">Focus Time</div>
          </div>
        </div>
      </div>

      {/* Quote Widget */}
      <div className="widget quote-widget">
        <div className="quote-icon">"</div>
        <div className="quote-text">{QUOTES[quoteIdx].text}</div>
        <div style={{ fontSize: 10, color: 'rgba(210,187,255,0.5)', marginBottom: 8, fontFamily: 'Geist Mono, monospace' }}>
          {QUOTES[quoteIdx].author}
        </div>
        <div className="quote-dots">
          {QUOTES.map((_, i) => (
            <div key={i} className={`quote-dot ${i === quoteIdx ? 'active' : ''}`} onClick={() => setQuoteIdx(i)} />
          ))}
        </div>
      </div>
    </aside>
  );
}