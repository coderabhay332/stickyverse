/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Small progress every day adds up to big results.", author: "Unknown" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your future self is watching you right now through your memories.", author: "Aubrey de Grey" },
  { text: "Consistency is the hallmark of the unimaginative.", author: "Oscar Wilde" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
];
const COLORS = [
  { id: 'purple', hex: '#C4B5FD', label: 'Lavender' },
  { id: 'yellow', hex: '#FFF176', label: 'Yellow' },
  { id: 'pink',   hex: '#FECDD3', label: 'Pink' },
  { id: 'green',  hex: '#A7F3D0', label: 'Mint' },
  { id: 'blue',   hex: '#BFDBFE', label: 'Blue' },
  { id: 'cream',  hex: '#FFFBEB', label: 'Cream' },
  { id: 'dark',   hex: '#1E1B4B', label: 'Dark' },
];
const PIN_COLORS = { purple: '#7C3AED', green: '#10B981', orange: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };
const PINS_FOR_COLOR = { purple:'purple', yellow:'orange', pink:'red', green:'green', blue:'blue', cream:'red', dark:'green' };
const THEMES = [
  { id:'void',    bg:'#0C0A1E', label:'Dark Void',  em:'🌑',
    body:'#0C0A1E', b1:'#7C3AED', b2:'#4C1D95', b3:'#6D28D9', b4:'#EC4899',
    accent:'#A78BFA', text:'#ffffff', sidebar:'rgba(15,12,40,0.85)', card:'rgba(255,255,255,0.05)' },
  { id:'minimal', bg:'#F0EEE8', label:'Minimal',    em:'🤍',
    body:'#F0EEE8', b1:'#C4B5FD', b2:'#E0D7FF', b3:'#DDD6FE', b4:'#FBCFE8',
    accent:'#7C3AED', text:'#1a1a2e', sidebar:'rgba(240,238,232,0.92)', card:'rgba(0,0,0,0.05)' },
  { id:'cyber',   bg:'#030C06', label:'Cyber',      em:'🟩',
    body:'#030C06', b1:'#065f46', b2:'#064e3b', b3:'#10B981', b4:'#34D399',
    accent:'#34D399', text:'#e0fff4', sidebar:'rgba(3,12,6,0.92)',  card:'rgba(16,185,129,0.08)' },
  { id:'lofi',    bg:'#0F0A04', label:'Lo-fi',      em:'☕',
    body:'#0F0A04', b1:'#78350f', b2:'#451a03', b3:'#92400e', b4:'#D97706',
    accent:'#F59E0B', text:'#fef3c7', sidebar:'rgba(15,10,4,0.92)',  card:'rgba(245,158,11,0.08)' },
  { id:'ocean',   bg:'#020d1a', label:'Ocean',      em:'🌊',
    body:'#020d1a', b1:'#1e3a5f', b2:'#0c4a6e', b3:'#0369a1', b4:'#38bdf8',
    accent:'#38bdf8', text:'#e0f2fe', sidebar:'rgba(2,13,26,0.92)',  card:'rgba(56,189,248,0.08)' },
  { id:'rose',    bg:'#1a0510', label:'Rose',       em:'🌹',
    body:'#1a0510', b1:'#9f1239', b2:'#881337', b3:'#be123c', b4:'#fb7185',
    accent:'#fb7185', text:'#fff1f2', sidebar:'rgba(26,5,16,0.92)',  card:'rgba(251,113,133,0.08)' },
  { id:'galaxy',  bg:'#080516', label:'Galaxy',     em:'🌌',
    body:'#080516', b1:'#312e81', b2:'#1e1b4b', b3:'#4f46e5', b4:'#818cf8',
    accent:'#818cf8', text:'#eef2ff', sidebar:'rgba(8,5,22,0.92)',   card:'rgba(129,140,248,0.08)' },
  { id:'forest',  bg:'#051209', label:'Forest',     em:'🌲',
    body:'#051209', b1:'#14532d', b2:'#052e16', b3:'#166534', b4:'#4ade80',
    accent:'#4ade80', text:'#f0fdf4', sidebar:'rgba(5,18,9,0.92)',   card:'rgba(74,222,128,0.08)' },
];

/* ══════════════════════════════════════
   UTILS
══════════════════════════════════════ */
function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let supabaseInitializing = false;
let S = {
  notes: [],
  links: [],
  goals: [],
  reading: [],
  vision: [],
  notifications: [],
  activity: [],
  view: 'home',
  filter: 'all',
  quoteIdx: 0,
  sbQuoteIdx: 0,
  modalType: 'note',
  modalColor: 'purple',
  modalTag: 'note',
  modalStatus: 'none',
  modalPriority: 'none',
  checklistItems: [],
  pomo: { mode: 'work', tl: 25 * 60, running: false, iv: null },
  canvasId: null,
  canvasSaveTimer: null,
  theme: localStorage.getItem('sv_theme') || 'void',
  wallpaper: localStorage.getItem('sv_wallpaper') || 'none',
  idc: parseInt(localStorage.getItem('sv_idc') || '0'),
  lofiOn: false,
};

/* ══════════════════════════════════════
   DEMO NOTES
══════════════════════════════════════ */
const DEMO_NOTES = [
  {
    id: 'demo1', type: 'checklist', style: 'regular', title: "Today's Plan ☀️",
    color: 'purple', pin: 'purple', hasTape: false,
    items: [
      {text:'Workout 30 mins',done:true},{text:'Read 20 pages',done:true},
      {text:'Work on project',done:true},{text:'Learn something new',done:false}
    ],
    tag: 'task', pinned: false, starred: false, created: Date.now() - 3600000, status: 'in-progress',
  },
  {
    id: 'demo2', type: 'bullet', style: 'regular', title: 'Design Ideas 💡',
    color: 'yellow', pin: 'orange', hasTape: false,
    items: ['Glassmorphism UI', 'Neon gradient', '3D icons', 'Soft shadows'],
    tag: 'idea', pinned: false, starred: false, created: Date.now() - 2800000, status: 'none',
  },
  {
    id: 'demo3', type: 'quote', style: 'regular', title: null,
    color: 'dark', pin: 'green', hasTape: false,
    content: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
    tag: 'quote', pinned: false, starred: false, created: Date.now() - 3200000, status: 'none',
  },
  {
    id: 'demo4', type: 'photo', style: 'polaroid', title: 'Kashmir Trip ✈️',
    color: 'polaroid', pin: 'red', hasTape: false,
    content: 'Kashmir Trip ✈️\nJune 2026', polEmoji: '🏔️',
    tag: 'note', pinned: false, starred: true, created: Date.now() - 4000000, status: 'none',
  },
  {
    id: 'demo5', type: 'checklist', style: 'notebook', title: 'Project Tasks 🚀',
    color: 'blue', pin: 'blue', hasTape: false,
    items: [
      {text:'Research',done:true},{text:'Wireframe',done:true},
      {text:'Design System',done:true},{text:'Develop',done:false},{text:'Launch',done:false}
    ],
    doodle: '🚀',
    tag: 'task', pinned: true, starred: false, created: Date.now() - 5000000, status: 'waiting',
  },
  {
    id: 'demo6', type: 'bullet', style: 'tape', title: 'Book to Read 📚',
    color: 'pink', pin: null, hasTape: true, tapeColor: 'tape-pink',
    items: ['Atomic Habits', 'Deep Work', 'The Almanack of Naval Ravikant'],
    tag: 'idea', pinned: false, starred: false, created: Date.now() - 7000000, status: 'none',
  },
  {
    id: 'demo7', type: 'note', style: 'regular', title: "Today's Goal 🎯",
    color: 'green', pin: 'green', hasTape: false,
    content: 'Build something people love.',
    tag: 'note', pinned: false, starred: false, created: Date.now() - 3900000, status: 'completed',
  },
  {
    id: 'demo8', type: 'note', style: 'regular', title: 'Quick Note',
    color: 'cream', pin: 'red', hasTape: false,
    content: "Don't forget to call the client at 4 PM.",
    tag: 'note', pinned: false, starred: false, created: Date.now() - 9000000, status: 'delayed',
  },
];

const DEMO_LINKS = [
  { id:'ll1', url:'https://youtube.com', title:'How to Design Better User Experiences', host:'youtube.com', favicon:'https://www.google.com/s2/favicons?sz=64&domain=youtube.com', savedAt: Date.now()-3600000 },
  { id:'ll2', url:'https://dribbble.com', title:'Dashboard UI Kit Concept', host:'dribbble.com', favicon:'https://www.google.com/s2/favicons?sz=64&domain=dribbble.com', savedAt: Date.now()-4400000 },
  { id:'ll3', url:'https://twitter.com', title:'Elon Musk: The future is gonna be incredible 🚀', host:'twitter.com', favicon:'https://www.google.com/s2/favicons?sz=64&domain=twitter.com', savedAt: Date.now()-6000000 },
  { id:'ll4', url:'https://notion.so', title:'Notion Habit Tracker (Premium Template)', host:'notion.so', favicon:'https://www.google.com/s2/favicons?sz=64&domain=notion.so', savedAt: Date.now()-7000000 },
];

const DEMO_GOALS = [
  {
    id: 'g1',
    title: 'Complete StickyVerse V1',
    description: 'Finish implementing all V1 features including authentication and cloud sync',
    category: 'professional',
    type: 'long-term',
    priority: 'high',
    status: 'active',
    progress: 85,
    target_date: new Date('2026-06-30').toISOString().split('T')[0],
    created_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'g2',
    title: 'Read 20 Pages Daily',
    description: 'Build consistent reading habit for personal growth',
    category: 'personal',
    type: 'daily',
    priority: 'medium',
    status: 'active',
    progress: 60,
    target_date: new Date('2026-12-31').toISOString().split('T')[0],
    created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: 'g3',
    title: 'Learn TypeScript',
    description: 'Master TypeScript for better web development',
    category: 'learning',
    type: 'monthly',
    priority: 'medium',
    status: 'active',
    progress: 30,
    target_date: new Date('2026-07-31').toISOString().split('T')[0],
    created_at: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'g4',
    title: 'Exercise 3x per Week',
    description: 'Maintain physical fitness and health',
    category: 'health',
    type: 'weekly',
    priority: 'high',
    status: 'active',
    progress: 75,
    target_date: new Date('2026-12-31').toISOString().split('T')[0],
    created_at: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Verify we're running as new tab override
  console.log('StickyVerse loading...');
  console.log('URL:', window.location.href);
  console.log('Protocol:', window.location.protocol);
  
  if (window.location.protocol === 'chrome-extension:') {
    console.log('✅ StickyVerse loaded as new tab override');
  } else {
    console.warn('⚠️ StickyVerse not running in extension context');
  }
  
  // Check if user needs to login first
  const needsAuth = await checkAuthAndRedirect();
  if (needsAuth) {
    // Show full-screen login overlay — block everything behind it
    document.body.style.overflow = 'hidden';
    applyTheme(S.theme, false);
    showLoginRequiredOverlay();
    return; // Do NOT render dashboard at all
  }
  
  // Initialize Supabase and check authentication
  await initializeAuthAndSync();
  
  // Load data (local or cloud)
  await loadData();
  
  // Setup UI components
  setupNav();
  setupCmdBar();
  setupFilterTabs();
  setupModal();
  setupSearch();
  setupLinks();
  setupSettings();
  setupWidgets();
  setupDropZone();
  setupBottomBar();
  setupReadingList();
  setupVisionBoard();
  buildThemesGrid();
  buildColorPicker();
  startClock();
  updateStreak();
  rotateSidebarQuote();
  rotateRpQuote();
  buildQuoteDots();
  renderAll();
  applyTheme(S.theme, false);
  applyWallpaper();
  updateLinkBadge();
  setupNoteCanvas();
  
  // Setup Quick Capture - global spacebar shortcut
  setupQuickCapture();
});

/* ══════════════════════════════════════
   GOAL EVENT DELEGATION
══════════════════════════════════════ */
function setupGoalEventDelegation() {
  // Handle goal edit button clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.goal-edit-btn')) {
      const btn = e.target.closest('.goal-edit-btn');
      const goalId = btn.dataset.goalId;
      if (goalId) editGoal(goalId);
      return;
    }
    
    if (e.target.closest('.goal-delete-btn')) {
      const btn = e.target.closest('.goal-delete-btn');
      const goalId = btn.dataset.goalId;
      if (goalId) deleteGoal(goalId);
      return;
    }
    
    if (e.target.closest('.progress-btn')) {
      const btn = e.target.closest('.progress-btn');
      const goalId = btn.dataset.goalId;
      const progress = parseInt(btn.dataset.progress);
      if (goalId && !isNaN(progress)) {
        updateGoalProgress(goalId, progress);
      }
      return;
    }
  });
}

/* ══════════════════════════════════════
   QUICK CAPTURE
══════════════════════════════════════ */
let quickCaptureActive = false;

function setupQuickCapture() {
  document.addEventListener('keydown', (e) => {
    // Only trigger on spacebar when not typing in an input
    if (e.code === 'Space' && !quickCaptureActive && !isInputFocused(e)) {
      e.preventDefault();
      showQuickCapture();
    }
    
    // Escape to dismiss Quick Capture
    if (e.code === 'Escape' && quickCaptureActive) {
      hideQuickCapture();
    }
  });
}

function isInputFocused(e) {
  const activeElement = document.activeElement;
  return activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true' ||
    activeElement.classList.contains('ql-editor') ||
    activeElement.classList.contains('modal-input')
  );
}

function showQuickCapture() {
  if (quickCaptureActive) return;
  quickCaptureActive = true;
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'quick-capture-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  // Create input container
  const container = document.createElement('div');
  container.style.cssText = `
    background: var(--theme-body, #0C0A1E);
    border: 2px solid var(--theme-accent, #A78BFA);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    animation: slideUp 0.3s ease;
  `;
  
  // Create input
  const input = document.createElement('textarea');
  input.id = 'quick-capture-input';
  input.placeholder = 'Type your thought...';
  input.style.cssText = `
    width: 100%;
    min-height: 60px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--theme-text, #ffffff);
    font-family: 'DM Sans', sans-serif;
    font-size: 1.1rem;
    line-height: 1.5;
    resize: vertical;
    padding: 0;
    margin: 0;
  `;
  
  // Create hint
  const hint = document.createElement('div');
  hint.style.cssText = `
    color: var(--theme-text, rgba(255,255,255,0.5));
    font-size: 0.85rem;
    margin-top: 12px;
    text-align: center;
  `;
  hint.textContent = 'Press Enter to save • Escape to cancel';
  
  container.appendChild(input);
  container.appendChild(hint);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Focus input
  setTimeout(() => input.focus(), 100);
  
  // Handle Enter key to save
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = input.value.trim();
      if (content) {
        createQuickNote(content);
        hideQuickCapture();
      }
    }
  });
  
  // Click outside to dismiss
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideQuickCapture();
    }
  });
}

function hideQuickCapture() {
  const overlay = document.getElementById('quick-capture-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  }
  quickCaptureActive = false;
}

function createQuickNote(content) {
  // Create a quick note with random color
  const colors = ['purple', 'yellow', 'pink', 'green', 'blue', 'cream'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const noteData = {
    type: 'note',
    title: null,
    content: content,
    color: randomColor,
    tag: 'note',
    status: 'none',
    priority: 'none'
  };
  
  addNote(noteData);
  save();
  renderAll();
  
  // Show success feedback
  toast('💭 Quick note captured!');
  
  // Add a subtle animation to the new note
  setTimeout(() => {
    const newNoteElement = document.querySelector(`[data-note-id="${S.notes[0].id}"]`);
    if (newNoteElement) {
      newNoteElement.style.animation = 'pulse 0.6s ease';
      setTimeout(() => {
        newNoteElement.style.animation = '';
      }, 600);
    }
  }, 100);
}

// Add CSS animations for Quick Capture
const quickCaptureStyles = document.createElement('style');
quickCaptureStyles.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  #quick-capture-overlay {
    font-family: 'DM Sans', sans-serif;
  }
  
  #quick-capture-input::placeholder {
    color: var(--theme-text, rgba(255,255,255,0.4));
  }
  
  #quick-capture-input:focus {
    outline: none;
  }
