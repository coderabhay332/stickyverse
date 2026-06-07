import React, { useState, useEffect, createContext, useContext } from 'react';
import { NotesGrid } from './components/NotesGrid';
import { LinksGrid } from './components/LinksGrid';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Modal } from './components/Modal';
import { PinnedView } from './components/PinnedView';
import { StarredView } from './components/StarredView';
import { ArchiveView } from './components/ArchiveView';
import { SettingsView } from './components/SettingsView';
import { RightPanel } from './components/RightPanel';
import { ThemesView } from './components/ThemesView';
import { TemplatesView } from './components/TemplatesView';
import { WidgetsView } from './components/WidgetsView';
import { useSupabase } from './hooks/useSupabase';
import { useLocalStorage } from './hooks/useLocalStorage';
import './styles/globals.css';

// ─── Theme Definitions ─────────────────────────────────────────────────────────
export const THEMES = [
  { id:'void',    label:'Dark Void',  em:'🌑', bg:'#0C0A1E', b1:'#7C3AED', b2:'#4C1D95', b3:'#6D28D9', b4:'#EC4899', accent:'#A78BFA', text:'#ffffff', sidebar:'rgba(12,10,30,0.92)' },
  { id:'minimal', label:'Minimal',    em:'🤍', bg:'#F0EEE8', b1:'#C4B5FD', b2:'#E0D7FF', b3:'#DDD6FE', b4:'#FBCFE8', accent:'#7C3AED', text:'#1a1a2e', sidebar:'rgba(240,238,232,0.92)' },
  { id:'cyber',   label:'Cyber',      em:'🟩', bg:'#030C06', b1:'#065f46', b2:'#042e2e', b3:'#10B981', b4:'#34D399', accent:'#34D399', text:'#e0fff4', sidebar:'rgba(3,12,6,0.92)' },
  { id:'lofi',    label:'Lo-fi',      em:'☕', bg:'#0F0A04', b1:'#78350f', b2:'#451a03', b3:'#92400e', b4:'#D97706', accent:'#F59E0B', text:'#fef3c7', sidebar:'rgba(15,10,4,0.92)' },
  { id:'ocean',   label:'Ocean',      em:'🌊', bg:'#020d1a', b1:'#1e3a5f', b2:'#0c4a6e', b3:'#0369a1', b4:'#38bdf8', accent:'#38bdf8', text:'#e0f2fe', sidebar:'rgba(2,13,26,0.92)' },
  { id:'rose',    label:'Rose',       em:'🌹', bg:'#1a0510', b1:'#9f1239', b2:'#881337', b3:'#be123c', b4:'#fb7185', accent:'#fb7185', text:'#fff1f2', sidebar:'rgba(26,5,16,0.92)' },
  { id:'galaxy',  label:'Galaxy',     em:'🌌', bg:'#080516', b1:'#312e81', b2:'#1e1b4b', b3:'#4f46e5', b4:'#818cf8', accent:'#818cf8', text:'#eef2ff', sidebar:'rgba(8,5,22,0.92)' },
  { id:'forest',  label:'Forest',     em:'🌲', bg:'#051209', b1:'#14532d', b2:'#052e16', b3:'#166534', b4:'#4ade80', accent:'#4ade80', text:'#f0fdf4', sidebar:'rgba(5,18,9,0.92)' },
];

