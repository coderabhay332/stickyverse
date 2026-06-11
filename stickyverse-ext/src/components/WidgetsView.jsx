import React from 'react';
import { useAppContext } from '../App';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateUUID } from '../utils/uuid';

export function WidgetsView() {
  const { 
    notes, 
    setNotes,
    user,
    supabase,
    links, 
    waterReminder, 
    setWaterReminder, 
    waterInterval, 
    setWaterInterval,
    pomodoroTime,
    pomodoroTotal
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

  // Streak Tracker State & Helpers
  const streakNote = React.useMemo(() => notes.find(n => n.title === '__sv_streaks__'), [notes]);
  const streaks = React.useMemo(() => {
    if (!streakNote || !streakNote.content) return [];
    try {
      return JSON.parse(streakNote.content);
    } catch (e) {
      console.error('Failed to parse streaks:', e);
      return [];
    }
  }, [streakNote]);

  const [newStreakName, setNewStreakName] = React.useState('');
  const [newStreakTarget, setNewStreakTarget] = React.useState(15);

  const saveStreaks = async (updatedStreaks) => {
    const now = Date.now();
    if (streakNote) {
      const updatedNote = {
        ...streakNote,
        content: JSON.stringify(updatedStreaks),
        updated: now,
        synced: false
      };
      setNotes(prev => prev.map(n => n.id === streakNote.id ? updatedNote : n));
      if (user && supabase) {
        try {
          const { error } = await supabase.from('notes').update({
            content: updatedNote.content,
            updated_at: new Date(now).toISOString()
          }).eq('id', streakNote.id);
          if (!error) {
            setNotes(prev => prev.map(n => n.id === streakNote.id ? { ...n, synced: true } : n));
          }
        } catch (e) {
          console.error('Failed to sync updated streaks note:', e);
        }
      }
    } else {
      const newId = generateUUID();
      const newNote = {
        id: newId,
        title: '__sv_streaks__',
        content: JSON.stringify(updatedStreaks),
        tag: 'note',
        color: 'purple',
        priority: 'none',
        status: 'none',
        pinned: false,
        starred: false,
        archived: false,
        created: now,
        updated: now,
        synced: false
      };
      setNotes(prev => [newNote, ...prev]);
      if (user && supabase) {
        try {
          const { error } = await supabase.from('notes').insert({
            id: newId,
            user_id: user.id,
            title: newNote.title,
            content: newNote.content,
            type: 'note',
            style: 'regular',
            color: 'purple',
            tag: 'note',
            status: 'none',
            priority: 'medium',
            pinned: false,
            starred: false,
            items: {
              realPriority: 'none'
            },
            created_at: new Date(now).toISOString(),
            updated_at: new Date(now).toISOString()
          });
          if (!error) {
            setNotes(prev => prev.map(n => n.id === newId ? { ...n, synced: true } : n));
          }
        } catch (e) {
          console.error('Failed to sync new streaks note:', e);
        }
      }
    }
  };

  const handleAddStreak = (e) => {
    e.preventDefault();
    if (!newStreakName.trim()) return;
    const newStreak = {
      id: generateUUID(),
      name: newStreakName.trim(),
      target: Math.max(1, Number(newStreakTarget) || 15),
      current: 0,
      lastTicked: null
    };
    saveStreaks([...streaks, newStreak]);
    setNewStreakName('');
    setNewStreakTarget(15);
  };

  const handleIncrementStreak = (id) => {
    const updated = streaks.map(s => {
      if (s.id === id) {
        const nextCurrent = Math.min(s.target, s.current + 1);
        return { ...s, current: nextCurrent, lastTicked: Date.now() };
      }
      return s;
    });
    saveStreaks(updated);
  };

  const handleDecrementStreak = (id) => {
    const updated = streaks.map(s => {
      if (s.id === id) {
        const nextCurrent = Math.max(0, s.current - 1);
        return { ...s, current: nextCurrent };
      }
      return s;
    });
    saveStreaks(updated);
  };

  const handleResetStreak = (id) => {
    const updated = streaks.map(s => {
      if (s.id === id) {
        return { ...s, current: 0, lastTicked: null };
      }
      return s;
    });
    saveStreaks(updated);
  };

  const handleDeleteStreak = (id) => {
    const updated = streaks.filter(s => s.id !== id);
    saveStreaks(updated);
  };

  // Calculate dynamic stats matching RightPanel
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const notesToday = notes.filter(n => (n.created || Date.now()) >= todayStart && n.title !== '__sv_streaks__').length;
  const tasksDone = notes.filter(n => n.status === 'completed').length;
  const linksSaved = links.length + notes.filter(n => n.tag === 'link').length;
  const focusTime = `${Math.round(((pomodoroTotal - pomodoroTime) / 3600) * 10) / 10}h`;

  const [targetCups, setTargetCups] = useLocalStorage('sv_water_target_cups', 8);
  const intakePercent = Math.min(100, (waterIntake / targetCups) * 100);

  const statusCounts = React.useMemo(() => {
    const counts = {
      'in-progress': 0,
      'completed': 0,
      'delayed': 0,
      'waiting': 0,
      'cancelled': 0
    };
    notes.forEach(n => {
      if (n && n.status && counts[n.status] !== undefined && !n.archived) {
        counts[n.status]++;
      }
    });
    return counts;
  }, [notes]);

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
              <div className="stat-number">{focusTime}</div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                <input
                  type="number"
                  value={waterIntake}
                  onChange={e => setWaterIntake(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: '60px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    outline: 'none',
                    padding: '2px'
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                <input
                  type="number"
                  value={targetCups}
                  onChange={e => setTargetCups(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '60px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    outline: 'none',
                    padding: '2px'
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Cups</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                Target: {((targetCups * 250) / 1000).toFixed(2)} Liters (250ml per cup)
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

        {/* Work Statuses Summary Widget */}
        <div className="widget status-summary-widget" style={{ minHeight: '180px', padding: '20px' }}>
          <div className="widget-header" style={{ fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            <span>🏷️</span> Work Statuses
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>🔄 In Progress</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{statusCounts['in-progress']}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>✅ Completed</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{statusCounts['completed']}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 500 }}>⏳ Delayed</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{statusCounts['delayed']}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
              <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 500 }}>🕐 Waiting</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{statusCounts['waiting']}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.15)', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 500 }}>❌ Cancelled</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{statusCounts['cancelled']}</span>
            </div>
          </div>
        </div>

        {/* Streak Tracker Widget */}
        <div className="widget streak-tracker-widget" style={{ minHeight: '180px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
              <span>🔥</span> Streak Tracker
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>{streaks.length} Active Streaks</span>
          </div>

          {/* Add Streak Form */}
          <form onSubmit={handleAddStreak} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <input
                type="text"
                placeholder="Streak target (e.g. Gym, Avoid Sugar)"
                value={newStreakName}
                onChange={e => setNewStreakName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '6px 12px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                min="1"
                placeholder="Days"
                value={newStreakTarget}
                onChange={e => setNewStreakTarget(Math.max(1, parseInt(e.target.value) || 15))}
                style={{
                  width: '60px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '6px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>Days</span>
            </div>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              + Add
            </button>
          </form>

          {/* Streaks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {streaks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>
                No active streaks. Set a goal above to get started!
              </div>
            ) : (
              streaks.map(streak => {
                const percent = Math.min(100, (streak.current / streak.target) * 100);
                const isCompleted = streak.current >= streak.target;
                const isTickedToday = streak.lastTicked && new Date(streak.lastTicked).toDateString() === new Date().toDateString();

                return (
                  <div key={streak.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyHeight: 'space-between', gap: '10px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', opacity: streak.current > 0 ? 1 : 0.4 }}>🔥</span>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                          {streak.name}
                        </span>
                        {isCompleted && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                            🎉 Done!
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f97316' }}>
                        {streak.current} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>/</span> {streak.target} days
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{
                        width: `${percent}%`, height: '100%',
                        background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f97316, #ef4444)',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '99px'
                      }} />
                    </div>

                    {/* Streak Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleIncrementStreak(streak.id)}
                          disabled={isCompleted}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isTickedToday ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #f97316, #ef4444)',
                            color: isTickedToday ? '#10b981' : '#fff',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: isCompleted ? 'not-allowed' : 'pointer',
                            opacity: isCompleted ? 0.5 : 1
                          }}
                        >
                          {isTickedToday ? '✓ Checked' : '＋ Tick'}
                        </button>
                        <button
                          onClick={() => handleDecrementStreak(streak.id)}
                          disabled={streak.current === 0}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#fff',
                            fontSize: '11px',
                            cursor: streak.current === 0 ? 'not-allowed' : 'pointer',
                            opacity: streak.current === 0 ? 0.4 : 1
                          }}
                        >
                          －
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleResetStreak(streak.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#f87171',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStreak(streak.id)}
                          title="Delete Streak"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