`;
document.head.appendChild(quickCaptureStyles);

// Start the application
(async () => {
  console.log('🚀 StickyVerse starting...');
  
  if (window.location.protocol === 'chrome-extension:') {
    console.log('✅ StickyVerse loaded as new tab override');
  } else {
    console.warn('⚠️ StickyVerse not running in extension context');
  }
  
  // Check if user needs to login first
  const needsAuth = await checkAuthAndRedirect();
  if (needsAuth) {
    // Show full-screen login overlay — block everything behind it
    document.body.style.overflow = 'hidden';
    applyTheme(S.theme, false);
    showLoginRequiredOverlay();
    return; // Do NOT render dashboard at all
  }
  
  // Initialize Supabase and check authentication
  await initializeAuthAndSync();
  
  // Load data (local or cloud)
  await loadData();
  
  // Setup UI components
  setupNav();
  setupCmdBar();
  setupFilterTabs();
  setupModal();
  setupSearch();
  setupLinks();
  setupSettings();
  setupWidgets();
  setupDropZone();
  setupBottomBar();
  setupReadingList();
  setupVisionBoard();
  buildThemesGrid();
  buildColorPicker();
  startClock();
  updateStreak();
  rotateSidebarQuote();
  rotateRpQuote();
  buildQuoteDots();
  renderAll();
  applyTheme(S.theme, false);
  applyWallpaper();
  updateLinkBadge();
  setupNoteCanvas();
  
  // Setup Quick Capture - global spacebar shortcut
  setupQuickCapture();
  
  // Setup goal event delegation
  setupGoalEventDelegation();
  
  // Setup new components
  setupDailyFocus();
  setupTemplates();
  updateWorkStats();
  
  setupAuthUI();
  
  console.log('✅ StickyVerse initialization complete');
})();

/* ══════════════════════════════════════
   AUTHENTICATION & SYNC
══════════════════════════════════════ */
let supabase = null;
let currentUser = null;
let isCloudSyncEnabled = false;

async function initializeAuthAndSync() {
  // Prevent multiple initializations
  if (supabaseInitializing) {
    console.log('🔍 Supabase initialization already in progress, skipping...');
    return;
  }
  
  supabaseInitializing = true;
  
  try {
    // Load Supabase script locally
    if (typeof window.supabase === 'undefined') {
      await loadSupabaseScript();
    }
  
    // Initialize Supabase client
    console.log('🔍 Initializing Supabase client...');
    if (!window.supabase) {
      throw new Error('Supabase not available after script loading');
    }
    supabase = window.supabase.createClient(
      'https://kzhovelxcwychkmykirc.supabase.co',
      'sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl'
    );
    console.log('🔍 Supabase client created successfully');

    // First: restore session from chrome.storage (set by content script bridge)
    const stored = await chrome.storage.local.get(['supabase_session']);
    if (stored.supabase_session) {
      const { access_token, refresh_token } = stored.supabase_session;
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (!error && data.session) {
        currentUser = data.session.user;
        isCloudSyncEnabled = true;
        console.log('✅ Session restored from storage:', currentUser.email);
        await setupRealtimeSync();
      }
    } else {
      // Fallback: check Supabase directly
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        currentUser = session.user;
        isCloudSyncEnabled = true;
        console.log('✅ User authenticated:', currentUser.email);
        await setupRealtimeSync();
      } else {
        console.log('🔓 No active session - using local storage');
      }
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        isCloudSyncEnabled = true;
        await migrateToCloud();
        await setupRealtimeSync();
        updateAuthUI();
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        isCloudSyncEnabled = false;
        updateAuthUI();
      }
    });
    
  } catch (error) {
    console.warn('Supabase initialization failed, using local storage:', error);
  } finally {
    supabaseInitializing = false;
  }
}

async function loadSupabaseScript() {
  // Check if Supabase is already loaded or if script is already being loaded
  if (typeof window.supabase !== 'undefined') {
    console.log('🔍 Supabase already loaded');
    return Promise.resolve();
  }
  
  // Check if script tag already exists to prevent duplicate loading
  const existingScript = document.querySelector('script[src*="supabase.min.js"]');
  if (existingScript) {
    console.log('🔍 Supabase script tag already exists, waiting for load...');
    return new Promise((resolve) => {
      if (typeof window.supabase !== 'undefined') {
        resolve();
      } else {
        existingScript.onload = () => {
          console.log('🔍 Existing Supabase script loaded');
          resolve();
        };
        existingScript.onerror = () => {
          console.error('🔍 Failed to load existing Supabase script');
          resolve();
        };
        // Fallback timeout in case script already loaded
        setTimeout(() => {
          console.log('🔍 Supabase script fallback timeout');
          resolve();
        }, 1000);
      }
    });
  }
  
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('supabase.min.js');
    script.onload = () => {
      console.log('🔍 Supabase script loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('🔍 Failed to load Supabase script');
      resolve(); // Continue even if script fails
    };
    document.head.appendChild(script);
  });
}

async function setupRealtimeSync() {
  if (!isCloudSyncEnabled || !currentUser) return;
  
  // Subscribe to notes changes
  const notesSubscription = supabase
    .channel('notes_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${currentUser.id}` },
      (payload) => {
        handleRealtimeNoteChange(payload);
      }
    )
    .subscribe();
    
  // Subscribe to links changes
  const linksSubscription = supabase
    .channel('links_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'links', filter: `user_id=eq.${currentUser.id}` },
      (payload) => {
        handleRealtimeLinkChange(payload);
      }
    )
    .subscribe();
    
  console.log('✅ Real-time sync enabled');
}

async function checkAuthAndRedirect() {
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    
    if (result.supabase_session) {
      return false; // Already has session
    }
    
    // No saved session — try to auto-detect from website tab
    console.log('� No session found, checking website tab...');
    const session = await tryGetSessionFromWebsite();
    
    if (session) {
      // Save it and proceed without overlay
      await chrome.storage.local.set({ supabase_session: session });
      console.log('✅ Auto-connected from website session:', session.user?.email);
      return false; // No overlay needed
    }
    
    console.log('🔒 No session anywhere - showing login overlay');
    return true; // Show login overlay
  } catch (error) {
    console.error('Auth check error:', error);
    return true;
  }
}

async function tryGetSessionFromWebsite() {
  try {
    const localTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    const prodTabs = await chrome.tabs.query({ url: 'https://peaceful-peony-58cb08.netlify.app/*' });
    const tabs = [...localTabs, ...prodTabs];
    if (tabs.length === 0) return null;
    
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSession' });
    return response?.session || null;
  } catch (err) {
    console.log('Website tab not ready:', err.message);
    return null;
  }
}

function showLoginRequiredOverlay() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0f0a1e 0%, #1e1b4b 100%);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="
      text-align: center;
      max-width: 420px;
      padding: 2rem;
    ">
      <div style="
        font-size: 3rem;
        margin-bottom: 1rem;
      ">✨</div>
      <h1 style="
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
        font-family: 'Syne', sans-serif;
      ">
        Sticky<span style="color: #a78bfa;">Verse</span>
      </h1>
      <p style="
        color: rgba(255,255,255,0.7);
        margin-bottom: 2rem;
        font-size: 1rem;
        line-height: 1.6;
      ">
        Sign in to sync your notes, links, and goals across all devices.
      </p>
      
      <button id="login-redirect-btn" style="
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;
      ">
        <span>🚀</span> Sign In on Website
      </button>
      
      <p style="
        color: rgba(255,255,255,0.5);
        font-size: 0.875rem;
        margin-top: 1.5rem;
      ">
        or continue with local data only
      </p>
      
      <button id="dismiss-auth-btn" style="
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.7);
        border: 1px solid rgba(255,255,255,0.2);
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 0.875rem;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: all 0.2s;
      ">
        Continue Locally →
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);

  // Hover effects via JS (CSP blocks inline onmouseover/onmouseout)
  const loginBtn = document.getElementById('login-redirect-btn');
  if (loginBtn) {
    loginBtn.addEventListener('mouseover', () => {
      loginBtn.style.transform = 'translateY(-2px)';
      loginBtn.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
    });
    loginBtn.addEventListener('mouseout', () => {
      loginBtn.style.transform = 'none';
      loginBtn.style.boxShadow = 'none';
    });
  }
  const dismissBtn = document.getElementById('dismiss-auth-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('mouseover', () => { dismissBtn.style.background = 'rgba(255,255,255,0.15)'; });
    dismissBtn.addEventListener('mouseout', () => { dismissBtn.style.background = 'rgba(255,255,255,0.1)'; });
  }
  
  let pollInterval = null;

  function startPolling() {
    if (pollInterval) return; // Already polling

    // Update button UI
    const btn = document.getElementById('login-redirect-btn');
    if (btn) {
      btn.innerHTML = '⏳ Waiting for sign in...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }

    async function checkAndHandleSession(session) {
      if (!session) return false;
      clearInterval(pollInterval);
      pollInterval = null;
      await chrome.storage.local.set({ supabase_session: session });
      const name = session.user?.user_metadata?.full_name || session.user?.email || 'User';
      overlay.innerHTML = `
        <div style="text-align:center; color:white; font-family:'DM Sans',sans-serif;">
          <div style="font-size:3rem; margin-bottom:1rem;">✅</div>
          <h2 style="font-size:1.5rem; font-weight:700; margin-bottom:0.5rem;">Connected!</h2>
          <p style="color:rgba(255,255,255,0.7);">Welcome, ${name}!</p>
          <p style="color:rgba(255,255,255,0.4); font-size:0.85rem; margin-top:0.5rem;">Loading your workspace...</p>
        </div>
      `;
      setTimeout(() => window.location.reload(), 1500);
      return true;
    }

    // Poll every 1.5s: check chrome.storage AND actively query website tabs
    pollInterval = setInterval(async () => {
      try {
        // 1. Check if background.js already saved a session
        const result = await chrome.storage.local.get(['supabase_session']);
        if (result.supabase_session) {
          await checkAndHandleSession(result.supabase_session);
          return;
        }

        // 2. Actively ask any open website tab for session
        const localTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
        const prodTabs = await chrome.tabs.query({ url: 'https://peaceful-peony-58cb08.netlify.app/*' });
        const tabs = [...localTabs, ...prodTabs];
        for (const tab of tabs) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSession' });
            if (response?.session) {
              await checkAndHandleSession(response.session);
              return;
            }
          } catch (e) { /* tab not ready, try next */ }
        }
      } catch (e) {
        // Keep polling
      }
    }, 1500);

    // Stop after 5 minutes
    setTimeout(() => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        const btn = document.getElementById('login-redirect-btn');
        if (btn) {
          btn.innerHTML = '🚀 Sign In on Website';
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      }
    }, 300000);
  }

  document.getElementById('login-redirect-btn').addEventListener('click', async () => {
    // Check if any website tab is already open and logged in
    try {
      const localTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
      const prodTabs = await chrome.tabs.query({ url: 'https://peaceful-peony-58cb08.netlify.app/*' });
      const tabs = [...localTabs, ...prodTabs];
      if (tabs.length > 0) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSession' });
        if (response?.session) {
          await chrome.storage.local.set({ supabase_session: response.session });
          window.location.reload();
          return;
        }
      }
    } catch (e) { /* fall through */ }

    // Open dashboard (not /auth — user may already be logged in)
    // If not logged in, website will redirect to /auth automatically
    const newTab = await chrome.tabs.create({ url: 'https://peaceful-peony-58cb08.netlify.app/dashboard' });
    startPolling();

    // Once tab finishes loading, actively ask it for session
    chrome.tabs.onUpdated.addListener(function onTabUpdated(tabId, changeInfo) {
      if (tabId !== newTab.id || changeInfo.status !== 'complete') return;
      chrome.tabs.onUpdated.removeListener(onTabUpdated);

      setTimeout(async () => {
        try {
          const response = await chrome.tabs.sendMessage(newTab.id, { action: 'getSession' });
          if (response?.session) {
            await chrome.storage.local.set({ supabase_session: response.session });
            window.location.reload();
          }
        } catch (e) { /* content script not ready, polling will catch it */ }
      }, 1500); // Wait for Supabase to init on the page
    });
  });

  document.getElementById('dismiss-auth-btn').addEventListener('click', async () => {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(async () => {
      overlay.remove();
      document.body.style.overflow = '';
      // Load dashboard in local-only mode
      await loadData();
      applyTheme(S.theme, false);
      setupNav(); setupCmdBar(); setupFilterTabs(); setupModal();
      setupSearch(); setupLinks(); setupSettings(); setupWidgets();
      setupDropZone(); setupBottomBar(); buildThemesGrid(); buildColorPicker();
      startClock(); updateStreak(); rotateSidebarQuote(); rotateRpQuote();
      buildQuoteDots(); renderAll(); updateLinkBadge(); setupNoteCanvas();
      setupAuthUI();
    }, 300);
  });
}

function handleRealtimeNoteChange(payload) {
  if (payload.eventType === 'INSERT') {
    S.notes.unshift(payload.new);
  } else if (payload.eventType === 'UPDATE') {
    const index = S.notes.findIndex(n => n.id === payload.new.id);
    if (index !== -1) {
      S.notes[index] = payload.new;
    }
  } else if (payload.eventType === 'DELETE') {
    S.notes = S.notes.filter(n => n.id !== payload.old.id);
  }
  renderNotes();
}

function handleRealtimeLinkChange(payload) {
  if (payload.eventType === 'INSERT') {
    S.links.unshift(payload.new);
  } else if (payload.eventType === 'UPDATE') {
    const index = S.links.findIndex(l => l.id === payload.new.id);
    if (index !== -1) {
      S.links[index] = payload.new;
    }
  } else if (payload.eventType === 'DELETE') {
    S.links = S.links.filter(l => l.id !== payload.old.id);
  }
  renderLinksGrid(document.getElementById('links-grid'), S.links, true);
  updateLinkBadge();
}

async function migrateToCloud() {
  if (!currentUser) return;
  try {
    const localNotes = JSON.parse(localStorage.getItem('sv_notes') || '[]');
    const localLinks = JSON.parse(localStorage.getItem('sv_links') || '[]');
    const localGoals = JSON.parse(localStorage.getItem('sv_goals') || '[]');

    if (localNotes.length > 0) {
      await supabase.from('notes').upsert(localNotes.map(noteToDbRow), { onConflict: 'id' });
    }
    if (localLinks.length > 0) {
      await supabase.from('links').upsert(localLinks.map(linkToDbRow), { onConflict: 'id' });
    }
    if (localGoals.length > 0) {
      await supabase.from('goals').upsert(localGoals.map(goalToDbRow), { onConflict: 'id' });
    }
    console.log('✅ Local data migrated to cloud');
  } catch (error) {
    console.error('Cloud migration failed:', error);
  }
}

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
async function loadData() {
  if (isCloudSyncEnabled && currentUser) {
    // Load from cloud
    await loadFromCloud();
  } else {
    // Load from local storage
    loadFromLocal();
  }
}

