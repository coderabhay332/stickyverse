import React from 'react';
import { useAppContext } from '../App';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function WidgetsView() {
  const { 
    notes, 
    links, 
    waterReminder, 
    setWaterReminder, 
    waterInterval, 
    setWaterInterval 
  } = useAppContext();

  const [waterIntake, setWaterIntake] = useLocalStorage('sv_water_intake', 0);
  const [lastDrinkDate, setLastDrinkDate] = useLocalStorage('sv_last_drink_date', '');

  // Reset water intake daily
  const todayStr = new Date().toDateString();
  React.useEffect(() => {
    if (lastDrinkDate !== todayStr) {
      setWaterIntake(0);
      setLastDrinkDate(todayStr);
    }
  }, [lastDrinkDate, todayStr]);

  const incrementIntake = () => {
    setWaterIntake(prev => Math.min(12, prev + 1));
  };

  const decrementIntake = () => {
    setWaterIntake(prev => Math.max(0, prev - 1));
  };

  const today = new Date().toDateString();
  const todayNotes = notes.filter(note => new Date(note.created).toDateString() === today);
  const completedTasks = notes.filter(note => note.status === 'completed');
  const todayLinks = links.filter(link => new Date(link.savedAt || Date.now()).toDateString() === today);

  const targetCups = 8;
  const intakePercent = Math.min(100, (waterIntake / targetCups) * 100);

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

        {/* Hydration Tracker Widget */}
        <div className="widget hydration-widget" style={{ minHeight: '180px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
              <span>💧</span> Hydration Tracker
            </div>
            <button
              onClick={() => setWaterReminder(v => !v)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: waterReminder ? '#10B981' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Alerts: {waterReminder ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                {waterIntake} / {targetCups} Cups
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                Target: 2 Liters (250ml per cup)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={decrementIntake}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >-</button>
              <button 
                onClick={incrementIntake}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)'
                }}
              >+</button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${intakePercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '99px'
            }} />
          </div>

          {waterReminder && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', fontSize: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>Remind me every:</span>
              <select
                className="glass-select"
                value={waterInterval}
                onChange={e => setWaterInterval(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '11px',
                }}
              >
                <option value="1">1 Minute (Testing)</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="180">3 Hours</option>
              </select>
            </div>
          )}
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
