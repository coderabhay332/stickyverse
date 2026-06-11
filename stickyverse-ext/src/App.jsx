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
import { generateUUID } from './utils/uuid';
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
  const [deletedNoteIds, setDeletedNoteIds] = useLocalStorage('sv_deleted_note_ids', []);
  const [deletedLinkIds, setDeletedLinkIds] = useLocalStorage('sv_deleted_link_ids', []);

  const deletedNoteIdsRef = React.useRef(deletedNoteIds);
  const deletedLinkIdsRef = React.useRef(deletedLinkIds);

  useEffect(() => {
    deletedNoteIdsRef.current = deletedNoteIds;
  }, [deletedNoteIds]);

  useEffect(() => {
    deletedLinkIdsRef.current = deletedLinkIds;
  }, [deletedLinkIds]);

  const addDeletedNoteId = (id) => {
    setDeletedNoteIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const addDeletedLinkId = (id) => {
    setDeletedLinkIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const [view, setView] = useState('home');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [theme, setTheme] = useLocalStorage('sv_theme', 'void');
  const [premiumUnlocked, setPremiumUnlocked] = useLocalStorage('sv_premium_unlocked', false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [wallpaper, setWallpaper] = useLocalStorage('sv_wallpaper', 'none');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('note');
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusText, setFocusText] = useLocalStorage('sv_focus', 'Ship the StickyVerse V1 extension ✨');
  const [globalFont, setGlobalFont] = useLocalStorage('sv_global_font', 'sans');
  const [waterReminder, setWaterReminder] = useLocalStorage('sv_water_reminder', false);
  const [waterInterval, setWaterInterval] = useLocalStorage('sv_water_interval', 120);
  const [toast, setToast] = useState(null);

  const [priorityColors, setPriorityColors] = useLocalStorage('sv_priority_colors', {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    urgent: '#ef4444',
  });

  // Pomodoro Timer State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroTotal] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  // Pomodoro Timer Effect
  useEffect(() => {
    if (!isPomodoroRunning) return;
    const t = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          setIsPomodoroRunning(false);
          
          const title = "🍅 Pomodoro Complete!";
          const body = "Great job! Take a short 5-minute break.";

          // Show on-screen toast locally in this tab
          setToast({ title, body });
          setTimeout(() => {
            setToast(prevToast => {
              if (prevToast && prevToast.title === title) return null;
              return prevToast;
            });
          }, 8000);

          // Tell the background service worker to trigger desktop notification and broadcast to other tabs
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            try {
              const promise = chrome.runtime.sendMessage({
                type: 'POMODORO_COMPLETE',
                title,
                body
              });
              if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {});
              }
            } catch (e) {
              // Ignore
            }
          } else {
            // Fallback for non-extension environment
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(title, { body, icon: 'icons/icon32.png' });
            } else {
              alert(`${title}\n\n${body}`);
            }
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPomodoroRunning]);

  const handleStartPomodoro = () => {
    if (!isPomodoroRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsPomodoroRunning(v => !v);
  };

  // Listen for background alarm messages (like water reminder fallback toasts and background notes updates)
  useEffect(() => {
    const handleMessage = (message, sender, sendResponse) => {
      if (message.type === 'SHOW_WATER_TOAST' || message.type === 'SHOW_TOAST') {
        setToast({ title: message.title, body: message.body });
        // Clear toast automatically after 8 seconds
        setTimeout(() => {
          setToast(prev => {
            if (prev && prev.title === message.title) return null;
            return prev;
          });
        }, 8000);
        if (sendResponse) sendResponse({ success: true });
      } else if (message.type === 'NOTES_UPDATED_BACKGROUND') {
        if (message.notes && Array.isArray(message.notes)) {
          setNotes(prevNotes => {
            // Find newly triggered reminders to sync to Supabase immediately
            if (supabase && user) {
              message.notes.forEach(note => {
                const prevNote = prevNotes.find(p => p.id === note.id);
                // If it is now triggered, but wasn't before
                if (note.reminderTriggered && (!prevNote || !prevNote.reminderTriggered)) {
                  const priorityValue = ['low', 'medium', 'high', 'urgent'].includes(note.priority) ? note.priority : 'medium';
                  supabase.from('notes').update({
                    items: {
                      customColor: note.customColor || null,
                      fontColor: note.fontColor || null,
                      realPriority: note.priority || 'none',
                      reminder: note.reminder || null,
                      reminderTriggered: true
                    },
                    updated_at: new Date(note.updated || Date.now()).toISOString()
                  }).eq('id', note.id).then(({ error }) => {
                    if (error) {
                      console.error('Failed to sync background triggered reminder to Supabase:', error.message);
                    } else {
                      console.log('Successfully synced background triggered reminder for note:', note.title);
                    }
                  });
                }
              });
            }
            return message.notes;
          });
        }
        if (sendResponse) sendResponse({ success: true });
      }
    };
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, [setNotes, supabase, user]);

  // Client-side instant reminder checker (runs every 10 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      
      setNotes(prevNotes => {
        let updatedAny = false;
        const nextNotes = prevNotes.map(note => {
          if (note.reminder && !note.reminderTriggered) {
            const remTime = new Date(note.reminder).getTime();
            if (remTime <= now) {
              updatedAny = true;
              const updatedTime = Date.now();
              
              // Trigger browser notification
              if (typeof chrome !== 'undefined' && chrome.notifications && chrome.notifications.create) {
                chrome.notifications.create('note_reminder_' + note.id + '_' + updatedTime, {
                  type: 'basic',
                  iconUrl: chrome.runtime.getURL('icons/icon128.png'),
                  title: `⏰ Reminder: ${note.title || 'StickyVerse Task'}`,
                  message: note.content || 'Your scheduled reminder has arrived!',
                  priority: 2
                });
              } else if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`⏰ Reminder: ${note.title || 'StickyVerse Task'}`, {
                  body: note.content || 'Your scheduled reminder has arrived!',
                  icon: 'icons/icon128.png'
                });
              }

              // Show on-screen toast
              setToast({
                title: `⏰ Reminder: ${note.title || 'StickyVerse Task'}`,
                body: note.content || 'Your scheduled reminder has arrived!'
              });

              // Clear toast after 8 seconds
              setTimeout(() => {
                setToast(prev => {
                  if (prev && prev.title === `⏰ Reminder: ${note.title || 'StickyVerse Task'}`) return null;
                  return prev;
                });
              }, 8000);

              // Sync to Supabase immediately if logged in
              if (supabase && user && note.synced) {
                const priorityValue = ['low', 'medium', 'high', 'urgent'].includes(note.priority) ? note.priority : 'medium';
                supabase.from('notes').update({
                  items: {
                    customColor: note.customColor || null,
                    fontColor: note.fontColor || null,
                    realPriority: note.priority || 'none',
                    reminder: note.reminder || null,
                    reminderTriggered: true
                  },
                  updated_at: new Date(updatedTime).toISOString()
                }).eq('id', note.id).then(({ error }) => {
                  if (error) {
                    console.error('Client sync reminder trigger failed:', error.message);
                  } else {
                    console.log('Client successfully synced reminder trigger for:', note.title);
                  }
                });
              }

              return { ...note, reminderTriggered: true, updated: updatedTime };
            }
          }
          return note;
        });

        if (updatedAny) {
          // Write to chrome.storage.local first
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ sv_notes: nextNotes }).then(() => {
              if (chrome.runtime && chrome.runtime.sendMessage) {
                try {
                  const promise = chrome.runtime.sendMessage({
                    type: 'CLIENT_REMINDER_TRIGGERED',
                    notes: nextNotes
                  });
                  if (promise && typeof promise.catch === 'function') {
                    promise.catch((err) => {
                      console.log('Client reminder sync message ignored (extension inactive):', err.message);
                    });
                  }
                } catch (e) {
                  // Silently ignore synchronous errors
                }
              }
            }).catch(() => {});
          }
          return nextNotes;
        }
        return prevNotes;
      });

    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [supabase, user]);

  // Apply theme CSS vars & wallpaper
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
    
    if (wallpaper && wallpaper !== 'none') {
      document.body.style.backgroundImage = `linear-gradient(rgba(12, 10, 30, 0.45), rgba(12, 10, 30, 0.45)), url(${wallpaper})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.background = t.bg;
    }
    document.body.style.color = t.text;
  }, [theme, wallpaper]);

  // Apply global font CSS class to body
  useEffect(() => {
    document.body.classList.remove('body-font-sans', 'body-font-serif', 'body-font-handwriting', 'body-font-mono');
    document.body.classList.add(`body-font-${globalFont}`);
  }, [globalFont]);

  // Sync and mirror notes to chrome.storage.local for background alarms
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ sv_notes: notes });
    }
  }, [notes]);

  // Read initial notes from chrome.storage.local on mount (in case background updated them)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sv_notes'], (res) => {
        if (res.sv_notes && Array.isArray(res.sv_notes)) {
          setNotes(res.sv_notes);
        }
      });
    }
  }, []);

  // Clear synced notes/links on logout to prevent cross-user contamination/data leakage
  useEffect(() => {
    if (!authLoading && !user) {
      setNotes(prev => prev.filter(n => !n.synced));
      setLinks(prev => prev.filter(l => !l.synced));
      setDeletedNoteIds([]);
      setDeletedLinkIds([]);
    }
  }, [user, authLoading]);

  // Sync water reminder settings to background service worker
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const promise = chrome.runtime.sendMessage({
          type: 'UPDATE_WATER_REMINDER',
          enabled: waterReminder,
          interval: Number(waterInterval)
        }, (response) => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.log('Background service worker not active yet:', err.message);
          } else {
            console.log('Water reminder sync response:', response);
          }
        });
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err) => {
            console.log('Water reminder sync message ignored (extension inactive):', err.message);
          });
        }
      } catch (e) {
        // Silently ignore synchronous errors
      }
    }
  }, [waterReminder, waterInterval]);

  // Fetch notes and links from Supabase when user logs in/updates
  useEffect(() => {
    if (!supabase || !user) return;

    let isMounted = true;

    const fetchCloudData = async () => {
      try {
        console.log('Fetching user data from Supabase...');
        
        // 0. Sync offline deletions first
        const notesToDelete = deletedNoteIdsRef.current;
        if (notesToDelete.length > 0) {
          try {
            const { error } = await supabase.from('notes').delete().in('id', notesToDelete);
            if (!error) {
              setDeletedNoteIds(prev => prev.filter(id => !notesToDelete.includes(id)));
            } else {
              console.error('Failed to sync offline note deletions:', error);
            }
          } catch (e) {
            console.error('Failed to sync offline note deletions:', e);
          }
        }
        
        const linksToDelete = deletedLinkIdsRef.current;
        if (linksToDelete.length > 0) {
          try {
            const { error } = await supabase.from('links').delete().in('id', linksToDelete);
            if (!error) {
              setDeletedLinkIds(prev => prev.filter(id => !linksToDelete.includes(id)));
            } else {
              console.error('Failed to sync offline link deletions:', error);
            }
          } catch (e) {
            console.error('Failed to sync offline link deletions:', e);
          }
        }

        // 1. Fetch notes
        const { data: cloudNotes, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id);

        if (notesError) throw notesError;

        // 2. Fetch links
        const { data: cloudLinks, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', user.id);

        if (linksError) throw linksError;

        if (!isMounted) return;

        // Filter out any fetched items that are locally deleted
        const activeCloudNotes = (cloudNotes || []).filter(c => !deletedNoteIdsRef.current.includes(c.id));
        const activeCloudLinks = (cloudLinks || []).filter(c => !deletedLinkIdsRef.current.includes(c.id));

        // Map cloud notes to local format
        const mappedNotes = activeCloudNotes.map(row => ({
          id: row.id,
          title: row.title || '',
          content: row.content || '',
          color: row.color || 'purple',
          customColor: row.items?.customColor || null,
          fontColor: row.items?.fontColor || null,
          tag: row.tag || 'note',
          priority: row.items?.realPriority || row.priority || 'none',
          status: row.status || 'none',
          font: 'sans',
          reminder: row.items?.reminder || null,
          reminderTriggered: !!row.items?.reminderTriggered,
          pinned: !!row.pinned,
          starred: !!row.starred,
          archived: !!row.archived,
          created: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          updated: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
          synced: true,
        }));

        setNotes(prev => {
          const DEFAULT_DEMOS = {
            demo1: { title: 'Welcome to StickyVerse ✨', content: 'Your aesthetic productivity workspace. Click + to create your first note!', color: 'purple', tag: 'note', status: 'none', priority: 'none', pinned: false, starred: false, archived: false },
            demo2: { title: "Today's Tasks 📋", content: '• Complete project review\n• Send weekly report\n• Team meeting at 3 PM\n• Code review for PR #42', color: 'blue', tag: 'task', status: 'in-progress', priority: 'high', pinned: true, starred: false, archived: false },
            demo3: { title: 'Quick Idea 💡', content: 'Add keyboard shortcuts for common actions. Ctrl+N for new note, Ctrl+P for pin.', color: 'yellow', tag: 'idea', status: 'none', priority: 'medium', pinned: false, starred: true, archived: false },
            demo4: { title: 'Inspiration 🌊', content: '"The secret of getting ahead is getting started." — Mark Twain', color: 'green', tag: 'quote', status: 'none', priority: 'none', pinned: false, starred: false, archived: false },
            demo5: { title: 'Meeting Notes', content: 'Discussed Q3 roadmap. Key decisions:\n- Launch v2 by August\n- Onboard 3 new clients\n- Redesign dashboard UI', color: 'pink', tag: 'note', status: 'none', priority: 'low', pinned: false, starred: false, archived: false },
          };

          const isDemoModified = (note) => {
            const defaultDemo = DEFAULT_DEMOS[note.id];
            if (!defaultDemo) return true;
            return (
              note.title !== defaultDemo.title ||
              note.content !== defaultDemo.content ||
              note.color !== defaultDemo.color ||
              note.tag !== defaultDemo.tag ||
              note.status !== defaultDemo.status ||
              note.priority !== defaultDemo.priority ||
              !!note.pinned !== defaultDemo.pinned ||
              !!note.starred !== defaultDemo.starred ||
              !!note.archived !== defaultDemo.archived
            );
          };

          // Sanitize legacy 'note_' prefix and modified 'demo' notes to UUIDs
          const sanitizedPrev = prev.map(local => {
            if (local.id && local.id.startsWith('note_')) {
              return { ...local, id: generateUUID() };
            }
            if (local.id && local.id.startsWith('demo')) {
              if (isDemoModified(local)) {
                return { ...local, id: generateUUID() };
              }
            }
            return local;
          });

          // Filter out unmodified demo notes
          const filteredLocal = sanitizedPrev.filter(local => !local.id.startsWith('demo'));

          if (filteredLocal.length === 0) {
            return mappedNotes;
          }

          const merged = [...mappedNotes];
          filteredLocal.forEach(local => {
            const cloud = merged.find(c => c.id === local.id);
            if (!cloud) {
              if (local.synced === true) {
                // Was synced before, missing in cloud -> deleted on cloud
                console.log('Note was deleted on the cloud, removing locally:', local.title);
              } else {
                // Unsynced local note -> upload
                merged.push({ ...local, synced: true });
                const priorityValue = ['low', 'medium', 'high', 'urgent'].includes(local.priority) ? local.priority : 'medium';
                supabase.from('notes').insert({
                  id: local.id,
                  user_id: user.id,
                  title: local.title || null,
                  content: local.content,
                  type: local.tag === 'checklist' ? 'checklist' : local.tag === 'quote' ? 'quote' : 'note',
                  style: local.tag === 'quote' ? 'polaroid' : 'regular',
                  color: ['purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark'].includes(local.color) ? local.color : 'purple',
                  tag: local.tag || 'note',
                  status: local.status || 'none',
                  priority: priorityValue,
                  pinned: !!local.pinned,
                  starred: !!local.starred,
                  items: {
                    customColor: local.customColor || null,
                    fontColor: local.fontColor || null,
                    realPriority: local.priority || 'none',
                    reminder: local.reminder || null,
                    reminderTriggered: !!local.reminderTriggered
                  },
                  created_at: new Date(local.created).toISOString(),
                  updated_at: new Date(local.updated).toISOString(),
                }).then(({ error }) => {
                  if (error) {
                    console.error('Failed to sync unsynced local note:', error.message);
                    setNotes(current => current.map(n => n.id === local.id ? { ...n, synced: false } : n));
                  }
                });
              }
            } else {
              const localUpdated = local.updated || local.created || 0;
              const cloudUpdated = cloud.updated || cloud.created || 0;
              if (localUpdated > cloudUpdated) {
                // Local is newer -> update cloud
                const idx = merged.findIndex(c => c.id === local.id);
                if (idx !== -1) {
                  merged[idx] = { ...local, synced: true };
                }
                 const priorityValue = ['low', 'medium', 'high', 'urgent'].includes(local.priority) ? local.priority : 'medium';
                 supabase.from('notes').update({
                   title: local.title || null,
                   content: local.content,
                   color: ['purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark'].includes(local.color) ? local.color : 'purple',
                   tag: local.tag || 'note',
                   status: local.status || 'none',
                   priority: priorityValue,
                   pinned: !!local.pinned,
                   starred: !!local.starred,
                   items: {
                     customColor: local.customColor || null,
                     fontColor: local.fontColor || null,
                     realPriority: local.priority || 'none',
                     reminder: local.reminder || null,
                     reminderTriggered: !!local.reminderTriggered
                   },
                   updated_at: new Date(localUpdated).toISOString(),
                 }).eq('id', local.id).then(({ error }) => {
                  if (error) {
                    console.error('Failed to sync newer local note:', error.message);
                  }
                });
              } else {
                // Cloud is newer or same -> keep cloud (which has synced: true)
              }
            }
          });
          return merged;
        });

        // Map cloud links to local format
        const mappedLinks = activeCloudLinks.map(row => ({
          id: row.id,
          url: row.url,
          title: row.title,
          host: row.host,
          favicon: row.favicon,
          note: row.description || '',
          created: row.saved_at ? new Date(row.saved_at).getTime() : Date.now(),
          synced: true,
        }));

        setLinks(prev => {
          if (prev.length === 0) return mappedLinks;
          const merged = [...mappedLinks];
          prev.forEach(local => {
            const cloud = merged.find(c => c.id === local.id);
            if (!cloud) {
              if (local.synced === true) {
                // Was synced -> deleted on cloud
                console.log('Link was deleted on the cloud, removing locally:', local.title);
              } else {
                // Unsynced local link -> upload
                merged.push({ ...local, synced: true });
                supabase.from('links').insert({
                  id: local.id,
                  user_id: user.id,
                  url: local.url,
                  title: local.title,
                  host: local.host,
                  favicon: local.favicon,
                  description: local.note || null,
                  saved_at: new Date(local.created).toISOString(),
                }).then(({ error }) => {
                  if (error) {
                    console.error('Failed to sync unsynced local link:', error.message);
                    setLinks(current => current.map(l => l.id === local.id ? { ...l, synced: false } : l));
                  }
                });
              }
            }
          });
          return merged;
        });

      } catch (err) {
        console.error('Failed to fetch cloud data:', err.message);
      }
    };

    fetchCloudData();

    return () => { isMounted = false; };
  }, [supabase, user]);

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
      const isUserLoggedIn = !!user;
      setNotes([
        {
          id: isUserLoggedIn ? generateUUID() : 'demo1', title: 'Welcome to StickyVerse ✨',
          content: 'Your aesthetic productivity workspace. Click + to create your first note!',
          color: 'purple', tag: 'note', status: 'none', priority: 'none',
          pinned: false, starred: false, archived: false, created: Date.now() - 3600000, updated: Date.now() - 3600000,
          synced: false
        },
        {
          id: isUserLoggedIn ? generateUUID() : 'demo2', title: "Today's Tasks 📋",
          content: '• Complete project review\n• Send weekly report\n• Team meeting at 3 PM\n• Code review for PR #42',
          color: 'blue', tag: 'task', status: 'in-progress', priority: 'high',
          pinned: true, starred: false, archived: false, created: Date.now() - 7200000, updated: Date.now() - 3600000,
          synced: false
        },
        {
          id: isUserLoggedIn ? generateUUID() : 'demo3', title: 'Quick Idea 💡',
          content: 'Add keyboard shortcuts for common actions. Ctrl+N for new note, Ctrl+P for pin.',
          color: 'yellow', tag: 'idea', status: 'none', priority: 'medium',
          pinned: false, starred: true, archived: false, created: Date.now() - 10800000, updated: Date.now() - 10800000,
          synced: false
        },
        {
          id: isUserLoggedIn ? generateUUID() : 'demo4', title: 'Inspiration 🌊',
          content: '"The secret of getting ahead is getting started." — Mark Twain',
          color: 'green', tag: 'quote', status: 'none', priority: 'none',
          pinned: false, starred: false, archived: false, created: Date.now() - 14400000, updated: Date.now() - 14400000,
          synced: false
        },
        {
          id: isUserLoggedIn ? generateUUID() : 'demo5', title: 'Meeting Notes',
          content: 'Discussed Q3 roadmap. Key decisions:\n- Launch v2 by August\n- Onboard 3 new clients\n- Redesign dashboard UI',
          color: 'pink', tag: 'note', status: 'none', priority: 'low',
          pinned: false, starred: false, archived: false, created: Date.now() - 18000000, updated: Date.now() - 18000000,
          synced: false
        },
      ]);
    }
  }, [user]);

  const ctx = {
    notes, setNotes, links, setLinks, goals, setGoals,
    deletedNoteIds, setDeletedNoteIds, deletedLinkIds, setDeletedLinkIds,
    addDeletedNoteId, addDeletedLinkId,
    view, setView, filter, setFilter, sortBy, setSortBy,
    theme, setTheme, modalOpen, setModalOpen, modalType, setModalType,
    editingNote, setEditingNote,
    searchQuery, setSearchQuery, focusText, setFocusText,
    globalFont, setGlobalFont,
    waterReminder, setWaterReminder,
    waterInterval, setWaterInterval,
    user, supabase, signIn, signOut,
    priorityColors, setPriorityColors,
    THEMES,
    premiumUnlocked, setPremiumUnlocked,
    showPremiumModal, setShowPremiumModal,
    wallpaper, setWallpaper,
    setToast,
    pomodoroTime, setPomodoroTime,
    pomodoroTotal,
    isPomodoroRunning, setIsPomodoroRunning,
    handleStartPomodoro
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

      {showPremiumModal && (
        <div className="modal-overlay" style={{ zIndex: 110000 }} onClick={e => e.target === e.currentTarget && setShowPremiumModal(false)}>
          <div className="modal premium-modal" style={{
            maxWidth: '450px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.98), rgba(15, 23, 42, 0.98))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.25)',
            textAlign: 'center',
            padding: '32px 24px',
            position: 'relative'
          }}>
            <button 
              className="modal-close" 
              onClick={() => setShowPremiumModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
            >×</button>
            <div style={{ fontSize: '54px', marginBottom: '16px' }}>👑</div>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '24px',
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px'
            }}>Unlock StickyVerse Premium</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px' }}>
              Take your productivity aesthetic to the next level. Support independent development and get permanent access to premium features!
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '28px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>✨</span> <strong>4x Premium Fonts</strong> (Signature, Playful, Chalkboard, Dyslexic)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>🖼️</span> <strong>Aesthetic Wallpaper Backgrounds</strong> (Unsplash presets & Custom URLs)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>🔋</span> <strong>Unlimited Active Widgets</strong> & Custom Reminders
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>☁️</span> <strong>Priority Cloud Sync</strong> & Data Backups
              </div>
            </div>

            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
              $2.99 <span style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.6 }}>one-time purchase</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                setPremiumUnlocked(true);
                setShowPremiumModal(false);
                setToast({
                  title: '👑 Premium Activated!',
                  body: 'Thank you for upgrading to StickyVerse Premium! Enjoy all custom fonts and wallpapers.'
                });
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              Upgrade Now ✨
            </button>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
              Secured with standard simulated Stripe checkout
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}