async function loadFromCloud() {
  try {
    const [notesRes, linksRes, goalsRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      supabase.from('links').select('*').eq('user_id', currentUser.id).order('saved_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]);

    if (notesRes.error) throw notesRes.error;
    if (linksRes.error) throw linksRes.error;
    if (goalsRes.error) throw goalsRes.error;

    S.notes = (notesRes.data || []).map(dbRowToNote);
    S.links = (linksRes.data || []).map(dbRowToLink);
    S.goals = (goalsRes.data || []).map(dbRowToGoal);

    // Always load these from localStorage (no cloud table for them)
    S.reading = JSON.parse(localStorage.getItem('sv_reading') || '[]');
    S.vision = JSON.parse(localStorage.getItem('sv_vision') || '[]');
    S.notifications = JSON.parse(localStorage.getItem('sv_notifications') || '[]');
    S.activity = JSON.parse(localStorage.getItem('sv_activity') || '[]');
    S.idc = parseInt(localStorage.getItem('sv_idc') || '0');

    // Keep localStorage in sync with cloud data
    localStorage.setItem('sv_notes', JSON.stringify(S.notes));
    localStorage.setItem('sv_links', JSON.stringify(S.links));
    localStorage.setItem('sv_goals', JSON.stringify(S.goals));

    console.log(`✅ Data loaded from cloud: ${S.notes.length} notes, ${S.links.length} links, ${S.goals.length} goals`);
  } catch (error) {
    console.error('Cloud load failed, using local:', error);
    loadFromLocal();
  }
}

function loadFromLocal() {
  try {
    const n = JSON.parse(localStorage.getItem('sv_notes') || 'null');
    S.notes = n || [];
    const l = JSON.parse(localStorage.getItem('sv_links') || 'null');
    S.links = l || [];
    const g = JSON.parse(localStorage.getItem('sv_goals') || 'null');
    S.goals = g || [];
    S.reading = JSON.parse(localStorage.getItem('sv_reading') || '[]');
    S.vision = JSON.parse(localStorage.getItem('sv_vision') || '[]');
    S.notifications = JSON.parse(localStorage.getItem('sv_notifications') || '[]');
    S.activity = JSON.parse(localStorage.getItem('sv_activity') || '[]');
    S.idc = parseInt(localStorage.getItem('sv_idc') || '0');
  } catch(e) {
    S.notes = []; S.links = []; S.goals = [];
    S.reading = []; S.vision = []; S.notifications = []; S.activity = [];
  }
}
async function save() {
  console.log('🔍 save() called');
  console.log('🔍 Cloud sync enabled:', isCloudSyncEnabled);
  console.log('🔍 Current user:', currentUser);
  
  saveToLocal(); // Always persist locally as safety net
  
  if (isCloudSyncEnabled && currentUser) {
    console.log('🔍 Attempting to save to cloud...');
    saveToCloud().catch(e => {
      console.error('🔍 Cloud save error:', e);
      console.log('🔍 Falling back to local storage only');
    });
  } else {
    console.log('🔍 Using local storage only');
  }
}

function noteToDbRow(note) {
  return {
    id: note.id,
    user_id: currentUser.id,
    title: note.title || null,
    content: note.content || null,
    type: note.type || 'note',
    style: note.style || 'regular',
    color: note.color || 'purple',
    tag: note.tag || 'note',
    status: note.status || 'none',
    priority: (note.priority && note.priority !== 'none') ? note.priority : 'medium',
    pinned: note.pinned || false,
    starred: note.starred || false,
    has_tape: note.hasTape || false,
    tape_color: note.tapeColor || null,
    pin: note.pin || null,
    items: note.items || null,
    author: note.author || null,
    pol_emoji: note.polEmoji || null,
    doodle: note.doodle || null,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToNote(row) {
  return {
    id: row.id,
    type: row.type,
    style: row.style,
    title: row.title,
    color: row.color,
    tag: row.tag,
    status: row.status,
    priority: row.priority,
    pinned: row.pinned,
    starred: row.starred,
    archived: row.archived || false,
    hasTape: row.has_tape || false,
    tapeColor: row.tape_color || null,
    pin: row.pin || null,
    content: row.content || null,
    items: row.items || null,
    author: row.author || null,
    polEmoji: row.pol_emoji || null,
    doodle: row.doodle || null,
    created: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function linkToDbRow(link) {
  return {
    id: link.id,
    user_id: currentUser.id,
    url: link.url,
    title: link.title,
    host: link.host,
    favicon: link.favicon || null,
    tags: link.tags || [],
    reading_status: link.readingStatus || link.reading_status || 'unread',
    is_favorite: link.isFavorite || link.is_favorite || false,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToLink(row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    host: row.host,
    favicon: row.favicon || null,
    tags: row.tags || [],
    readingStatus: row.reading_status || 'unread',
    isFavorite: row.is_favorite || false,
    savedAt: row.saved_at ? new Date(row.saved_at).getTime() : Date.now(),
  };
}

function goalToDbRow(goal) {
  return {
    id: goal.id,
    user_id: currentUser.id,
    title: goal.title,
    description: goal.description || null,
    category: goal.category || 'personal',
    type: goal.type || 'short-term',
    priority: goal.priority || 'medium',
    status: goal.status || 'active',
    progress: goal.progress || 0,
    target_date: goal.deadline || goal.target_date || null,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToGoal(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    category: row.category || 'personal',
    type: row.type || 'short-term',
    priority: row.priority || 'medium',
    status: row.status || 'active',
    progress: row.progress || 0,
    deadline: row.target_date || null,
    created: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

async function saveToCloud() {
  try {
    if (S.notes.length > 0) {
      const { error: notesError } = await supabase.from('notes').upsert(
        S.notes.map(noteToDbRow), { onConflict: 'id' }
      );
      if (notesError) console.error('Notes cloud save error:', notesError);
    }

    if (S.links.length > 0) {
      const { error: linksError } = await supabase.from('links').upsert(
        S.links.map(linkToDbRow), { onConflict: 'id' }
      );
      if (linksError) console.error('Links cloud save error:', linksError);
    }

    if (S.goals.length > 0) {
      const { error: goalsError } = await supabase.from('goals').upsert(
        S.goals.map(goalToDbRow), { onConflict: 'id' }
      );
      if (goalsError) console.error('Goals cloud save error:', goalsError);
    }

    console.log('✅ Data saved to cloud');
  } catch (error) {
    console.error('Cloud save failed:', error);
  }
}

function saveToLocal() {
  localStorage.setItem('sv_notes', JSON.stringify(S.notes));
  localStorage.setItem('sv_links', JSON.stringify(S.links));
  localStorage.setItem('sv_goals', JSON.stringify(S.goals));
  localStorage.setItem('sv_reading', JSON.stringify(S.reading));
  localStorage.setItem('sv_vision', JSON.stringify(S.vision));
  localStorage.setItem('sv_notifications', JSON.stringify(S.notifications));
  localStorage.setItem('sv_activity', JSON.stringify(S.activity.slice(0, 100)));
  localStorage.setItem('sv_idc', String(S.idc));
}
function saveLinks() {
  localStorage.setItem('sv_links', JSON.stringify(S.links));
  if (isCloudSyncEnabled && currentUser) {
    saveToCloud().catch(e => console.error('Cloud save error:', e));
  }
}

/* ══════════════════════════════════════
   GOAL MANAGEMENT
══════════════════════════════════════ */
function createGoal(goalData) {
  const goal = {
    id: generateUUID(),
    title: goalData.title || '',
    description: goalData.description || '',
    category: goalData.category || 'personal',
    type: goalData.type || 'short-term',
    priority: goalData.priority || 'medium',
    status: 'active',
    progress: 0,
    target_date: goalData.target_date || '',
    created_at: Date.now(),
    updated_at: Date.now(),
    ...goalData
  };
  
  S.goals.unshift(goal);
  save();
  renderGoals();
  updateGoalStats();
  toast('✅ Goal created successfully!');
  return goal;
}

function updateGoal(goalId, updates) {
  const index = S.goals.findIndex(g => g.id === goalId);
  if (index !== -1) {
    S.goals[index] = {
      ...S.goals[index],
      ...updates,
      updated_at: Date.now()
    };
    save();
    renderGoals();
    updateGoalStats();
    toast('✅ Goal updated successfully!');
    return S.goals[index];
  }
  return null;
}

function deleteGoal(goalId) {
  const index = S.goals.findIndex(g => g.id === goalId);
  if (index !== -1) {
    S.goals.splice(index, 1);
    save();
    renderGoals();
    updateGoalStats();
    toast('🗑️ Goal deleted');
  }
}

function updateGoalProgress(goalId, progress) {
  const goal = updateGoal(goalId, { progress: Math.max(0, Math.min(100, progress)) });
  if (goal && progress === 100) {
    updateGoal(goalId, { status: 'completed', completed_at: Date.now() });
    toast('🎉 Goal completed! Congratulations!');
  }
}

function getGoalsByCategory(category) {
  return category === 'all' ? S.goals : S.goals.filter(g => g.category === category);
}

function getGoalsByStatus(status) {
  return status === 'all' ? S.goals : S.goals.filter(g => g.status === status);
}

function getGoalsByType(type) {
  return type === 'all' ? S.goals : S.goals.filter(g => g.type === type);
}

function renderGoals() {
  const goalsContainer = document.getElementById('goals-container');
  if (!goalsContainer) return;
  
  // Update goal statistics
  updateGoalStats();
  
  const filteredGoals = getGoalsByStatus('active'); // Show active goals by default
  
  if (!filteredGoals.length) {
    goalsContainer.innerHTML = '<div class="empty-goals"><h3>No goals yet</h3><p>Create your first goal to start tracking your progress!</p></div>';
    return;
  }
  
  goalsContainer.innerHTML = filteredGoals.map(goal => buildGoalCard(goal)).join('');
}

function buildGoalCard(goal) {
  const categoryIcons = {
    personal: '👤',
    professional: '💼',
    health: '❤️',
    learning: '📚',
    financial: '💰',
    other: '📌'
  };
  
  const priorityColors = {
    low: '#60a5fa',
    medium: '#a78bfa',
    high: '#f87171',
    urgent: '#ef4444'
  };
  
  const statusColors = {
    active: '#34d399',
    completed: '#6b7280',
    paused: '#f59e0b',
    cancelled: '#ef4444'
  };
  
  const progressColor = goal.progress === 100 ? '#34d399' : 
                       goal.progress >= 75 ? '#60a5fa' :
                       goal.progress >= 50 ? '#a78bfa' :
                       goal.progress >= 25 ? '#f59e0b' : '#ef4444';
  
  const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  
  return `
    <div class="goal-card" data-goal-id="${goal.id}">
      <div class="goal-header">
        <div class="goal-title-section">
          <div class="goal-category">${categoryIcons[goal.category] || '📌'}</div>
          <h3 class="goal-title">${esc(goal.title)}</h3>
          <div class="goal-priority" style="background: ${priorityColors[goal.priority] || priorityColors.medium}"></div>
        </div>
        <div class="goal-actions">
          <button class="goal-edit-btn" data-goal-id="${goal.id}">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="goal-delete-btn" data-goal-id="${goal.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      ${goal.description ? `<p class="goal-description">${esc(goal.description)}</p>` : ''}
      
      <div class="goal-meta">
        <span class="goal-type">${goal.type}</span>
        <span class="goal-status" style="color: ${statusColors[goal.status] || statusColors.active}">${goal.status}</span>
        ${daysLeft !== null ? `<span class="goal-deadline ${daysLeft < 7 ? 'urgent' : ''}">${daysLeft > 0 ? daysLeft + ' days left' : daysLeft === 0 ? 'Due today!' : 'Overdue'}</span>` : ''}
      </div>
      
      <div class="goal-progress-section">
        <div class="progress-header">
          <span>Progress</span>
          <span class="progress-percentage">${goal.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progress}%; background: ${progressColor}"></div>
        </div>
        <div class="progress-controls">
          <button class="progress-btn progress-decrease" data-goal-id="${goal.id}" data-progress="${Math.max(0, goal.progress - 10)}">-10%</button>
          <button class="progress-btn progress-increase" data-goal-id="${goal.id}" data-progress="${Math.min(100, goal.progress + 10)}">+10%</button>
          ${goal.progress !== 100 ? `<button class="progress-btn progress-complete" data-goal-id="${goal.id}" data-progress="100">Complete</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════
   AUTHENTICATION UI
══════════════════════════════════════ */
async function setupAuthUI() {
  // Always read from chrome.storage as source of truth
  const stored = await chrome.storage.local.get(['supabase_session']);
  const sessionUser = stored.supabase_session?.user || currentUser;
  const synced = !!(sessionUser);

  const sidebar = document.getElementById('sidebar');
  const authSection = document.createElement('div');
  authSection.className = 'sb-auth-section';
  authSection.innerHTML = `
    <div id="auth-status" class="auth-status">
      ${sessionUser ? 
        `<div class="user-profile">
          ${sessionUser.user_metadata?.avatar_url 
            ? `<img src="${sessionUser.user_metadata.avatar_url}" class="user-avatar" style="object-fit:cover;">` 
            : `<div class="user-avatar">${(sessionUser.user_metadata?.full_name || sessionUser.email || 'U').charAt(0).toUpperCase()}</div>`
          }
          <div class="user-info">
            <div class="user-name">${sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User'}</div>
            <div class="user-email">${sessionUser.email}</div>
          </div>
          <button id="signout-btn" class="signout-btn" title="Sign out">
            <i class="fa-solid fa-sign-out-alt"></i>
          </button>
        </div>` :
        `<button id="signin-btn" class="signin-btn">
          <i class="fa-solid fa-google"></i>
          <span>Sign in with Google</span>
        </button>
      `}
    </div>
    <div class="sync-status">
      <i class="fa-solid fa-${synced ? 'cloud' : 'wifi-off'}"></i>
      <span>${synced ? 'Cloud sync active' : 'Local storage only'}</span>
    </div>
  `;
  
  const followBtn = document.getElementById('follow-x-btn');
  if (followBtn) {
    sidebar.insertBefore(authSection, followBtn);
  } else {
    sidebar.appendChild(authSection);
  }
  
  // Update topbar avatar
  const topbarAvatar = document.getElementById('topbar-avatar');
  if (topbarAvatar) {
    if (sessionUser) {
      const initial = (sessionUser.user_metadata?.full_name || sessionUser.email || 'U').charAt(0).toUpperCase();
      if (sessionUser.user_metadata?.avatar_url) {
        topbarAvatar.innerHTML = `<img src="${sessionUser.user_metadata.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        topbarAvatar.textContent = initial;
      }
    } else {
      topbarAvatar.textContent = '?';
    }
    topbarAvatar.style.cursor = 'pointer';
    topbarAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    const d = document.getElementById('profile-dropdown');
    if (d) d.remove();
  });

  // Add event listeners
  const signinBtn = document.getElementById('signin-btn');
  const signoutBtn = document.getElementById('signout-btn');
  
  if (signinBtn) {
    signinBtn.addEventListener('click', handleSignIn);
  }
  
  if (signoutBtn) {
    signoutBtn.addEventListener('click', handleSignOut);
  }
  
  // Add auth styles
  addAuthStyles();
}

async function toggleProfileDropdown() {
  const existing = document.getElementById('profile-dropdown');
  if (existing) { existing.remove(); return; }

  const avatar = document.getElementById('topbar-avatar');
  const rect = avatar.getBoundingClientRect();

  const dropdown = document.createElement('div');
  dropdown.id = 'profile-dropdown';
  dropdown.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 8}px;
    right: ${window.innerWidth - rect.right}px;
    background: rgba(15,10,35,0.97);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 16px;
    min-width: 220px;
    z-index: 99999;
    backdrop-filter: blur(20px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    font-family: 'DM Sans', sans-serif;
  `;

  // Read directly from chrome.storage — authoritative source of truth
  const stored = await chrome.storage.local.get(['supabase_session']);
  const sessionUser = stored.supabase_session?.user || currentUser;

  if (sessionUser) {
    const name = sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User';
    const email = sessionUser.email || '';
    const initial = name.charAt(0).toUpperCase();
    const avatarHtml = sessionUser.user_metadata?.avatar_url
      ? `<img src="${sessionUser.user_metadata.avatar_url}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(167,139,250,0.5);">`
      : `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#EC4899);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;border:2px solid rgba(167,139,250,0.5);">${initial}</div>`;

    dropdown.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        ${avatarHtml}
        <div style="overflow:hidden;">
          <div style="color:white;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${email}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:8px;margin-bottom:12px;">
        <div style="width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0;"></div>
        <span style="color:#6EE7B7;font-size:12px;font-weight:500;">Authenticated · Cloud sync active</span>
      </div>
      <button id="profile-signout-btn" style="width:100%;padding:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#FCA5A5;font-size:13px;cursor:pointer;transition:background 0.2s;">
        Sign Out
      </button>
    `;
  } else {
    dropdown.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:8px;margin-bottom:12px;">
        <div style="width:7px;height:7px;border-radius:50%;background:#F59E0B;flex-shrink:0;"></div>
        <span style="color:#FCD34D;font-size:12px;font-weight:500;">Not signed in · Local only</span>
      </div>
      <button id="profile-signin-btn" style="width:100%;padding:8px;background:linear-gradient(135deg,#7C3AED,#EC4899);border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;font-weight:600;">
        Sign In with Google
      </button>
    `;
  }

  document.body.appendChild(dropdown);

  const signoutBtn = document.getElementById('profile-signout-btn');
  if (signoutBtn) signoutBtn.addEventListener('click', handleSignOut);

  const signinBtn = document.getElementById('profile-signin-btn');
  if (signinBtn) signinBtn.addEventListener('click', handleSignIn);
}

function updateAuthUI() {
  const authStatus = document.getElementById('auth-status');
  const syncStatus = document.querySelector('.sync-status');
  
  if (authStatus) {
    authStatus.innerHTML = currentUser ? 
      `<div class="user-profile">
        ${currentUser.user_metadata?.avatar_url 
          ? `<img src="${currentUser.user_metadata.avatar_url}" class="user-avatar" style="object-fit:cover;">` 
          : `<div class="user-avatar">${(currentUser.user_metadata?.full_name || currentUser.email || 'U').charAt(0).toUpperCase()}</div>`
        }
        <div class="user-info">
          <div class="user-name">${currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User'}</div>
          <div class="user-email">${currentUser.email}</div>
        </div>
        <button id="signout-btn" class="signout-btn" title="Sign out">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      </div>` :
      `<button id="signin-btn" class="signin-btn">
        <i class="fa-solid fa-google"></i>
        <span>Sign in with Google</span>
      </button>`;
    
    // Re-attach event listeners
    const signinBtn = document.getElementById('signin-btn');
    const signoutBtn = document.getElementById('signout-btn');
    
    if (signinBtn) {
      signinBtn.addEventListener('click', handleSignIn);
    }
    
    if (signoutBtn) {
      signoutBtn.addEventListener('click', handleSignOut);
    }
  }
  
  if (syncStatus) {
    syncStatus.innerHTML = `
      <i class="fa-solid fa-${isCloudSyncEnabled ? 'cloud' : 'wifi-off'}"></i>
      <span>${isCloudSyncEnabled ? 'Cloud sync active' : 'Local storage only'}</span>
    `;
  }
}

async function handleSignIn() {
  // Remove profile dropdown if open
  const d = document.getElementById('profile-dropdown');
  if (d) d.remove();
  // Show the full-screen login overlay (handles polling + auto-connect)
  showLoginRequiredOverlay();
}

function showLoginRequiredOverlay() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

async function handleSignOut() {
  try {
    if (supabase && currentUser) {
      await supabase.auth.signOut();
    }
    // Clear stored session only — keep localStorage data intact
    await chrome.storage.local.remove('supabase_session');
    window.location.reload();
  } catch (error) {
    console.error('Sign out error:', error);
    toast('Failed to sign out');
  }
}

function addAuthStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .sb-auth-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .auth-status {
      margin-bottom: 12px;
    }
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #A78BFA, #EC4899);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }
    
    .user-info {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      color: white;
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-email {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .signout-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .signout-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    
    .signin-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }
    
    .signin-btn:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-1px);
    }
    
    .sync-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }
    
    .sync-status i {
      color: ${isCloudSyncEnabled ? '#34D399' : '#f87171'};
    }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════
   GOAL MODAL
══════════════════════════════════════ */
function openGoalModal(goal = null) {
  const modal = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title-text');
  const modalContent = document.getElementById('modal-content');
  
  modalTitle.textContent = goal ? 'Edit Goal' : 'Create New Goal';
  // Hide note-specific fields
  document.getElementById('modal-title').style.display = 'none';
  document.querySelector('.modal-type-row').style.display = 'none';
  document.getElementById('modal-color-row').style.display = 'none';
  document.getElementById('modal-checklist-area').style.display = 'none';
  document.querySelector('.modal-tag-row').style.display = 'none';
  document.querySelector('.modal-priority-row').style.display = 'none';
  document.querySelector('.modal-status-row').style.display = 'none';
  // Hide the textarea, use a div container for the goal form instead
  modalContent.style.display = 'none';
  let gfc = document.getElementById('goal-form-container');
  if (!gfc) {
    gfc = document.createElement('div');
    gfc.id = 'goal-form-container';
    modalContent.parentNode.insertBefore(gfc, modalContent);
  }
  gfc.style.display = 'block';
  gfc.innerHTML = `
    <div class="goal-form">
      <div class="form-group">
        <label>Goal Title *</label>
        <input type="text" id="goal-title" placeholder="Enter your goal..." value="${goal ? esc(goal.title) : ''}" required>
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea id="goal-description" placeholder="Describe your goal..." rows="3">${goal ? esc(goal.description) : ''}</textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <select id="goal-category">
            <option value="personal" ${goal && goal.category === 'personal' ? 'selected' : ''}>👤 Personal</option>
            <option value="professional" ${goal && goal.category === 'professional' ? 'selected' : ''}>💼 Professional</option>
            <option value="health" ${goal && goal.category === 'health' ? 'selected' : ''}>❤️ Health</option>
            <option value="learning" ${goal && goal.category === 'learning' ? 'selected' : ''}>📚 Learning</option>
            <option value="financial" ${goal && goal.category === 'financial' ? 'selected' : ''}>💰 Financial</option>
            <option value="other" ${goal && goal.category === 'other' ? 'selected' : ''}>📌 Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Type</label>
          <select id="goal-type">
            <option value="daily" ${goal && goal.type === 'daily' ? 'selected' : ''}>Daily</option>
            <option value="weekly" ${goal && goal.type === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="monthly" ${goal && goal.type === 'monthly' ? 'selected' : ''}>Monthly</option>
            <option value="long-term" ${goal && goal.type === 'long-term' ? 'selected' : ''}>Long-term</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Priority</label>
          <select id="goal-priority">
            <option value="low" ${goal && goal.priority === 'low' ? 'selected' : ''}>🔵 Low</option>
            <option value="medium" ${goal && goal.priority === 'medium' ? 'selected' : ''}>🟣 Medium</option>
            <option value="high" ${goal && goal.priority === 'high' ? 'selected' : ''}>🔴 High</option>
            <option value="urgent" ${goal && goal.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Target Date</label>
          <input type="date" id="goal-target-date" value="${goal ? goal.target_date : ''}">
        </div>
      </div>
      
      ${goal ? `
        <div class="form-group">
          <label>Status</label>
          <select id="goal-status">
            <option value="active" ${goal.status === 'active' ? 'selected' : ''}>🟢 Active</option>
            <option value="paused" ${goal.status === 'paused' ? 'selected' : ''}>🟡 Paused</option>
            <option value="completed" ${goal.status === 'completed' ? 'selected' : ''}>✅ Completed</option>
            <option value="cancelled" ${goal.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
          </select>
        </div>
      ` : ''}
    </div>
  `;
  
  // Update modal submit button
  const submitBtn = document.getElementById('modal-submit-btn');
  submitBtn.textContent = goal ? 'Update Goal' : 'Create Goal';
  submitBtn.onclick = () => submitGoal(goal ? goal.id : null);
  
  modal.classList.remove('hidden');
}

function closeGoalModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  // Restore note fields for next note modal open
  document.getElementById('modal-title').style.display = '';
  document.querySelector('.modal-type-row').style.display = '';
  document.getElementById('modal-color-row').style.display = '';
  document.querySelector('.modal-tag-row').style.display = '';
  document.querySelector('.modal-priority-row').style.display = '';
  document.querySelector('.modal-status-row').style.display = '';
  // Restore textarea, hide goal container
  document.getElementById('modal-content').style.display = '';
  const gfc = document.getElementById('goal-form-container');
  if (gfc) gfc.style.display = 'none';
}

function submitGoal(goalId = null) {
  const title = document.getElementById('goal-title').value.trim();
  const description = document.getElementById('goal-description').value.trim();
  const category = document.getElementById('goal-category').value;
  const type = document.getElementById('goal-type').value;
  const priority = document.getElementById('goal-priority').value;
  const targetDate = document.getElementById('goal-target-date').value;
  
  if (!title) {
    toast('⚠️ Please enter a goal title');
    return;
  }
  
  const goalData = {
    title,
    description,
    category,
    type,
    priority,
    target_date: targetDate
  };
  
  if (goalId) {
    // Update existing goal
    const status = document.getElementById('goal-status').value;
    goalData.status = status;
    updateGoal(goalId, goalData);
  } else {
    // Create new goal
    createGoal(goalData);
  }
  
  closeGoalModal();
}

function editGoal(goalId) {
  const goal = S.goals.find(g => g.id === goalId);
  if (goal) {
    openGoalModal(goal);
  }
}

function filterGoals() {
  const categoryFilter = document.getElementById('goal-category-filter').value;
  const statusFilter = document.getElementById('goal-status-filter').value;
  
  let filteredGoals = S.goals;
  
  if (categoryFilter !== 'all') {
    filteredGoals = filteredGoals.filter(g => g.category === categoryFilter);
  }
  
  if (statusFilter !== 'all') {
    filteredGoals = filteredGoals.filter(g => g.status === statusFilter);
  }
  
  const goalsContainer = document.getElementById('goals-container');
  if (!filteredGoals.length) {
    goalsContainer.innerHTML = '<div class="empty-goals"><h3>No goals found</h3><p>Try adjusting your filters or create a new goal!</p></div>';
    return;
  }
  
  goalsContainer.innerHTML = filteredGoals.map(goal => buildGoalCard(goal)).join('');
}

function updateGoalStats() {
  const activeGoals = S.goals.filter(g => g.status === 'active').length;
  const completedGoals = S.goals.filter(g => g.status === 'completed').length;
  
  const activeCountEl = document.getElementById('active-goals-count');
  const completedCountEl = document.getElementById('completed-goals-count');
  const goalBadgeEl = document.getElementById('goal-badge');
  
  if (activeCountEl) activeCountEl.textContent = activeGoals;
  if (completedCountEl) completedCountEl.textContent = completedGoals;
  if (goalBadgeEl) goalBadgeEl.textContent = activeGoals;
}

/* ══════════════════════════════════════
   RENDER ALL
══════════════════════════════════════ */
function renderAll() {
  renderNotes();
  renderLinksGrid(document.getElementById('links-grid'), S.links, true);
  renderGoals();
  renderFavorites();
  renderArchive();
  renderReadingList();
  renderVisionBoard();
  renderNotifications();
  renderProductivity();
  updateLinkBadge();
  updateFavBadge();
  updateReadingBadge();
  updateGoalStats();
  
  // Render new components
  renderStatusSections();
  updateWorkStats();
  
  // Re-render the currently active view so changes show immediately
  if (S.view === 'links') renderFullLinks();
  if (S.view === 'pinned') renderPinned();
}

/* ══════════════════════════════════════
   RENDER NOTES
══════════════════════════════════════ */
function renderNotes() {
  console.log('🔍 renderNotes called');
  console.log('🔍 Current filter:', S.filter);
  console.log('🔍 Total notes:', S.notes.length);
  
  const masonry = document.getElementById('notes-masonry');
  masonry.innerHTML = '';
  const active = S.notes.filter(n => !n.archived);
  console.log('🔍 Active (non-archived) notes:', active.length);
  
  let filtered = S.filter === 'all'
    ? active
    : active.filter(n => n.tag === S.filter);
  
  console.log('🔍 Filtered notes count:', filtered.length);
  console.log('🔍 Filtered notes:', filtered.map(n => ({ id: n.id, tag: n.tag, title: n.title })));
  
  // Apply sorting
  if (S.sortBy && S.sortBy !== 'newest') {
    filtered = [...filtered].sort((a, b) => {
      switch (S.sortBy) {
        case 'oldest':
          return a.created - b.created;
        case 'updated':
          return (b.updated || b.created) - (a.updated || a.created);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
          return priorityOrder[b.priority || 'none'] - priorityOrder[a.priority || 'none'];
        case 'alphabetical':
          return (a.title || a.content || '').localeCompare(b.title || b.content || '');
        default:
          return b.created - a.created;
      }
    });
  } else {
    // Default: newest first
    filtered.sort((a, b) => b.created - a.created);
  }
  
  if (!filtered.length) {
    masonry.innerHTML = '<div class="empty-msg" style="column-span:all"><strong>No notes here yet</strong>Click + to add your first note</div>';
    return;
  }
  filtered.forEach((note, i) => {
    const el = buildNoteEl(note, i);
    masonry.appendChild(el);
  });
}

function renderNoteCard(note, idx = 0) {
  return buildNoteEl(note, idx).outerHTML;
}

function buildNoteEl(note, idx) {
  const wrap = document.createElement('div');
  wrap.className = `note-card note-${note.color}`;
  wrap.dataset.nid = note.id;
  const delay = Math.min(idx * 0.04, 0.4);
  wrap.style.animationDelay = delay + 's';

  let pinHTML = '';
  if (note.pin && PIN_COLORS[note.pin]) {
    pinHTML = `<div class="pushpin pin-${note.pin}"><div class="pin-head"></div><div class="pin-stem"></div></div>`;
  }
  let tapeHTML = '';
  if (note.hasTape) {
    tapeHTML = `<div class="washi-tape ${note.tapeColor || 'tape-yellow'}"></div>`;
  }
  const doodle = note.doodle ? `<div class="note-doodle">${note.doodle}</div>` : '';
  const innerContent = buildNoteInner(note);
  const STATUS_MAP = {
    'completed':   { label: '✅ Completed',            cls: 'status-completed'   },
    'in-progress': { label: '🔄 In Progress',          cls: 'status-in-progress' },
    'delayed':     { label: '⏳ Delayed',               cls: 'status-delayed'     },
    'waiting':     { label: '🕐 Waiting for Approval', cls: 'status-waiting'     },
    'cancelled':   { label: '❌ Cancelled',             cls: 'status-cancelled'   },
  };
  const statusBadge = (note.status && note.status !== 'none' && STATUS_MAP[note.status])
    ? `<span class="note-status ${STATUS_MAP[note.status].cls}">${STATUS_MAP[note.status].label}</span>`
    : '';
  const fullDt = note.created ? fmtFullDate(note.created) : '';
  const timestamp = note.created ? fmtTime(note.created) : '';
  const starClass = note.starred ? 'starred' : '';
  const pinClass  = note.pinned  ? 'pinned-act' : '';

  wrap.innerHTML = `
    ${pinHTML}
    ${tapeHTML}
    <div class="note-inner" data-canvas-id="${note.id}">
      ${buildStylePrefix(note)}
      ${statusBadge}
      ${innerContent}
      ${doodle}
      <div class="note-footer">
        <span class="note-datetime" title="${fullDt}">📅 ${fullDt}</span>
        ${note.priority && note.priority !== 'none' ? `<span class="priority-badge priority-${note.priority}">${{low:'🟢 Low',medium:'🟡 Med',high:'🔴 High',urgent:'🚨 Urgent'}[note.priority]||''}</span>` : ''}
        <div class="note-actions-row">
          <button class="note-action ${starClass}" data-action="star" data-id="${note.id}" title="Star">☆</button>
          <button class="note-action ${pinClass}" data-action="pin" data-id="${note.id}" title="Pin">📌</button>
          <button class="note-action" data-action="status" data-id="${note.id}" title="Change status">🏷</button>
          <button class="note-action" data-action="archive" data-id="${note.id}" title="Archive">📦</button>
          <button class="note-action" data-action="del" data-id="${note.id}" title="Delete">×</button>
        </div>
      </div>
    </div>`;

  // Checkbox events (event delegation on masonry)
  return wrap;
}

function buildStylePrefix(note) {
  if (note.style === 'notebook') {
    const rings = Array(10).fill('<div class="spiral-ring"></div>').join('');
    return `<div class="spiral-binding">${rings}</div>`;
  }
  return '';
}

function buildNoteInner(note) {
  let html = '';
  if (note.title) {
    html += `<div class="note-title">${esc(note.title)}</div>`;
  }
  if (note.type === 'checklist') {
    html += '<div class="check-list">';
    (note.items || []).forEach((item, i) => {
      const done = item.done ? 'done' : '';
      html += `<div class="check-item ${done}">
        <input type="checkbox" ${item.done ? 'checked' : ''} data-noteid="${note.id}" data-idx="${i}">
        <label>${esc(item.text)}</label>
      </div>`;
    });
    html += '</div>';
  } else if (note.type === 'bullet') {
    html += '<div class="bullet-list">';
    (note.items || []).forEach(item => {
      html += `<div class="bullet-item">${esc(item)}</div>`;
    });
    html += '</div>';
  } else if (note.type === 'quote') {
    html += `<div class="quote-marks">"</div>
      <div class="quote-content">${esc(note.content || '')}</div>
      <div class="quote-author-tag">— ${esc(note.author || '')}</div>`;
  } else if (note.type === 'photo') {
    html += `<div class="polaroid-img"><div class="pol-emoji">${note.polEmoji || '📸'}</div></div>
      <div class="polaroid-caption">${esc(note.content || '')}</div>`;
  } else {
    html += `<div class="note-text">${esc(note.content || '').replace(/\n/g, '<br>')}</div>`;
  }
  return html;
}

/* ══════════════════════════════════════
   EVENT DELEGATION (notes grid)
══════════════════════════════════════ */
document.addEventListener('click', e => {
  // Open note canvas when clicking note body
  const noteInner = e.target.closest('.note-inner[data-canvas-id]');
  if (noteInner) {
    const skip = e.target.closest('.note-actions-row')
               || e.target.closest('.check-item')
               || e.target.tagName === 'INPUT'
               || e.target.tagName === 'LABEL';
    if (!skip) { openNoteCanvas(noteInner.dataset.canvasId); return; }
  }
  // Note actions
  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    const id = actionBtn.dataset.id;
    console.log('🔍 Note action clicked:', action, 'for note:', id);
    if (action === 'star') toggleStar(id);
    else if (action === 'pin') togglePin(id);
    else if (action === 'status') cycleStatus(id);
    else if (action === 'archive') toggleArchive(id);
    else if (action === 'del') deleteNote(id);
    console.log('🔍 Note action handler completed');
    return;
  }
  // Checkbox
  if (e.target.matches('input[type="checkbox"][data-noteid]')) {
    const nid = e.target.dataset.noteid;
    const idx = parseInt(e.target.dataset.idx);
    toggleCheck(nid, idx);
  }
  // Link card actions
  const lAction = e.target.closest('[data-laction]');
  if (lAction) {
    const action = lAction.dataset.laction;
    const id = lAction.dataset.lid;
    handleLinkAction(action, id);
    return;
  }
  // Add goal button
  if (e.target.closest('#add-goal-btn')) {
    openGoalModal();
    return;
  }
  // Nav
  const navItem = e.target.closest('.nav-item[data-view]');
  if (navItem) {
    showView(navItem.dataset.view);
  }
  // Filter tab
  const filterTab = e.target.closest('.filter-tab[data-filter]');
  if (filterTab) {
    setFilter(filterTab.dataset.filter);
  }
});

/* ══════════════════════════════════════
   NOTE CRUD
══════════════════════════════════════ */
function cycleStatus(id) {
  const CYCLE = ['none','in-progress','completed','delayed','waiting','cancelled'];
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  const idx = CYCLE.indexOf(note.status || 'none');
  note.status = CYCLE[(idx + 1) % CYCLE.length];
  save(); renderAll();
  const labels = { 'none':'Status cleared','in-progress':'🔄 In Progress','completed':'✅ Completed','delayed':'⏳ Delayed','waiting':'🕐 Waiting for Approval','cancelled':'❌ Cancelled' };
  toast(labels[note.status] || 'Status updated');
}
function toggleArchive(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  note.archived = !note.archived;
  logActivity('note_archived', `${note.archived ? 'Archived' : 'Unarchived'}: "${note.title || 'Note'}"`);
  save(); renderAll();
  toast(note.archived ? 'Note archived 📦' : 'Note unarchived');
}
function toggleStar(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  note.starred = !note.starred;
  logActivity('note_starred', `${note.starred ? 'Starred' : 'Unstarred'}: "${note.title || 'Note'}"`);
  save(); renderAll();
}
function togglePin(id) {
  console.log('🔍 togglePin called with id:', id);
  const note = S.notes.find(n => n.id === id);
  if (!note) {
    console.error('🔍 Note not found with id:', id);
    return;
  }
  console.log('🔍 Note before toggle - pinned:', note.pinned);
  note.pinned = !note.pinned;
  console.log('🔍 Note after toggle - pinned:', note.pinned);
  save(); 
  renderAll();
  toast(note.pinned ? 'Pinned 📌' : 'Unpinned');
  console.log('🔍 Pin toggle completed, renderAll called');
}
function deleteNote(id) {
  const note = S.notes.find(n => n.id === id);
  logActivity('note_deleted', `Deleted note: "${note?.title || 'Note'}"`);
  S.notes = S.notes.filter(n => n.id !== id);
  save(); renderAll();
  toast('Note deleted');
}
function toggleCheck(nid, idx) {
  const note = S.notes.find(n => n.id === nid);
  if (!note || !note.items) return;
  note.items[idx].done = !note.items[idx].done;
  save();
  // Update just this item visually
  const row = document.querySelector(`[data-noteid="${nid}"][data-idx="${idx}"]`)?.closest('.check-item');
  if (row) row.classList.toggle('done', note.items[idx].done);
}
function addNote(data) {
  console.log('🔍 addNote called with data:', data);
  console.log('🔍 Current notes count before:', S.notes.length);
  
  S.idc++;
  const note = {
    id: generateUUID(),
    type: data.type || 'note',
    style: 'regular',
    title: data.title || null,
    color: data.color || 'purple',
    pin: PINS_FOR_COLOR[data.color] || 'purple',
    hasTape: false,
    content: data.content || null,
    items: data.items || null,
    author: data.author || null,
    tag: data.tag || 'note',
    status: data.status || 'none',
    priority: data.priority || 'none',
    pinned: false,
    starred: false,
    archived: false,
    created: Date.now(),
    doodle: null,
  };
  
  console.log('🔍 Created note object:', note);
  S.notes.unshift(note);
  console.log('🔍 Notes count after adding:', S.notes.length);
  
  logActivity('note_created', `Created note: "${note.title || note.content?.slice(0,30) || 'Untitled'}"`);
  save(); 
  renderAll();
  toast('Note added ✨');
  
  console.log('🔍 Note creation completed');
}

/* ══════════════════════════════════════
   NAV & VIEWS
══════════════════════════════════════ */
function setupNav() {
  // handled via event delegation
}

/* ══════════════════════════════════════
   DAILY FOCUS
══════════════════════════════════════ */
function setupDailyFocus() {
  const focusText = document.getElementById('daily-focus-text');
  const editBtn = document.getElementById('focus-edit-btn');
  
  // Load saved focus
  const savedFocus = localStorage.getItem('sv_daily_focus');
  if (savedFocus) {
    focusText.textContent = savedFocus;
  }
  
  editBtn.addEventListener('click', () => {
    const newFocus = prompt('What is your main focus today?', focusText.textContent);
    if (newFocus && newFocus.trim()) {
      focusText.textContent = newFocus.trim();
      localStorage.setItem('sv_daily_focus', newFocus.trim());
      toast('Daily focus updated 🎯');
    }
  });
}

/* ══════════════════════════════════════
   STATUS SECTIONS
══════════════════════════════════════ */
function renderStatusSections() {
  const statusSections = document.getElementById('status-sections');
  if (!statusSections) return;
  
  // Group notes by status
  const statusGroups = {
    'in-progress': [],
    'none': [],
    'completed': [],
    'delayed': []
  };
  
  S.notes.forEach(note => {
    const status = note.status || 'none';
    if (statusGroups[status]) {
      statusGroups[status].push(note);
    }
  });
  
  // Render each status section
  Object.keys(statusGroups).forEach(status => {
    const container = document.getElementById(`status-notes-${status}`);
    const count = document.getElementById(`status-count-${status}`);
    
    if (container && count) {
      count.textContent = statusGroups[status].length;
      container.innerHTML = statusGroups[status].map(note => renderNoteCard(note)).join('');
    }
  });
}

/* ══════════════════════════════════════
   WORK STATS
══════════════════════════════════════ */
function updateWorkStats() {
  const today = new Date().toDateString();
  const todayNotes = S.notes.filter(note => 
    new Date(note.created).toDateString() === today
  );
  const completedTasks = todayNotes.filter(note => 
    note.status === 'completed' || (note.items && note.items.some(item => item.done))
  );
  const todayLinks = S.links.filter(link => 
    new Date(link.savedAt || Date.now()).toDateString() === today
  );
  
  // Update stats
  document.getElementById('notes-created-today').textContent = todayNotes.length;
  document.getElementById('tasks-completed').textContent = completedTasks.length;
  document.getElementById('links-saved').textContent = todayLinks.length;
  
  // Update focus time (placeholder for now)
  const focusHours = Math.floor(Math.random() * 6) + 1; // Mock data
  document.getElementById('focus-time').textContent = `${focusHours}h`;
}

/* ══════════════════════════════════════
   TEMPLATES
══════════════════════════════════════ */
function setupTemplates() {
  const templateCards = document.querySelectorAll('.template-card');
  
  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      const templateType = card.dataset.template;
      createFromTemplate(templateType);
    });
  });
}

function createFromTemplate(type) {
  const templates = {
    meeting: {
      title: 'Meeting Notes',
      type: 'checklist',
      items: [
        { text: 'Attendees & Time', done: false },
        { text: 'Agenda Items', done: false },
        { text: 'Key Decisions', done: false },
        { text: 'Action Items', done: false },
        { text: 'Follow-up Tasks', done: false }
      ]
    },
    project: {
      title: 'Project Plan',
      type: 'checklist',
      items: [
        { text: 'Define Objectives', done: false },
        { text: 'Research & Planning', done: false },
        { text: 'Create Timeline', done: false },
        { text: 'Assign Tasks', done: false },
        { text: 'Set Milestones', done: false }
      ]
    },
    daily: {
      title: 'Daily Review',
      type: 'checklist',
      items: [
        { text: 'What went well today?', done: false },
        { text: 'What could be improved?', done: false },
        { text: 'Top priorities for tomorrow', done: false },
        { text: 'Lessons learned', done: false }
      ]
    },
    habit: {
      title: 'Habit Tracker',
      type: 'checklist',
      items: [
        { text: 'Morning Routine', done: false },
        { text: 'Exercise', done: false },
        { text: 'Reading', done: false },
        { text: 'Meditation', done: false },
        { text: 'Healthy Meals', done: false }
      ]
    },
    learning: {
      title: 'Learning Log',
      content: 'What I learned today:\n\nKey concepts:\n- \n- \n- \n\nQuestions to explore:\n- \n- \n- '
    },
    gratitude: {
      title: 'Gratitude Journal',
      content: 'Today I am grateful for:\n\n1. \n2. \n3. \n\nSmall wins today:\n- \n- '
    }
  };
  
  const template = templates[type];
  if (template) {
    addNote(template);
    save();
    renderAll();
    toast(`Created from ${type} template ✨`);
  }
}
function showView(v) {
  S.view = v;
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const viewEl = document.getElementById('view-' + v);
  if (viewEl) viewEl.classList.add('active');
  const isHome = v === 'home';
  const searchBar = document.getElementById('search-bar');
  if (searchBar) searchBar.style.display = isHome ? '' : 'none';
  const filterBar = document.getElementById('filter-bar');
  if (filterBar) filterBar.style.display = isHome ? '' : 'none';
  if (v === 'pinned') renderPinned();
  if (v === 'links') renderFullLinks();
  if (v === 'goals') renderGoals();
  if (v === 'themes') buildThemesGrid();
  if (v === 'settings') {
    const totalNotesDesc = document.getElementById('total-notes-desc');
    if (totalNotesDesc) totalNotesDesc.textContent = `${S.notes.length} notes saved`;
  }
}

/* ══════════════════════════════════════
   FILTER
══════════════════════════════════════ */
function setupFilterTabs() {
  // Filter tabs functionality
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;
      console.log('🔍 Filter tab clicked:', filter);
      setFilter(filter);
    });
  });
  
  // Sort functionality
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      S.sortBy = e.target.value;
      renderNotes();
    });
  }
}
function setFilter(f) {
  console.log('🔍 setFilter called with:', f);
  console.log('🔍 Previous filter:', S.filter);
  S.filter = f;
  console.log('🔍 New filter set to:', S.filter);
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  console.log('🔍 Filter tabs updated, calling renderNotes');
  renderNotes();
  console.log('🔍 renderNotes completed');
}

/* ══════════════════════════════════════
   CMD BAR
══════════════════════════════════════ */
function setupCmdBar() {
  // Setup search bar functionality
  document.getElementById('search-add-btn').addEventListener('click', () => {
    openModal('note');
  });
  
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger search
      const searchQuery = e.target.value.trim();
      if (searchQuery) {
        openSearch();
        document.getElementById('search-input').value = searchQuery;
        doSearch(searchQuery);
        e.target.value = '';
      }
    }
    if (e.key === 'k' && e.metaKey) {
      e.preventDefault();
      openModal('note');
    }
  });
  
  document.getElementById('save-tab-topbtn').addEventListener('click', saveCurrentTab);
}