// ─── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export default function App() {
  const { user, supabase, loading: authLoading, signIn, signOut } = useSupabase();

  const [notes, setNotes] = useLocalStorage('sv_notes', []);
  const [links, setLinks] = useLocalStorage('sv_links', []);
  const [goals, setGoals] = useLocalStorage('sv_goals', []);
  const [view, setView] = useState('home');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [theme, setTheme] = useLocalStorage('sv_theme', 'void');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('note');
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusText, setFocusText] = useLocalStorage('sv_focus', 'Ship the StickyVerse V1 extension ✨');
  const [globalFont, setGlobalFont] = useLocalStorage('sv_global_font', 'sans');
  const [waterReminder, setWaterReminder] = useLocalStorage('sv_water_reminder', false);
  const [waterInterval, setWaterInterval] = useLocalStorage('sv_water_interval', 120);
  const [toast, setToast] = useState(null);

  // Listen for background alarm messages (like water reminder fallback toasts)
  useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === 'SHOW_WATER_TOAST') {
        setToast({ title: message.title, body: message.body });
        // Clear toast automatically after 8 seconds
        setTimeout(() => {
          setToast(prev => {
            if (prev && prev.title === message.title) return null;
            return prev;
          });
        }, 8000);
      }
    };
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, []);

  // Apply theme CSS vars
  useEffect(() => {
    const root = document.documentElement;
    const t = THEMES.find(t => t.id === theme) || THEMES[0];
    root.style.setProperty('--theme-bg', t.bg);
    root.style.setProperty('--theme-b1', t.b1);
    root.style.setProperty('--theme-b2', t.b2);
    root.style.setProperty('--theme-b3', t.b3);
    root.style.setProperty('--theme-b4', t.b4);
    root.style.setProperty('--theme-accent', t.accent);
    root.style.setProperty('--theme-text', t.text);
    root.style.setProperty('--theme-sidebar', t.sidebar);
    document.body.style.background = t.bg;
    document.body.style.color = t.text;
  }, [theme]);

  // Apply global font CSS class to body
  useEffect(() => {
    document.body.classList.remove('body-font-sans', 'body-font-serif', 'body-font-handwriting', 'body-font-mono');
    document.body.classList.add(`body-font-${globalFont}`);
  }, [globalFont]);

  // Request notifications permission and start background scheduler for task reminders
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkReminders = () => {
      const now = Date.now();
      let hasUpdates = false;

      const updated = notes.map(n => {
        if (n.reminder && !n.reminderTriggered) {
          const remTime = new Date(n.reminder).getTime();
          if (remTime <= now) {
            // Trigger browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`⏰ Reminder: ${n.title || 'StickyVerse Task'}`, {
                body: n.content || 'Your scheduled reminder has arrived!',
                icon: 'icons/icon32.png'
              });
            } else {
              // Fallback
              alert(`⏰ Reminder: ${n.title || 'StickyVerse Task'}\n\n${n.content || ''}`);
            }
            hasUpdates = true;
            return { ...n, reminderTriggered: true };
          }
        }
        return n;
      });

      if (hasUpdates) {
        setNotes(updated);
        // Find which note was triggered and update Supabase if signed in
        const triggered = updated.find((n, i) => n.reminderTriggered && !notes[i].reminderTriggered);
        if (triggered && user && supabase) {
          supabase.from('notes').update({ reminderTriggered: true }).eq('id', triggered.id).catch(console.error);
        }
      }
    };

    const interval = setInterval(checkReminders, 10000); // check every 10s
    return () => clearInterval(interval);
  }, [notes, user, supabase]);

  // Sync water reminder settings to background service worker
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_WATER_REMINDER',
        enabled: waterReminder,
        interval: Number(waterInterval)
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Background service worker not active yet:', chrome.runtime.lastError.message);
        } else {
          console.log('Water reminder sync response:', response);
        }
      });
    }
  }, [waterReminder, waterInterval]);

  // Spacebar key listener to create new note
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      )) {
        return;
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        setEditingNote(null);
        setModalType('note');
        setModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Demo notes seed
  useEffect(() => {
    if (notes.length === 0) {
      setNotes([
        {
          id: 'demo1', title: 'Welcome to StickyVerse ✨',
          content: 'Your aesthetic productivity workspace. Click + to create your first note!',
          color: 'purple', tag: 'note', status: 'none', priority: 'none',
          pinned: false, starred: false, archived: false, created: Date.now() - 3600000, updated: Date.now() - 3600000
        },
        {
          id: 'demo2', title: "Today's Tasks 📋",
          content: '• Complete project review\n• Send weekly report\n• Team meeting at 3 PM\n• Code review for PR #42',
          color: 'blue', tag: 'task', status: 'in-progress', priority: 'high',
          pinned: true, starred: false, archived: false, created: Date.now() - 7200000, updated: Date.now() - 3600000
        },
        {
          id: 'demo3', title: 'Quick Idea 💡',
          content: 'Add keyboard shortcuts for common actions. Ctrl+N for new note, Ctrl+P for pin.',
          color: 'yellow', tag: 'idea', status: 'none', priority: 'medium',
          pinned: false, starred: true, archived: false, created: Date.now() - 10800000, updated: Date.now() - 10800000
        },
        {
          id: 'demo4', title: 'Inspiration 🌊',
          content: '"The secret of getting ahead is getting started." — Mark Twain',
          color: 'green', tag: 'quote', status: 'none', priority: 'none',
          pinned: false, starred: false, archived: false, created: Date.now() - 14400000, updated: Date.now() - 14400000
        },
        {
          id: 'demo5', title: 'Meeting Notes',
          content: 'Discussed Q3 roadmap. Key decisions:\n- Launch v2 by August\n- Onboard 3 new clients\n- Redesign dashboard UI',
          color: 'pink', tag: 'note', status: 'none', priority: 'low',
          pinned: false, starred: false, archived: false, created: Date.now() - 18000000, updated: Date.now() - 18000000
        },
      ]);
    }
  }, []);

  const ctx = {
    notes, setNotes, links, setLinks, goals, setGoals,
    view, setView, filter, setFilter, sortBy, setSortBy,
    theme, setTheme, modalOpen, setModalOpen, modalType, setModalType,
    editingNote, setEditingNote,
    searchQuery, setSearchQuery, focusText, setFocusText,
    globalFont, setGlobalFont,
    waterReminder, setWaterReminder,
    waterInterval, setWaterInterval,
    user, supabase, signIn, signOut,
    THEMES,
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">✦</div>
        <div className="loading-text">Loading StickyVerse...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'pinned':    return <PinnedView />;
      case 'starred':   return <StarredView />;
      case 'links':     return <LinksGrid />;
      case 'archive':   return <ArchiveView />;
      case 'settings':  return <SettingsView />;
      case 'themes':    return <ThemesView />;
      case 'templates': return <TemplatesView />;
      case 'widgets':   return <WidgetsView />;
      default:          return <NotesGrid />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      {/* Ambient glow blobs */}
      <div className="glow-blob" style={{ top: 0, left: 0 }} />
      <div className="glow-blob" style={{ bottom: 0, right: 0, background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />

      <div className="app-layout">
        <Sidebar />

        <main className="app-main">
          <TopBar />

          {/* Focus Bar */}
          <div className="focus-bar">
            <span className="focus-icon">🎯</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="focus-label">Today's Focus</div>
              <div
                className="focus-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => setFocusText(e.currentTarget.textContent)}
              >
                {focusText}
              </div>
            </div>
            <button className="focus-edit-btn" title="Edit focus">✏️</button>
          </div>

          {/* Filter Bar — only show on home */}
          {view === 'home' && (
            <div className="filter-bar">
              <div className="filter-tabs">
                {['all','note','task','idea','quote','link'].map(f => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                  </button>
                ))}
              </div>
              <select
                className="glass-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
                <option value="priority">Priority</option>
                <option value="status">Work Status</option>
                <option value="category">Category</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          )}

          {/* Content */}
          <div className="content-scroll">
            {renderView()}
          </div>
        </main>

        <RightPanel />
      </div>

      {/* Floating Action Bar */}
      {['home', 'pinned', 'starred', 'links', 'archive'].includes(view) && (
        <div className="floating-bar">
          <button className="fab-btn" title="Search" onClick={() => {}}>🔍</button>
          <button className="fab-btn" title="Pin view" onClick={() => setView('pinned')}>📌</button>
          <button className="fab-btn main" title="Add Note" onClick={() => { setEditingNote(null); setModalType('note'); setModalOpen(true); }}>+</button>
          <button className="fab-btn" title="Links" onClick={() => setView('links')}>🔗</button>
          <button className="fab-btn" title="Settings" onClick={() => setView('settings')}>⚙️</button>
        </div>
      )}

      {toast && (
        <div className="custom-toast" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '320px',
          background: 'rgba(30, 27, 75, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.2)',
          display: 'flex',
          gap: '12px',
          zIndex: 100000,
          color: '#fff',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.3s ease-out forwards'
        }}>
          <span style={{ fontSize: '24px', alignSelf: 'center' }}>💧</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px', color: '#fff' }}>{toast.title}</div>
            <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>{toast.body}</div>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', 
              fontSize: '18px', cursor: 'pointer', alignSelf: 'flex-start',
              padding: '0 4px'
            }}
          >×</button>
        </div>
      )}

      {modalOpen && (
        <Modal type={modalType} onClose={() => setModalOpen(false)} />
      )}
    </AppContext.Provider>
  );
}