function saveCurrentTab() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
        saveLink(tabs[0].url, tabs[0].title || '', tabs[0].favIconUrl || '');
      }
    });
  } else {
    toast('Open as Chrome Extension to save tabs');
  }
}

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
function setupModal() {
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.getElementById('modal-submit-btn').addEventListener('click', submitNote);
  document.getElementById('modal-status').addEventListener('change', e => { S.modalStatus = e.target.value; });

  // Type buttons
  document.querySelectorAll('.type-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      S.modalType = b.dataset.type;
      const isCL = S.modalType === 'checklist';
      document.getElementById('modal-content').style.display = isCL ? 'none' : 'block';
      document.getElementById('modal-checklist-area').classList.toggle('hidden', !isCL);
    });
  });

  // Tag buttons
  document.querySelectorAll('.tag-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tag-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      S.modalTag = b.dataset.tag;
    });
  });

  // Priority buttons
  document.querySelectorAll('.priority-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.priority-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      S.modalPriority = b.dataset.priority;
    });
  });

  // Color picker
  document.querySelectorAll('.color-swatch').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      S.modalColor = b.dataset.color;
    });
  });

  // Add checklist item
  document.getElementById('add-checklist-item-btn').addEventListener('click', addChecklistItemUI);

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if (e.key === 'n' && e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      openModal('note');
    }
    if (e.key === 'Escape') {
      closeModal();
      closeSearch();
      closeNoteCanvas();
    }
  });
}

function buildColorPicker() {
  const row = document.getElementById('modal-color-row');
  row.innerHTML = '';
  COLORS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'modal-color-dot' + (c.id === S.modalColor ? ' sel' : '');
    d.style.background = c.hex;
    d.dataset.color = c.id;
    d.title = c.label;
    d.addEventListener('click', () => {
      document.querySelectorAll('.modal-color-dot').forEach(x => x.classList.remove('sel'));
      d.classList.add('sel');
      S.modalColor = c.id;
    });
    row.appendChild(d);
  });
}

function openModal(type) {
  S.modalType = type || 'note';
  S.modalColor = 'purple'; // Initialize default color
  S.checklistItems = [];
  // Restore all note fields in case goal modal hid them
  document.getElementById('modal-title').style.display = '';
  document.querySelector('.modal-type-row').style.display = '';
  document.getElementById('modal-color-row').style.display = '';
  document.querySelector('.modal-tag-row').style.display = '';
  document.querySelector('.modal-priority-row').style.display = '';
  document.querySelector('.modal-status-row').style.display = '';
  document.getElementById('modal-title-text').textContent = 'New Note';
  const gfc = document.getElementById('goal-form-container');
  if (gfc) gfc.style.display = 'none';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-title').value = '';
  document.getElementById('modal-content').value = '';
  document.getElementById('modal-content').style.display = 'block';
  document.getElementById('modal-checklist-area').classList.add('hidden');
  document.getElementById('checklist-items').innerHTML = '';
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === 'note'));
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.toggle('active', b.dataset.color === 'purple'));
  S.modalTag = 'note'; S.modalStatus = 'none'; S.modalPriority = 'none';
  document.getElementById('modal-status').value = 'none';
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.toggle('active', b.dataset.priority === 'none'));
  // Reset submit button back to note submit handler
  document.getElementById('modal-submit-btn').onclick = null;
  document.getElementById('modal-submit-btn').textContent = 'Create Note';
  setTimeout(() => document.getElementById('modal-title').focus(), 100);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
function submitNote() {
  console.log('🔍 submitNote called');
  console.log('🔍 Modal state:', {
    modalType: S.modalType,
    modalColor: S.modalColor,
    modalTag: S.modalTag,
    modalStatus: S.modalStatus,
    modalPriority: S.modalPriority
  });
  
  const title   = document.getElementById('modal-title').value.trim();
  const content = document.getElementById('modal-content').value.trim();
  
  console.log('🔍 Form values:', { title, content });
  
  const data = {
    type: S.modalType,
    color: S.modalColor,
    tag: S.modalTag,
    status: S.modalStatus,
    priority: S.modalPriority,
    title: title || null,
  };
  
  console.log('🔍 Data prepared:', data);
  
  if (S.modalType === 'checklist') {
    const inputs = document.querySelectorAll('#checklist-items .ci-row input[type="text"]');
    data.items = Array.from(inputs).map(i => ({ text: i.value.trim(), done: false })).filter(i => i.text);
    if (!data.items.length && !title) {
      console.log('🔍 Checklist validation failed - no items or title');
      return;
    }
  } else if (S.modalType === 'quote') {
    const parts = content.split('\n');
    data.content = parts[0] || '';
    data.author  = parts[1]?.replace(/^[-–—]\s*/, '') || '';
  } else {
    data.content = content;
    if (!content && !title) {
      console.log('🔍 Note validation failed - no content or title');
      return;
    }
  }
  
  console.log('🔍 Calling addNote with final data:', data);
  addNote(data);
  closeModal();
}

function addChecklistItemUI() {
  const row = document.createElement('div');
  row.className = 'ci-row';
  row.innerHTML = `<input type="text" placeholder="Add item..."><button class="ci-remove">×</button>`;
  row.querySelector('.ci-remove').addEventListener('click', () => row.remove());
  row.querySelector('input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addChecklistItemUI(); }
  });
  document.getElementById('checklist-items').appendChild(row);
  row.querySelector('input').focus();
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function setupSearch() {
  document.getElementById('bar-search-btn').addEventListener('click', openSearch);
  document.getElementById('search-close-btn').addEventListener('click', closeSearch);
  document.getElementById('search-input').addEventListener('input', e => doSearch(e.target.value));
}
function openSearch() {
  document.getElementById('search-overlay').classList.remove('hidden');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').focus();
}
function closeSearch() {
  document.getElementById('search-overlay').classList.add('hidden');
}
function doSearch(q) {
  const t = q.toLowerCase().trim();
  const res = document.getElementById('search-results');
  if (!t) { res.innerHTML = ''; return; }
  const matches = S.notes.filter(n => {
    const blob = [(n.title||''), (n.content||''), ...(Array.isArray(n.items) ? n.items.map(i => typeof i === 'string' ? i : i.text) : [])].join(' ').toLowerCase();
    return blob.includes(t);
  });
  if (!matches.length) {
    res.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:20px;font-size:13px">No results found</div>';
    return;
  }
  res.innerHTML = matches.slice(0, 8).map(n => {
    const preview = n.content || (n.items ? (Array.isArray(n.items) ? n.items.slice(0,2).map(i => typeof i === 'string' ? i : i.text).join(', ') : '') : '');
    return `<div class="search-result"><div class="sr-title">${n.emoji||''}${n.title||'Note'}</div><div class="sr-preview">${preview.slice(0,80)}</div></div>`;
  }).join('');
}

/* ══════════════════════════════════════
   LINKS
══════════════════════════════════════ */
function setupLinks() {
  document.getElementById('link-add-btn').addEventListener('click', () => {
    const v = document.getElementById('link-url-input').value.trim();
    if (v) { saveLink(v, '', ''); document.getElementById('link-url-input').value = ''; }
  });
  document.getElementById('link-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = e.target.value.trim();
      if (v) { saveLink(v, '', ''); e.target.value = ''; }
    }
  });
  
  // Event delegation for link thumbnail images
  document.addEventListener('error', (e) => {
    if (e.target.classList.contains('lc-favicon') || e.target.classList.contains('lc-thumb-screenshot')) {
      e.target.style.display = 'none';
    }
  }, true);
  
  document.addEventListener('load', (e) => {
    if (e.target.classList.contains('lc-thumb-screenshot')) {
      e.target.style.opacity = '1';
    }
  }, true);
}
function saveLink(url, title, favicon) {
  if (!url.startsWith('http')) url = 'https://' + url;
  try { new URL(url); } catch { toast('Invalid URL'); return; }
  const host = new URL(url).hostname;
  S.links.unshift({
    id: generateUUID(),
    url, title: title || host.replace('www.',''),
    host,
    favicon: favicon || `https://www.google.com/s2/favicons?sz=64&domain=${host}`,
    savedAt: Date.now()
  });
  saveLinks(); 
  // Only render links grid to avoid duplicate rendering
  renderLinksGrid(document.getElementById('links-grid'), S.links, true);
  updateLinkBadge();
  toast('Link saved 🔗');
}
function getLinkPreviewUrl(url) {
  // thum.io — completely free website thumbnail, no API key, no signup
  // Returns a real screenshot of the live website
  try {
    const encoded = encodeURIComponent(url);
    return `https://image.thum.io/get/width/600/crop/400/${encoded}`;
  } catch { return null; }
}
function buildLinkPreviewThumb(lk) {
  const emMap = { youtube:'🎥', instagram:'📸', linkedin:'💼', twitter:'🐦', x:'🐦', github:'⚡', notion:'📝', figma:'🎨', tiktok:'🎵', dribbble:'🎨', pinterest:'📌', spotify:'🎵', reddit:'💬', medium:'✍️', wikipedia:'📚' };
  const em = Object.entries(emMap).find(([k]) => lk.host.includes(k))?.[1] || '🌐';
  // Color palette for fallback gradient based on domain hash
  const gradients = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#fccb90,#d57eeb)',
    'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  ];
  let hash = 0;
  for (let c of lk.host) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const grad = gradients[Math.abs(hash) % gradients.length];
  const previewUrl = getLinkPreviewUrl(lk.url, lk.host);
  return `<div class="lc-thumb" style="position:relative;overflow:hidden">
    <div class="lc-thumb-fallback" style="position:absolute;inset:0;background:${grad};display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
      <img src="${lk.favicon}" class="lc-favicon" style="width:32px;height:32px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.3)" alt="">
      <span style="font-size:11px;color:rgba(255,255,255,0.75);font-weight:500">${esc(lk.host.replace('www.',''))}</span>
    </div>
    <img class="lc-thumb-screenshot"
      src="${previewUrl}"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.3s"
      alt=""
      loading="lazy">
    <span class="lc-site-em">${em}</span>
  </div>`;
}
function renderLinksGrid(container, links, compact) {
  if (!links.length) {
    container.innerHTML = '<div class="empty-msg"><strong>No links saved yet</strong>Paste a URL above or click Save Tab to start your vault</div>';
    return;
  }
  const slice = links.slice(0, compact ? 4 : 999);
  container.innerHTML = slice.map(lk => {
    const saved = compact
      ? fmtTime(lk.savedAt)
      : new Date(lk.savedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    const displayTitle = lk.title && lk.title !== lk.host.replace('www.','') ? lk.title : lk.host.replace('www.','');
    return `<div class="link-card">
      ${buildLinkPreviewThumb(lk)}
      <div class="lc-body">
        <div class="lc-header">
          <img class="lc-favicon" src="${lk.favicon}" onerror="this.style.display='none'" alt="">
          <span class="lc-host">${esc(lk.host.replace('www.',''))}</span>
        </div>
        <div class="lc-title">${esc(displayTitle)}</div>
        <div class="lc-url">${esc(lk.url.replace(/^https?:\/\//,'').slice(0,45))}${lk.url.length>52?'…':''}</div>
        <div class="lc-saved">Saved ${saved}</div>
        <div class="lc-actions">
          <button class="lc-btn" data-laction="open" data-lid="${lk.id}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</button>
          <button class="lc-btn" data-laction="copy" data-lid="${lk.id}"><i class="fa-regular fa-copy"></i> Copy</button>
          <button class="lc-btn danger" data-laction="del" data-lid="${lk.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderFullLinks() {
  renderLinksGrid(document.getElementById('links-full-grid'), S.links, false);
}
function handleLinkAction(action, id) {
  const lk = S.links.find(l => l.id === id);
  if (!lk) return;
  if (action === 'open') window.open(lk.url, '_blank');
  else if (action === 'copy') { navigator.clipboard?.writeText(lk.url); toast('Copied!'); }
  else if (action === 'del') {
    S.links = S.links.filter(l => l.id !== id);
    saveLinks(); renderAll();
    if (S.view === 'links') renderFullLinks();
    toast('Link deleted');
  }
}
function updateLinkBadge() {
  document.getElementById('link-badge').textContent = S.links.length;
}

/* ══════════════════════════════════════
   PINNED VIEW
══════════════════════════════════════ */
function renderPinned() {
  console.log('🔍 renderPinned called');
  console.log('🔍 Total notes:', S.notes.length);
  console.log('🔍 Notes with pinned=true:', S.notes.filter(n => n.pinned).length);
  
  const g = document.getElementById('pinned-grid');
  if (!g) {
    console.error('🔍 pinned-grid element not found');
    return;
  }
  
  const pinned = S.notes.filter(n => n.pinned);
  console.log('🔍 Pinned notes:', pinned);
  
  if (!pinned.length) {
    g.innerHTML = '<div class="empty-msg"><strong>No pinned notes</strong>Pin a note by clicking 📌 on it</div>';
    return;
  }
  g.innerHTML = pinned.map(n => {
    const preview = n.content || (n.items ? (Array.isArray(n.items) ? n.items.slice(0,2).map(i => typeof i === 'string' ? i : i.text).join(', ') : '') : '');
    return `<div class="pinned-card">
      <div class="pc-bar" style="background:${COLORS.find(c=>c.id===n.color)?.hex||'#A78BFA'}"></div>
      <div class="pc-title">${n.title||'Note'}</div>
      <div class="pc-text">${preview}</div>
      <div class="pc-time">${fmtTime(n.created)}</div>
    </div>`;
  }).join('');
  console.log('🔍 Pinned grid updated with', pinned.length, 'notes');
}

/* ══════════════════════════════════════
   THEMES
══════════════════════════════════════ */
function buildThemesGrid() {
  const g = document.getElementById('themes-grid');
  g.innerHTML = THEMES.map(t => `
    <div class="theme-card ${t.id === S.theme ? 'active' : ''}" data-tid="${t.id}">
      <div class="theme-preview" style="background:${t.bg}">${t.em}</div>
      <div class="theme-label">${t.label}</div>
    </div>`).join('');
  g.querySelectorAll('.theme-card').forEach(c => {
    c.addEventListener('click', () => applyTheme(c.dataset.tid));
  });
}
function applyTheme(id, save=true) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  S.theme = t.id;
  document.documentElement.dataset.theme = t.id;

  // Apply CSS custom properties to root
  const root = document.documentElement;
  root.style.setProperty('--theme-body',    t.body);
  root.style.setProperty('--theme-accent',  t.accent);
  root.style.setProperty('--theme-text',    t.text);
  root.style.setProperty('--theme-sidebar', t.sidebar);
  root.style.setProperty('--theme-card',    t.card);

  // Apply body background
  document.body.style.background = t.body;
  document.body.style.color = t.text;

  // Recolor blobs
  const blobs = document.querySelectorAll('.blob');
  const blobColors = [t.b1, t.b2, t.b3, t.b4];
  blobs.forEach((b, i) => { if (blobColors[i]) b.style.background = blobColors[i]; });

  // Minimal theme: light text adjustments
  if (t.id === 'minimal') {
    document.querySelectorAll('#sidebar, #right-panel, #topbar, #modal, #search-box').forEach(el => {
      if (el) el.style.color = t.text;
    });
  }

  document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.tid === t.id));
  if (save) { localStorage.setItem('sv_theme', t.id); toast('Theme applied ✨'); }
}

/* ══════════════════════════════════════
   SETTINGS
══════════════════════════════════════ */
function setupSettings() {
  document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
  document.getElementById('backup-btn').addEventListener('click', backupData);
  document.getElementById('restore-input').addEventListener('change', restoreData);
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Delete all notes and links? Cannot be undone.')) return;
    S.notes = []; S.links = []; S.goals = []; save(); renderAll();
    toast('Data cleared');
  });
  buildWallpaperPicker();
}
function exportCSV() {
  const STATUS_LABELS = {
    'none':'—', 'completed':'Completed', 'in-progress':'In Progress',
    'delayed':'Delayed', 'waiting':'Waiting for Approval', 'cancelled':'Cancelled',
  };
  const rows = [['ID','Title','Content','Type','Tag','Status','Pinned','Starred','Created Date','Created Time','Relative Time']];
  S.notes.forEach(n => {
    const content = n.content || (n.items ? (Array.isArray(n.items) ? n.items.map(i => typeof i==='string'?i:i.text+(i.done?' [done]':'')).join(' | ') : '') : '');
    const dt = n.created ? new Date(n.created) : null;
    const dateStr = dt ? dt.toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'}) : '';
    const timeStr = dt ? dt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '';
    rows.push([
      n.id,
      n.title || '',
      content,
      n.type,
      n.tag,
      STATUS_LABELS[n.status || 'none'] || '—',
      n.pinned ? 'Yes' : 'No',
      n.starred ? 'Yes' : 'No',
      dateStr,
      timeStr,
      fmtTime(n.created),
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = `stickyverse-notes-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('CSV exported 📄');
}

/* ══════════════════════════════════════
   WIDGETS & BOTTOM BAR
══════════════════════════════════════ */
function setupWidgets() {
  document.getElementById('pomo-start-btn').addEventListener('click', startPomo);
  document.getElementById('pomo-pause-btn').addEventListener('click', pausePomo);
  document.getElementById('pomo-reset-btn').addEventListener('click', resetPomo);
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const next = S.theme === 'minimal' ? 'void' : 'minimal';
    applyTheme(next);
  });
}
function setupBottomBar() {
  document.getElementById('bar-add-btn').addEventListener('click', () => openModal('note'));
  document.getElementById('bar-checklist-btn').addEventListener('click', () => openModal('checklist'));
  document.getElementById('bar-link-btn').addEventListener('click', () => { showView('links'); });
  document.getElementById('bar-ai-btn').addEventListener('click', () => toast('AI features coming in V2 ✦'));
}
function setupDropZone() {
  const dz = document.getElementById('drop-zone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('over');
    const text = e.dataTransfer.getData('text/plain');
    const url  = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && url.startsWith('http')) {
      saveLink(url, '', '');
    } else if (text) {
      addNote({ type:'note', content:text, color:'yellow', tag:'note' });
    }
  });
  dz.addEventListener('click', () => openModal('note'));
}

/* ══════════════════════════════════════
   CLOCK
══════════════════════════════════════ */
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clock-time').textContent = `${h}:${String(m).padStart(2,'0')}`;
  document.getElementById('clock-ampm').textContent = ampm;
  document.getElementById('clock-date').textContent = now.toLocaleDateString([], {weekday:'long',day:'numeric',month:'long',year:'numeric'});
  // Arc: progress through the hour (minutes/60)
  const progress = m / 60;
  const circ = 2 * Math.PI * 50;
  const offset = circ * (1 - progress);
  const arc = document.getElementById('clock-arc');
  if (arc) arc.setAttribute('stroke-dashoffset', offset.toFixed(2));
}

/* ══════════════════════════════════════
   POMODORO
══════════════════════════════════════ */
function renderPomo() {
  const m = String(Math.floor(S.pomo.tl / 60)).padStart(2,'0');
  const s = String(S.pomo.tl % 60).padStart(2,'0');
  document.getElementById('pomo-time').textContent = `${m}:${s}`;
  document.getElementById('pomo-mode').textContent = S.pomo.mode === 'work' ? 'work session 🎯' : 'break time ☕';
}
function startPomo() {
  if (S.pomo.running) return;
  S.pomo.running = true;
  const btn = document.getElementById('pomo-start-btn');
  btn.textContent = 'Running...';
  btn.classList.add('paused');
  S.pomo.iv = setInterval(() => {
    S.pomo.tl--;
    renderPomo();
    if (S.pomo.tl <= 0) {
      clearInterval(S.pomo.iv);
      S.pomo.running = false;
      btn.textContent = 'Start';
      btn.classList.remove('paused');
      S.pomo.mode = S.pomo.mode === 'work' ? 'break' : 'work';
      S.pomo.tl = S.pomo.mode === 'work' ? 25*60 : 5*60;
      renderPomo();
      beep();
      toast(S.pomo.mode === 'break' ? 'Break time! ☕' : 'Work session! 🎯');
    }
  }, 1000);
}
function pausePomo() {
  clearInterval(S.pomo.iv); S.pomo.running = false;
  document.getElementById('pomo-start-btn').textContent = 'Start';
  document.getElementById('pomo-start-btn').classList.remove('paused');
}
function resetPomo() {
  pausePomo();
  S.pomo.mode = 'work'; S.pomo.tl = 25*60;
  renderPomo();
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.25;
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    setTimeout(() => { o.stop(); ctx.close(); }, 600);
  } catch {}
}

/* ══════════════════════════════════════
   STREAK
══════════════════════════════════════ */
function updateStreak() {
  let data = {};
  try { data = JSON.parse(localStorage.getItem('sv_streak') || '{}'); } catch {}
  const today = new Date().toDateString();
  if (data.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDay === yesterday) {
      data.count = (data.count || 0) + 1;
    } else {
      data.count = 1;
    }
    data.lastDay = today;
    localStorage.setItem('sv_streak', JSON.stringify(data));
  }
  const count = data.count || 1;
  document.getElementById('streak-num').textContent = count;
  const dotsEl = document.getElementById('streak-dots');
  dotsEl.innerHTML = Array(7).fill(0).map((_, i) => {
    const isToday = i === new Date().getDay() - 1;
    const done = i < Math.min(count, 7);
    return `<div class="streak-dot ${isToday ? 'today' : done ? 'done' : ''}"></div>`;
  }).join('');
  document.getElementById('sb-quote-text').textContent = QUOTES[new Date().getDay() % QUOTES.length].text;
  document.getElementById('sb-quote-author').textContent = '— ' + QUOTES[new Date().getDay() % QUOTES.length].author;
}

/* ══════════════════════════════════════
   QUOTES (right panel)
══════════════════════════════════════ */
function buildQuoteDots() {
  const el = document.getElementById('quote-dots');
  el.innerHTML = QUOTES.slice(0,5).map((_, i) =>
    `<div class="q-dot ${i===0?'active':''}" data-qi="${i}"></div>`
  ).join('');
  el.querySelectorAll('.q-dot').forEach(d => {
    d.addEventListener('click', () => { S.quoteIdx = parseInt(d.dataset.qi); renderRpQuote(); });
  });
}
function renderRpQuote() {
  const q = QUOTES[S.quoteIdx % QUOTES.length];
  document.getElementById('rp-quote-text').textContent = q.text;
  document.getElementById('rp-quote-author').textContent = '— ' + q.author;
  document.querySelectorAll('.q-dot').forEach((d,i) => d.classList.toggle('active', i === S.quoteIdx % QUOTES.length));
}
function rotateRpQuote() {
  renderRpQuote();
  setInterval(() => { S.quoteIdx = (S.quoteIdx + 1) % QUOTES.length; renderRpQuote(); }, 8000);
}
function rotateSidebarQuote() {} // handled in updateStreak

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let toastTimeout;
function toast(msg) {
  let el = document.getElementById('sv-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sv-toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(0);background:#1A1438;border:1px solid rgba(167,139,250,0.3);color:rgba(255,255,255,0.88);padding:9px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 6px 22px rgba(0,0,0,0.3);transition:opacity 0.22s,transform 0.22s;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(8px)';
  }, 2500);
}

/* ══════════════════════════════════════
   UTILS
══════════════════════════════════════ */
function fmtFullDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else if (diffDays < 7) {
    return `${d.toLocaleDateString([], {weekday:'short'})}, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  } else {
    return d.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'}) + ' · ' +
           d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }
}
function fmtTime(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return Math.floor(d/60000) + 'm ago';
  if (d < 86400000) return Math.floor(d/3600000) + 'h ago';
  if (d < 172800000) return 'Yesterday';
  const dt = new Date(ts);
  return `${dt.getDate()} ${dt.toLocaleString('default',{month:'short'})}`;
}
/* ══════════════════════════════════════
   NOTE CANVAS
══════════════════════════════════════ */
const CANVAS_COLORS = {
  purple: 'purple', yellow: 'yellow', pink: 'pink',
  green: 'green', blue: 'blue', cream: 'cream',
  dark: 'dark', polaroid: 'polaroid',
};

function setupNoteCanvas() {
  document.getElementById('nc-back-btn').addEventListener('click', closeNoteCanvas);
  document.getElementById('nc-close-x').addEventListener('click', closeNoteCanvas);
  document.getElementById('nc-backdrop').addEventListener('click', closeNoteCanvas);

  // Auto-save on input
  ['nc-title-inp','nc-text-area','nc-quote-body','nc-quote-auth'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => { scheduleCanvasSave(); updateWordCount(); });
    }
  });

  document.getElementById('nc-cl-add').addEventListener('click', () => addCanvasClItem('', false));
  document.getElementById('nc-pin-canvas-btn').addEventListener('click', () => {
    if (!S.canvasId) return;
    togglePin(S.canvasId);
    updateCanvasPinBtn();
  });
}

function openNoteCanvas(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  S.canvasId = id;

  const panel = document.getElementById('nc-panel');
  const canvas = document.getElementById('note-canvas');

  // Apply color skin
  panel.dataset.color = CANVAS_COLORS[note.color] || 'purple';
  panel.classList.remove('closing');

  // Tag chip
  document.getElementById('nc-tag-chip').textContent = note.tag || 'note';

  // Title
  document.getElementById('nc-title-inp').value = note.title || '';

  // Created label
  document.getElementById('nc-created-lbl').textContent = note.created ? fmtTime(note.created) : '';

  // Show correct content section
  const textArea  = document.getElementById('nc-text-area');
  const clWrap    = document.getElementById('nc-cl-wrap');
  const quoteWrap = document.getElementById('nc-quote-wrap');
  textArea.classList.add('nc-hidden');
  clWrap.classList.add('nc-hidden');
  quoteWrap.classList.add('nc-hidden');

  if (note.type === 'checklist') {
    clWrap.classList.remove('nc-hidden');
    renderCanvasCL(note);
  } else if (note.type === 'quote') {
    quoteWrap.classList.remove('nc-hidden');
    document.getElementById('nc-quote-body').value = note.content || '';
    document.getElementById('nc-quote-auth').value = note.author || '';
  } else {
    // note, bullet (edit as text), photo
    textArea.classList.remove('nc-hidden');
    if (note.type === 'bullet' && Array.isArray(note.items)) {
      textArea.value = note.items.join('\n');
    } else {
      textArea.value = note.content || '';
    }
  }

  updateWordCount();
  updateCanvasPinBtn();
  const statusSel = document.getElementById('nc-status-select');
  if (statusSel) statusSel.value = note.status || 'none';
  statusSel && statusSel.addEventListener('change', scheduleCanvasSave);
  showCanvasSaved();
  canvas.classList.remove('nc-hidden');

  // Focus
  setTimeout(() => {
    if (note.type === 'checklist') {
      const first = document.querySelector('.nc-cl-row input[type="text"]');
      if (first) first.focus();
    } else if (note.type === 'quote') {
      document.getElementById('nc-quote-body').focus();
    } else {
      const ta = document.getElementById('nc-text-area');
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, 150);
}

function closeNoteCanvas() {
  const panel = document.getElementById('nc-panel');
  if (!document.getElementById('note-canvas').classList.contains('nc-hidden')) {
    saveCanvasNote();
    panel.classList.add('closing');
    setTimeout(() => {
      document.getElementById('note-canvas').classList.add('nc-hidden');
      panel.classList.remove('closing');
      S.canvasId = null;
    }, 200);
  }
}

function renderCanvasCL(note) {
  const wrap = document.getElementById('nc-cl-items');
  wrap.innerHTML = '';
  (note.items || []).forEach((item, idx) => {
    addCanvasClItem(item.text, item.done, idx);
  });
}

function addCanvasClItem(text, done, idx) {
  const wrap = document.getElementById('nc-cl-items');
  const row = document.createElement('div');
  row.className = 'nc-cl-row';
  row.innerHTML = `
    <input type="checkbox" ${done ? 'checked' : ''}>
    <input type="text" value="${esc(text)}" placeholder="Item..." class="${done ? 'done-text' : ''}">
    <button class="nc-cl-row-del" title="Remove">×</button>`;

  const cb  = row.querySelector('input[type="checkbox"]');
  const txt = row.querySelector('input[type="text"]');
  const del = row.querySelector('.nc-cl-row-del');

  cb.addEventListener('change', () => {
    txt.classList.toggle('done-text', cb.checked);
    scheduleCanvasSave();
  });
  txt.addEventListener('input', scheduleCanvasSave);
  txt.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addCanvasClItem('', false); }
  });
  del.addEventListener('click', () => { row.remove(); scheduleCanvasSave(); });

  wrap.appendChild(row);
  if (text === '') setTimeout(() => txt.focus(), 20);
}

function saveCanvasNote() {
  if (!S.canvasId) return;
  const note = S.notes.find(n => n.id === S.canvasId);
  if (!note) return;

  note.title = document.getElementById('nc-title-inp').value.trim() || null;
  const statusSel = document.getElementById('nc-status-select');
  if (statusSel) note.status = statusSel.value;

  if (note.type === 'checklist') {
    const rows = document.querySelectorAll('.nc-cl-row');
    note.items = Array.from(rows).map(row => ({
      text: row.querySelector('input[type="text"]').value.trim(),
      done: row.querySelector('input[type="checkbox"]').checked,
    })).filter(i => i.text);
  } else if (note.type === 'quote') {
    note.content = document.getElementById('nc-quote-body').value.trim();
    note.author  = document.getElementById('nc-quote-auth').value.trim();
  } else if (note.type === 'bullet') {
    const lines = document.getElementById('nc-text-area').value.split('\n').map(l => l.trim()).filter(Boolean);
    note.items = lines;
    note.content = null;
  } else {
    note.content = document.getElementById('nc-text-area').value;
  }

  save();
  renderNotes();
  showCanvasSaved();
}

function scheduleCanvasSave() {
  clearTimeout(S.canvasSaveTimer);
  document.getElementById('nc-saved-dot').textContent = '● Saving…';
  document.getElementById('nc-saved-dot').classList.add('saving');
  S.canvasSaveTimer = setTimeout(() => {
    saveCanvasNote();
    showCanvasSaved();
  }, 800);
}

function showCanvasSaved() {
  const el = document.getElementById('nc-saved-dot');
  if (el) { el.textContent = '● Saved'; el.classList.remove('saving'); }
}

function updateWordCount() {
  let text = '';
  const note = S.canvasId ? S.notes.find(n => n.id === S.canvasId) : null;
  if (!note) return;
  if (note.type === 'checklist') {
    const txts = document.querySelectorAll('.nc-cl-row input[type="text"]');
    text = Array.from(txts).map(i => i.value).join(' ');
  } else if (note.type === 'quote') {
    text = (document.getElementById('nc-quote-body')?.value || '') + ' ' +
           (document.getElementById('nc-quote-auth')?.value || '');
  } else {
    text = document.getElementById('nc-text-area')?.value || '';
  }
  text += ' ' + (document.getElementById('nc-title-inp')?.value || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const el = document.getElementById('nc-wc');
  if (el) el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function updateCanvasPinBtn() {
  if (!S.canvasId) return;
  const note = S.notes.find(n => n.id === S.canvasId);
  const btn = document.getElementById('nc-pin-canvas-btn');
  if (btn && note) btn.style.opacity = note.pinned ? '1' : '0.5';
}

// === end ===
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════
   FAVORITES
══════════════════════════════════════ */
function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  if (!grid) return;
  const starred = S.notes.filter(n => n.starred && !n.archived);
  if (!starred.length) {
    grid.innerHTML = '<div class="empty-msg"><strong>No favorites yet</strong>Star a note to see it here</div>';
  } else {
    grid.innerHTML = '';
    starred.forEach((note, i) => grid.appendChild(buildNoteEl(note, i)));
  }
  updateFavBadge();
}
function updateFavBadge() {
  const el = document.getElementById('fav-badge');
  if (!el) return;
  const count = S.notes.filter(n => n.starred && !n.archived).length;
  el.textContent = count;
  el.style.display = count ? '' : 'none';
}

/* ══════════════════════════════════════
   ARCHIVE
══════════════════════════════════════ */
function renderArchive() {
  const grid = document.getElementById('archive-grid');
  if (!grid) return;
  const archived = S.notes.filter(n => n.archived);
  if (!archived.length) {
    grid.innerHTML = '<div class="empty-msg"><strong>Archive is empty</strong>Archive notes using the 📦 button</div>';
    return;
  }
  grid.innerHTML = '';
  archived.forEach((note, i) => {
    const el = buildNoteEl(note, i);
    // Add unarchive button overlay
    const unarchiveBtn = document.createElement('button');
    unarchiveBtn.className = 'unarchive-btn';
    unarchiveBtn.textContent = '↩ Unarchive';
    unarchiveBtn.addEventListener('click', e => { e.stopPropagation(); toggleArchive(note.id); });
    el.appendChild(unarchiveBtn);
    grid.appendChild(el);
  });
}

/* ══════════════════════════════════════
   READING LIST
══════════════════════════════════════ */
function setupReadingList() {
  // Permanent delegation on the grid container — survives innerHTML re-renders
  document.getElementById('reading-grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-raction]');
    if (!btn) return;
    const id = btn.dataset.rid;
    if (btn.dataset.raction === 'toggle') {
      const item = S.reading.find(r => r.id === id);
      if (item) { item.read = !item.read; saveToLocal(); renderReadingList(); }
    } else if (btn.dataset.raction === 'del') {
      S.reading = S.reading.filter(r => r.id !== id);
      saveToLocal(); renderReadingList();
      toast('Removed from reading list');
    }
  });
  document.getElementById('reading-add-btn').addEventListener('click', () => {
    const v = document.getElementById('reading-url-input').value.trim();
    if (v) { addToReadingList(v); document.getElementById('reading-url-input').value = ''; }
  });
  document.getElementById('reading-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = e.target.value.trim();
      if (v) { addToReadingList(v); e.target.value = ''; }
    }
  });
}
function addToReadingList(url) {
  if (!url.startsWith('http')) url = 'https://' + url;
  try { new URL(url); } catch { toast('Invalid URL'); return; }
  const host = new URL(url).hostname.replace('www.', '');
  S.reading.unshift({
    id: 'r' + Date.now(),
    url,
    title: host,
    favicon: `https://www.google.com/s2/favicons?sz=32&domain=${host}`,
    savedAt: Date.now(),
    read: false,
  });
  saveToLocal();
  renderReadingList();
  updateReadingBadge();
  logActivity('reading_saved', `Saved to reading list: ${host}`);
  toast('Saved to reading list 📖');
}
function renderReadingList() {
  const grid = document.getElementById('reading-grid');
  if (!grid) return;
  if (!S.reading.length) {
    grid.innerHTML = '<div class="empty-msg"><strong>Reading list is empty</strong>Paste a URL above to save for later</div>';
    updateReadingBadge();
    return;
  }
  grid.innerHTML = S.reading.map(item => `
    <div class="reading-item ${item.read ? 'read' : ''}" data-rid="${item.id}">
      <img class="reading-favicon" src="${item.favicon}" onerror="this.src=''" alt="">
      <div class="reading-info">
        <a class="reading-title" href="${item.url}" target="_blank">${esc(item.title)}</a>
        <span class="reading-host">${new URL(item.url).hostname.replace('www.','')}</span>
      </div>
      <div class="reading-actions">
        <button class="reading-btn" data-raction="toggle" data-rid="${item.id}" title="${item.read ? 'Mark unread' : 'Mark read'}">${item.read ? '✅' : '○'}</button>
        <button class="reading-btn" data-raction="del" data-rid="${item.id}" title="Remove">×</button>
      </div>
    </div>
  `).join('');
  updateReadingBadge();
}
function updateReadingBadge() {
  const el = document.getElementById('reading-badge');
  if (!el) return;
  const unread = S.reading.filter(r => !r.read).length;
  el.textContent = unread;
  el.style.display = unread ? '' : 'none';
}

/* ══════════════════════════════════════
   PRODUCTIVITY
══════════════════════════════════════ */
function renderProductivity() {
  const statsGrid = document.getElementById('prod-stats-grid');
  const summaryEl = document.getElementById('prod-summary');
  const timelineEl = document.getElementById('prod-timeline');
  if (!statsGrid) return;

  const total = S.notes.filter(n => !n.archived).length;
  const completed = S.notes.filter(n => n.status === 'completed').length;
  const inProgress = S.notes.filter(n => n.status === 'in-progress').length;
  const goals = S.goals.filter(g => g.status === 'active').length;
  const score = total ? Math.round((completed / total) * 100) : 0;
  const streak = parseInt(localStorage.getItem('sv_streak_count') || '0');

  statsGrid.innerHTML = `
    <div class="prod-stat-card">
      <div class="prod-stat-val">${score}%</div>
      <div class="prod-stat-label">Daily Score</div>
    </div>
    <div class="prod-stat-card">
      <div class="prod-stat-val">${completed}</div>
      <div class="prod-stat-label">Completed</div>
    </div>
    <div class="prod-stat-card">
      <div class="prod-stat-val">${inProgress}</div>
      <div class="prod-stat-label">In Progress</div>
    </div>
    <div class="prod-stat-card">
      <div class="prod-stat-val">${goals}</div>
      <div class="prod-stat-label">Active Goals</div>
    </div>
    <div class="prod-stat-card">
      <div class="prod-stat-val">${streak}🔥</div>
      <div class="prod-stat-label">Day Streak</div>
    </div>
    <div class="prod-stat-card">
      <div class="prod-stat-val">${total}</div>
      <div class="prod-stat-label">Total Notes</div>
    </div>
  `;

  // Daily summary
  const pending = S.notes.filter(n => n.status === 'none' || n.status === 'in-progress').length;
  const delayed = S.notes.filter(n => n.status === 'delayed').length;
  summaryEl.innerHTML = `
    <div class="prod-summary-row"><span class="prod-dot green"></span><strong>${completed}</strong> tasks completed</div>
    <div class="prod-summary-row"><span class="prod-dot yellow"></span><strong>${pending}</strong> tasks pending</div>
    <div class="prod-summary-row"><span class="prod-dot red"></span><strong>${delayed}</strong> tasks delayed</div>
    <div class="prod-progress-bar"><div class="prod-progress-fill" style="width:${score}%"></div></div>
    <div class="prod-score-label">${score}% completion rate today</div>
  `;

  // Activity timeline
  if (!S.activity.length) {
    timelineEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:12px 0">No activity yet</div>';
  } else {
    timelineEl.innerHTML = S.activity.slice(0, 20).map(a => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-text">${esc(a.msg)}</div>
          <div class="timeline-time">${fmtTime(a.at)}</div>
        </div>
      </div>
    `).join('');
  }
}

/* ══════════════════════════════════════
   ACTIVITY LOG
══════════════════════════════════════ */
function logActivity(type, msg) {
  S.activity.unshift({ type, msg, at: Date.now() });
  if (S.activity.length > 100) S.activity = S.activity.slice(0, 100);
  saveToLocal();
}

/* ══════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════ */
function addNotification(msg, type = 'info') {
  S.notifications.unshift({ id: 'notif' + Date.now(), msg, type, at: Date.now(), read: false });
  saveToLocal();
  renderNotifications();
  // Update badge
  const badge = document.getElementById('notif-badge');
  const unread = S.notifications.filter(n => !n.read).length;
  if (badge) { badge.textContent = unread; badge.style.display = unread ? '' : 'none'; }
}
function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  const clearBtn = document.getElementById('clear-notifs-btn');
  if (clearBtn) {
    clearBtn.onclick = () => { S.notifications = []; saveToLocal(); renderNotifications(); };
  }

  if (!S.notifications.length) {
    list.innerHTML = '<div class="empty-msg"><strong>All clear!</strong>No notifications</div>';
    return;
  }
  const ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  list.innerHTML = S.notifications.map(n => `
    <div class="notif-item ${n.read ? 'read' : ''}" data-nid="${n.id}">
      <span class="notif-icon">${ICONS[n.type] || 'ℹ️'}</span>
      <div class="notif-body">
        <div class="notif-msg">${esc(n.msg)}</div>
        <div class="notif-time">${fmtTime(n.at)}</div>
      </div>
      <button class="notif-dismiss" data-nid="${n.id}">×</button>
    </div>
  `).join('');
  list.querySelectorAll('.notif-dismiss').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      S.notifications = S.notifications.filter(n => n.id !== btn.dataset.nid);
      saveToLocal(); renderNotifications();
    });
  });
  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const n = S.notifications.find(x => x.id === el.dataset.nid);
      if (n) { n.read = true; saveToLocal(); renderNotifications(); }
    });
  });
  // Update badge
  const badge = document.getElementById('notif-badge');
  const unread = S.notifications.filter(n => !n.read).length;
  if (badge) { badge.textContent = unread; badge.style.display = unread ? '' : 'none'; }
}

/* ══════════════════════════════════════
   VISION BOARD
══════════════════════════════════════ */

/* ── Image upload: Supabase Storage (auth) or compressed base64 (guest) ── */
async function uploadVisionImage(file) {
  // Compress first regardless of destination — max 800px wide, 80% quality
  const compressed = await compressImageFile(file, 800, 0.8);

  if (supabase && currentUser) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${currentUser.id}/vision_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('vision-images')
        .upload(path, compressed, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('vision-images').getPublicUrl(data.path);
      return { url: urlData.publicUrl, stored: 'supabase' };
    } catch (err) {
      console.warn('Supabase upload failed, falling back to base64:', err);
    }
  }
  // Guest / fallback — store compressed base64 in localStorage
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve({ url: e.target.result, stored: 'local' });
    reader.readAsDataURL(compressed);
  });
}

function compressImageFile(file, maxWidth, quality) {
  return new Promise(resolve => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(objUrl);
        resolve(blob || file);
      }, 'image/jpeg', quality);
    };
    img.src = objUrl;
  });
}

async function deleteVisionImageFromSupabase(imageUrl) {
  if (!supabase || !currentUser || !imageUrl || !imageUrl.includes('supabase')) return;
  try {
    const path = imageUrl.split('/vision-images/')[1];
    if (path) await supabase.storage.from('vision-images').remove([path]);
  } catch (e) { /* silent */ }
}

/* ── Vision Board Templates ── */
const VISION_TEMPLATES = [
  {
    id: 'best-year',
    label: '🏆 Best Year Yet',
    description: 'Plan your most ambitious year across all life areas',
    items: [
      { emoji:'🧠', pillar:'mind',    text:'Read 24 books this year', why:'Knowledge compounds — every book changes how I think.' },
      { emoji:'💪', pillar:'body',    text:'Sleep 8 hours every night', why:'Everything — energy, focus, mood — depends on sleep.' },
      { emoji:'💰', pillar:'money',   text:'Save 3 months emergency fund', why:'Security gives me the freedom to take bold risks.' },
      { emoji:'🚀', pillar:'career',  text:'Ship one meaningful project', why:'I want to look back proud of what I built.' },
      { emoji:'❤️', pillar:'love',    text:'Weekly phone-free family dinners', why:'Connection is the point of everything else.' },
      { emoji:'🌱', pillar:'growth',  text:'Learn one new skill per quarter', why:'Growth is the only direction worth moving in.' },
    ]
  },
  {
    id: 'financial-freedom',
    label: '💰 Financial Freedom',
    description: 'Money goals that build real lasting wealth',
    items: [
      { emoji:'💳', pillar:'money',  text:'Pay off all credit card debt', why:'Debt is renting money — I want to own mine.' },
      { emoji:'📈', pillar:'money',  text:'Invest 20% of every paycheck', why:'Future me deserves the compounding I start today.' },
      { emoji:'🏠', pillar:'money',  text:'Save house down payment', why:'Owning my space = stability and freedom.' },
      { emoji:'💼', pillar:'career', text:'Negotiate a raise or new income stream', why:'My skills are worth more than I currently charge.' },
      { emoji:'📚', pillar:'mind',   text:'Read 6 personal finance books', why:'Financial literacy is the highest ROI education.' },
      { emoji:'🧘', pillar:'growth', text:'Decouple self-worth from net worth', why:'Money is a tool, not a measure of me.' },
    ]
  },
  {
    id: 'health-body',
    label: '💪 Peak Health',
    description: 'Build the body and energy you deserve',
    items: [
      { emoji:'🏋️', pillar:'body',    text:'Gym 4× per week consistently', why:'Discipline here bleeds into every other area.' },
      { emoji:'🥗', pillar:'body',    text:'Cook healthy meals 5 days a week', why:'You can\'t out-train a bad diet.' },
      { emoji:'🌅', pillar:'body',    text:'Morning walk every single day', why:'Sunlight and steps set the tone for everything.' },
      { emoji:'💧', pillar:'body',    text:'Drink 2L of water daily', why:'Simple but most ignored health habit.' },
      { emoji:'🧘', pillar:'mind',    text:'10 min meditation daily', why:'Mental fitness is as important as physical.' },
      { emoji:'😴', pillar:'body',    text:'In bed by 10:30pm on weekdays', why:'Sleep is the foundation — protect it fiercely.' },
    ]
  },
  {
    id: 'dream-career',
    label: '🚀 Dream Career',
    description: 'Take your professional life to the next level',
    items: [
      { emoji:'🎯', pillar:'career',  text:'Get promoted or land dream role', why:'I deserve to do work that excites and challenges me.' },
      { emoji:'🌐', pillar:'career',  text:'Build an audience or personal brand', why:'Visibility creates options I can\'t predict yet.' },
      { emoji:'🤝', pillar:'career',  text:'Have 2 meaningful mentors', why:'The fastest path is learning from someone ahead of me.' },
      { emoji:'🛠️', pillar:'creative',text:'Launch a side project or product', why:'Ownership of what I build is deeply satisfying.' },
      { emoji:'📢', pillar:'career',  text:'Speak at or attend one conference', why:'In-person connections change career trajectories.' },
      { emoji:'🧠', pillar:'mind',    text:'Complete one professional certification', why:'Formal credentials open specific doors.' },
    ]
  },
  {
    id: 'adventure-travel',
    label: '🌍 Adventure & Travel',
    description: 'Explore the world and collect experiences',
    items: [
      { emoji:'✈️', pillar:'travel',  text:'Visit one country I\'ve never been to', why:'New cultures rewire how I see the world.' },
      { emoji:'🏔️', pillar:'travel',  text:'Complete a challenging hike or trek', why:'Physical challenge + nature = the best reset.' },
      { emoji:'🗺️', pillar:'travel',  text:'Take one solo trip this year', why:'Traveling alone teaches you who you really are.' },
      { emoji:'📸', pillar:'creative',text:'Document every trip in a photo journal', why:'Memories fade — stories and photos don\'t.' },
      { emoji:'🌊', pillar:'body',    text:'Learn to surf or dive', why:'Water sports are pure joy and presence.' },
      { emoji:'🍜', pillar:'travel',  text:'Try cooking a dish from every trip', why:'Food is the best souvenir.' },
    ]
  },
  {
    id: 'creative-growth',
    label: '🎨 Creative Life',
    description: 'Nurture your creativity and self-expression',
    items: [
      { emoji:'🎨', pillar:'creative',text:'Complete a creative project start-to-finish', why:'Finishing things builds the creative muscle.' },
      { emoji:'✍️', pillar:'creative',text:'Write 500 words every day', why:'Writing clarifies thinking — it\'s thinking on paper.' },
      { emoji:'🎵', pillar:'creative',text:'Learn an instrument or improve one', why:'Music is a language that bypasses the rational mind.' },
      { emoji:'📷', pillar:'creative',text:'Take a photography course', why:'Learning to see light changed how I see everything.' },
      { emoji:'🎭', pillar:'growth',  text:'Try one completely new creative hobby', why:'Beginner\'s mind is the most alive state to be in.' },
      { emoji:'🌱', pillar:'growth',  text:'Share my work publicly even imperfectly', why:'Shipping > perfecting. Feedback is growth fuel.' },
    ]
  },
];

const VISION_AFFIRMATIONS = [
  'I am capable of achieving everything I set my mind to.',
  'Every day I grow closer to the life I deserve.',
  'I attract abundance, opportunity and joy effortlessly.',
  'My dreams are valid and worth pursuing with full force.',
  'I am becoming the best version of myself, one step at a time.',
  'The life I want is already on its way to me.',
  'I have the courage to create change in my life.',
  'I am focused, driven and unstoppable.',
  'Great things are always unfolding for me.',
  'I invest in my future self every single day.',
  'Challenges make me stronger and more resilient.',
  'I deserve everything beautiful that life has to offer.',
];
const PILLAR_GRADIENTS = {
  mind:    'linear-gradient(135deg,rgba(139,92,246,0.22),rgba(99,102,241,0.12))',
  body:    'linear-gradient(135deg,rgba(16,185,129,0.22),rgba(52,211,153,0.10))',
  money:   'linear-gradient(135deg,rgba(245,158,11,0.22),rgba(251,191,36,0.10))',
  career:  'linear-gradient(135deg,rgba(59,130,246,0.22),rgba(96,165,250,0.10))',
  love:    'linear-gradient(135deg,rgba(239,68,68,0.22),rgba(251,113,133,0.10))',
  travel:  'linear-gradient(135deg,rgba(6,182,212,0.22),rgba(34,211,238,0.10))',
  creative:'linear-gradient(135deg,rgba(236,72,153,0.22),rgba(244,114,182,0.10))',
  growth:  'linear-gradient(135deg,rgba(132,204,22,0.22),rgba(163,230,53,0.10))',
};

let visionActivePillar = 'all';
let visionImgData = null;

function setupVisionBoard() {
  // Daily affirmation
  renderVisionAffirmation();
  document.getElementById('vision-affirmation-refresh').addEventListener('click', renderVisionAffirmation);

  // Pillar tabs
  document.getElementById('vision-pillar-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.vision-pillar-tab');
    if (!tab) return;
    visionActivePillar = tab.dataset.pillar;
    document.querySelectorAll('.vision-pillar-tab').forEach(t => t.classList.toggle('active', t.dataset.pillar === visionActivePillar));
    renderVisionBoard();
  });

  // Open/close add panel
  document.getElementById('vision-add-open-btn').addEventListener('click', () => {
    document.getElementById('vision-add-panel').classList.remove('hidden');
  });
  document.getElementById('vision-panel-close').addEventListener('click', closeVisionPanel);

  // Template picker delegation
  document.getElementById('vision-template-list').addEventListener('click', e => {
    const card = e.target.closest('.vt-card');
    if (!card) return;
    const tpl = VISION_TEMPLATES.find(t => t.id === card.dataset.tplId);
    if (!tpl) return;
    const now = Date.now();
    tpl.items.forEach((item, i) => {
      S.vision.unshift({ id: 'v' + (now + i), text: item.text, emoji: item.emoji, pillar: item.pillar, why: item.why, targetDate: null, image: null, created: now + i });
    });
    saveToLocal(); renderVisionBoard();
    document.getElementById('vision-template-section').classList.add('hidden');
    toast(`Template "${tpl.label}" added — ${tpl.items.length} visions loaded 🌠`);
  });
  document.getElementById('vision-template-toggle').addEventListener('click', () => {
    document.getElementById('vision-template-section').classList.toggle('hidden');
  });

  // Image upload
  document.getElementById('vision-img-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadBtn = document.getElementById('vision-img-upload-area');
    uploadBtn.style.opacity = '0.6';
    uploadBtn.style.pointerEvents = 'none';
    try {
      const result = await uploadVisionImage(file);
      visionImgData = result.url;
      document.getElementById('vision-img-preview').src = visionImgData;
      document.getElementById('vision-img-preview').classList.remove('hidden');
      document.getElementById('vision-img-placeholder').style.display = 'none';
      document.getElementById('vision-img-clear').classList.remove('hidden');
      if (result.stored === 'supabase') toast('Image uploaded to cloud ☁️');
      else toast('Image saved locally 📎');
    } catch (err) {
      toast('Image upload failed');
    } finally {
      uploadBtn.style.opacity = '';
      uploadBtn.style.pointerEvents = '';
    }
  });
  document.getElementById('vision-img-clear').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    visionImgData = null;
    document.getElementById('vision-img-input').value = '';
    document.getElementById('vision-img-preview').classList.add('hidden');
    document.getElementById('vision-img-placeholder').style.display = '';
    document.getElementById('vision-img-clear').classList.add('hidden');
  });

  // Submit
  document.getElementById('vision-add-btn').addEventListener('click', submitVisionItem);
  document.getElementById('vision-text-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitVisionItem();
  });

  // Grid delegation for delete + why expand
  document.getElementById('vision-grid').addEventListener('click', e => {
    const delBtn = e.target.closest('.vision-del');
    if (delBtn) {
      const item = S.vision.find(v => v.id === delBtn.dataset.vid);
      if (item && item.image) deleteVisionImageFromSupabase(item.image);
      S.vision = S.vision.filter(v => v.id !== delBtn.dataset.vid);
      saveToLocal(); renderVisionBoard();
      return;
    }
    const whyBtn = e.target.closest('.vision-why-toggle');
    if (whyBtn) {
      const card = whyBtn.closest('.vision-card');
      card.classList.toggle('why-open');
      return;
    }
  });
}

function submitVisionItem() {
  const text = document.getElementById('vision-text-input').value.trim();
  if (!text) { toast('Enter a dream or goal first ✦'); return; }
  const emoji = document.getElementById('vision-emoji-input').value.trim() || '🌟';
  const pillar = document.getElementById('vision-pillar-select').value;
  const why = document.getElementById('vision-why-input').value.trim();
  const targetDate = document.getElementById('vision-date-input').value;
  S.vision.unshift({
    id: 'v' + Date.now(),
    text, emoji, pillar, why,
    targetDate: targetDate || null,
    image: visionImgData || null,
    created: Date.now(),
  });
  saveToLocal(); renderVisionBoard();
  closeVisionPanel();
  toast('Added to vision board 🌠');
}

function closeVisionPanel() {
  document.getElementById('vision-add-panel').classList.add('hidden');
  document.getElementById('vision-text-input').value = '';
  document.getElementById('vision-emoji-input').value = '';
  document.getElementById('vision-why-input').value = '';
  document.getElementById('vision-date-input').value = '';
  document.getElementById('vision-pillar-select').value = 'mind';
  visionImgData = null;
  document.getElementById('vision-img-input').value = '';
  document.getElementById('vision-img-preview').classList.add('hidden');
  document.getElementById('vision-img-placeholder').style.display = '';
  document.getElementById('vision-img-clear').classList.add('hidden');
}

function renderVisionAffirmation() {
  const el = document.getElementById('vision-daily-affirmation');
  if (!el) return;
  const idx = Math.floor(Math.random() * VISION_AFFIRMATIONS.length);
  el.textContent = VISION_AFFIRMATIONS[idx];
}

function visionCountdown(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  if (diff < 0) return `<span class="vc-overdue">Overdue by ${Math.abs(diff)}d</span>`;
  if (diff === 0) return `<span class="vc-today">Today!</span>`;
  return `<span class="vc-days">${diff} days left</span>`;
}

function renderVisionBoard() {
  const grid = document.getElementById('vision-grid');
  if (!grid) return;
  const items = visionActivePillar === 'all'
    ? S.vision
    : S.vision.filter(v => v.pillar === visionActivePillar);
  if (!items.length) {
    grid.innerHTML = `<div class="empty-msg" style="grid-column:1/-1"><strong>No visions here yet</strong>Click "Add Vision" to start building your dream life</div>`;
    return;
  }
  grid.innerHTML = items.map(item => {
    const grad = PILLAR_GRADIENTS[item.pillar] || PILLAR_GRADIENTS.mind;
    const cd = item.targetDate ? visionCountdown(item.targetDate) : '';
    const hasWhy = item.why && item.why.trim();
    return `<div class="vision-card" data-vid="${item.id}" style="background:${grad}">
      ${item.image ? `<div class="vision-img-wrap"><img class="vision-card-img" src="${item.image}" alt=""></div>` : ''}
      <div class="vision-card-body">
        <div class="vision-card-top">
          <span class="vision-emoji">${esc(item.emoji)}</span>
          <span class="vision-pillar-badge">${esc(item.pillar || 'growth')}</span>
        </div>
        <div class="vision-text">${esc(item.text)}</div>
        ${cd ? `<div class="vision-countdown">${cd}</div>` : ''}
        ${hasWhy ? `
          <button class="vision-why-toggle">Why? <i class="fa-solid fa-chevron-down"></i></button>
          <div class="vision-why-text">${esc(item.why)}</div>
        ` : ''}
      </div>
      <button class="vision-del" data-vid="${item.id}" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   BACKUP & RESTORE
══════════════════════════════════════ */
function backupData() {
  const backup = {
    version: 1,
    exported: new Date().toISOString(),
    notes: S.notes,
    links: S.links,
    goals: S.goals,
    reading: S.reading,
    vision: S.vision,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stickyverse-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  logActivity('backup', 'Workspace backup downloaded');
  toast('Backup downloaded 💾');
}
function restoreData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.version || !Array.isArray(data.notes)) { toast('Invalid backup file'); return; }
      if (!confirm(`Restore ${data.notes.length} notes, ${data.links?.length || 0} links from backup? Current data will be replaced.`)) return;
      S.notes = data.notes || [];
      S.links = data.links || [];
      S.goals = data.goals || [];
      S.reading = data.reading || [];
      S.vision = data.vision || [];
      saveToLocal(); renderAll();
      logActivity('restore', `Restored backup from ${data.exported?.slice(0,10) || 'unknown date'}`);
      toast('Backup restored ✅');
    } catch { toast('Failed to read backup file'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ══════════════════════════════════════
   WALLPAPER
══════════════════════════════════════ */
const WALLPAPERS = [
  { id: 'none',    label: 'None',       css: '' },
  { id: 'aurora',  label: 'Aurora',     css: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
  { id: 'sunset',  label: 'Sunset',     css: 'linear-gradient(135deg,#ff6b6b,#feca57,#ff9ff3)' },
  { id: 'forest',  label: 'Forest',     css: 'linear-gradient(135deg,#0a3d0c,#1a6b1e,#52c41a)' },
  { id: 'ocean',   label: 'Ocean',      css: 'linear-gradient(135deg,#0c3547,#1a6b8a,#00d2ff)' },
  { id: 'candy',   label: 'Candy',      css: 'linear-gradient(135deg,#f093fb,#f5576c,#4facfe)' },
  { id: 'space',   label: 'Space',      css: 'linear-gradient(135deg,#000000,#1a1a2e,#16213e)' },
  { id: 'gold',    label: 'Gold',       css: 'linear-gradient(135deg,#1a0a00,#4a2c00,#c8860a)' },
];
function buildWallpaperPicker() {
  const picker = document.getElementById('wallpaper-picker');
  if (!picker) return;
  picker.innerHTML = WALLPAPERS.map(w => `
    <div class="wallpaper-swatch ${S.wallpaper === w.id ? 'active' : ''}" data-wid="${w.id}"
      style="${w.css ? `background:${w.css}` : 'background:rgba(255,255,255,0.08);border:1px dashed rgba(255,255,255,0.2)'}"
      title="${w.label}">
    </div>
  `).join('');
  picker.querySelectorAll('.wallpaper-swatch').forEach(el => {
    el.addEventListener('click', () => {
      S.wallpaper = el.dataset.wid;
      localStorage.setItem('sv_wallpaper', S.wallpaper);
      applyWallpaper();
      picker.querySelectorAll('.wallpaper-swatch').forEach(x => x.classList.toggle('active', x.dataset.wid === S.wallpaper));
      toast('Wallpaper applied 🎨');
    });
  });
}
function applyWallpaper() {
  const bg = document.getElementById('bg');
  const w = WALLPAPERS.find(x => x.id === S.wallpaper);
  if (!bg || !w) return;
  bg.style.background = w.css || '';
}

