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
  { id:'void',    bg:'#0C0A1E', label:'Dark Void', em:'🌑' },
  { id:'minimal', bg:'#F5F5F0', label:'Minimal',   em:'🤍' },
  { id:'cyber',   bg:'#030C06', label:'Cyber',     em:'🟩' },
  { id:'lofi',    bg:'#0F0A04', label:'Lo-fi',     em:'☕' },
];

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let S = {
  notes: [],
  links: [],
  goals: [],
  view: 'home',
  filter: 'all',
  quoteIdx: 0,
  sbQuoteIdx: 0,
  modalType: 'note',
  modalColor: 'purple',
  modalTag: 'note',
  modalStatus: 'none',
  checklistItems: [],
  pomo: { mode: 'work', tl: 25 * 60, running: false, iv: null },
  canvasId: null,
  canvasSaveTimer: null,
  theme: localStorage.getItem('sv_theme') || 'void',
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
    // Show login required overlay
    showLoginRequiredOverlay();
    // Still load local data for offline use
    await loadData();
    // Apply theme
    applyTheme(S.theme, false);
    // Setup minimal UI for local use
    setupNav();
    setupCmdBar();
    renderAll();
    return;
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
  buildThemesGrid();
  buildColorPicker();
  startClock();
  updateStreak();
  rotateSidebarQuote();
  rotateRpQuote();
  buildQuoteDots();
  renderAll();
  applyTheme(S.theme, false);
  updateLinkBadge();
  setupNoteCanvas();
  setupAuthUI();
  
  console.log('✅ StickyVerse initialization complete');
});

/* ══════════════════════════════════════
   AUTHENTICATION & SYNC
══════════════════════════════════════ */
let supabase = null;
let currentUser = null;
let isCloudSyncEnabled = false;

async function initializeAuthAndSync() {
  // Load Supabase script
  if (typeof window.supabase === 'undefined') {
    await loadSupabaseScript();
  }
  
  // Initialize Supabase client
  try {
    supabase = window.supabase.createClient(
      'https://kzhovelxcwychkmykirc.supabase.co',
      'sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl'
    );
    
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session && !error) {
      currentUser = session.user;
      isCloudSyncEnabled = true;
      console.log('✅ User authenticated:', currentUser.email);
      await setupRealtimeSync();
    } else {
      console.log('🔓 No active session - using local storage');
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
  }
}

async function loadSupabaseScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = resolve;
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
  // Check if user has session in chrome storage
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    
    if (!result.supabase_session) {
      console.log('🔒 No auth session found - user needs to login');
      return true; // Needs auth
    }
    
    return false; // Has auth
  } catch (error) {
    console.error('Auth check error:', error);
    return false; // Assume no auth needed on error
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
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(139, 92, 246, 0.4)';" 
      onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
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
      " onmouseover="this.style.background='rgba(255,255,255,0.15)';" 
      onmouseout="this.style.background='rgba(255,255,255,0.1)';">
        Continue Locally →
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('login-redirect-btn').addEventListener('click', () => {
    // Open website auth page
    chrome.tabs.create({ url: 'https://stickyverse.app/auth' });
  });
  
  document.getElementById('dismiss-auth-btn').addEventListener('click', () => {
    // Dismiss overlay and continue with local data
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 300);
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
    // Get local data
    const localNotes = JSON.parse(localStorage.getItem('sv_notes') || '[]');
    const localLinks = JSON.parse(localStorage.getItem('sv_links') || '[]');
    
    // Upload notes to cloud
    for (const note of localNotes) {
      await supabase.from('notes').upsert({
        ...note,
        user_id: currentUser.id,
        synced_at: new Date().toISOString()
      });
    }
    
    // Upload links to cloud
    for (const link of localLinks) {
      await supabase.from('links').upsert({
        ...link,
        user_id: currentUser.id,
        synced_at: new Date().toISOString()
      });
    }
    
    console.log('✅ Data migrated to cloud');
    
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
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
      
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('saved_at', { ascending: false });
      
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (notesError) throw notesError;
    if (linksError) throw linksError;
    if (goalsError) throw goalsError;
    
    S.notes = notes && notes.length ? notes : [...DEMO_NOTES];
    S.links = links && links.length ? links : [...DEMO_LINKS];
    S.goals = goals && goals.length ? goals : [...DEMO_GOALS];
    
    console.log('✅ Data loaded from cloud');
    
  } catch (error) {
    console.error('Cloud load failed, using local:', error);
    loadFromLocal();
  }
}

function loadFromLocal() {
  try {
    const n = JSON.parse(localStorage.getItem('sv_notes') || 'null');
    S.notes = n && n.length ? n : [...DEMO_NOTES];
    const l = JSON.parse(localStorage.getItem('sv_links') || 'null');
    S.links = l && l.length ? l : [...DEMO_LINKS];
    const g = JSON.parse(localStorage.getItem('sv_goals') || 'null');
    S.goals = g && g.length ? g : [...DEMO_GOALS];
    S.idc = parseInt(localStorage.getItem('sv_idc') || String(DEMO_NOTES.length));
  } catch(e) {
    S.notes = [...DEMO_NOTES];
    S.links = [...DEMO_LINKS];
    S.goals = [...DEMO_GOALS];
  }
}
async function save() {
  if (isCloudSyncEnabled && currentUser) {
    await saveToCloud();
  } else {
    saveToLocal();
  }
}

async function saveToCloud() {
  try {
    // Save notes to cloud
    for (const note of S.notes) {
      await supabase.from('notes').upsert({
        ...note,
        user_id: currentUser.id,
        updated_at: new Date().toISOString()
      });
    }
    
    // Save links to cloud
    for (const link of S.links) {
      await supabase.from('links').upsert({
        ...link,
        user_id: currentUser.id,
        updated_at: new Date().toISOString()
      });
    }
    
    // Save goals to cloud
    for (const goal of S.goals) {
      await supabase.from('goals').upsert({
        ...goal,
        user_id: currentUser.id,
        updated_at: new Date().toISOString()
      });
    }
    
    console.log('✅ Data saved to cloud');
    
  } catch (error) {
    console.error('Cloud save failed, saving locally:', error);
    saveToLocal();
  }
}

function saveToLocal() {
  localStorage.setItem('sv_notes', JSON.stringify(S.notes));
  localStorage.setItem('sv_links', JSON.stringify(S.links));
  localStorage.setItem('sv_goals', JSON.stringify(S.goals));
  localStorage.setItem('sv_idc', String(S.idc));
}
function saveLinks() {
  if (isCloudSyncEnabled && currentUser) {
    saveToCloud();
  } else {
    localStorage.setItem('sv_links', JSON.stringify(S.links));
  }
}

/* ══════════════════════════════════════
   GOAL MANAGEMENT
══════════════════════════════════════ */
function createGoal(goalData) {
  const goal = {
    id: 'g' + Date.now(),
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
          <button class="goal-edit-btn" onclick="editGoal('${goal.id}')">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="goal-delete-btn" onclick="deleteGoal('${goal.id}')">
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
          <button class="progress-btn" onclick="updateGoalProgress('${goal.id}', ${Math.max(0, goal.progress - 10)})">-10%</button>
          <button class="progress-btn" onclick="updateGoalProgress('${goal.id}', ${Math.min(100, goal.progress + 10)})">+10%</button>
          ${goal.progress !== 100 ? `<button class="progress-btn complete-btn" onclick="updateGoalProgress('${goal.id}', 100)">Complete</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════
   AUTHENTICATION UI
══════════════════════════════════════ */
function setupAuthUI() {
  // Add auth button to sidebar
  const sidebar = document.getElementById('sidebar');
  const authSection = document.createElement('div');
  authSection.className = 'sb-auth-section';
  authSection.innerHTML = `
    <div id="auth-status" class="auth-status">
      ${currentUser ? 
        `<div class="user-profile">
          <div class="user-avatar">${currentUser.email?.charAt(0).toUpperCase() || 'U'}</div>
          <div class="user-info">
            <div class="user-name">${currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}</div>
            <div class="user-email">${currentUser.email}</div>
          </div>
          <button id="signout-btn" class="signout-btn">
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
      <i class="fa-solid fa-${isCloudSyncEnabled ? 'cloud' : 'wifi-off'}"></i>
      <span>${isCloudSyncEnabled ? 'Cloud sync active' : 'Local storage only'}</span>
    </div>
  `;
  
  // Insert before the follow button
  const followBtn = document.getElementById('follow-x-btn');
  if (followBtn) {
    sidebar.insertBefore(authSection, followBtn);
  } else {
    sidebar.appendChild(authSection);
  }
  
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

function updateAuthUI() {
  const authStatus = document.getElementById('auth-status');
  const syncStatus = document.querySelector('.sync-status');
  
  if (authStatus) {
    authStatus.innerHTML = currentUser ? 
      `<div class="user-profile">
        <div class="user-avatar">${currentUser.email?.charAt(0).toUpperCase() || 'U'}</div>
        <div class="user-info">
          <div class="user-name">${currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}</div>
          <div class="user-email">${currentUser.email}</div>
        </div>
        <button id="signout-btn" class="signout-btn">
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
  try {
    // Open auth page in new window
    const authWindow = window.open(
      'auth.html?source=extension&redirect=' + encodeURIComponent(window.location.href),
      'stickyverse-auth',
      'width=400,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Listen for auth success message
    const messageHandler = async (event) => {
      if (event.data.type === 'STICKYVERSE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        authWindow.close();
        
        // Reload to initialize auth
        window.location.reload();
      }
    };
    
    window.addEventListener('message', messageHandler);
    
  } catch (error) {
    console.error('Sign in error:', error);
    toast('Failed to open sign in window');
  }
}

async function handleSignOut() {
  try {
    if (supabase && currentUser) {
      await supabase.auth.signOut();
    }
    
    // Clear local data
    localStorage.removeItem('sv_notes');
    localStorage.removeItem('sv_links');
    localStorage.removeItem('sv_idc');
    
    // Reload page
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
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  
  modalTitle.textContent = goal ? 'Edit Goal' : 'Create New Goal';
  
  modalContent.innerHTML = `
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
  
  closeModal();
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
  updateLinkBadge();
}

/* ══════════════════════════════════════
   RENDER NOTES
══════════════════════════════════════ */
function renderNotes() {
  const masonry = document.getElementById('notes-masonry');
  masonry.innerHTML = '';
  const filtered = S.filter === 'all'
    ? S.notes
    : S.notes.filter(n => n.tag === S.filter);
  if (!filtered.length) {
    masonry.innerHTML = '<div class="empty-msg" style="column-span:all"><strong>No notes here yet</strong>Click + to add your first note</div>';
    return;
  }
  filtered.forEach((note, i) => {
    const el = buildNoteEl(note, i);
    masonry.appendChild(el);
  });
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
        <div class="note-actions-row">
          <button class="note-action ${starClass}" data-action="star" data-id="${note.id}" title="Star">☆</button>
          <button class="note-action ${pinClass}" data-action="pin" data-id="${note.id}" title="Pin">📌</button>
          <button class="note-action" data-action="status" data-id="${note.id}" title="Change status">🏷</button>
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
    if (action === 'star') toggleStar(id);
    else if (action === 'pin') togglePin(id);
    else if (action === 'status') cycleStatus(id);
    else if (action === 'del') deleteNote(id);
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
  save(); renderNotes();
  const labels = { 'none':'Status cleared','in-progress':'🔄 In Progress','completed':'✅ Completed','delayed':'⏳ Delayed','waiting':'🕐 Waiting for Approval','cancelled':'❌ Cancelled' };
  toast(labels[note.status] || 'Status updated');
}
function toggleStar(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  note.starred = !note.starred;
  save(); renderNotes();
}
function togglePin(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  note.pinned = !note.pinned;
  save(); renderNotes();
  toast(note.pinned ? 'Pinned 📌' : 'Unpinned');
}
function deleteNote(id) {
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
  S.idc++;
  const note = {
    id: 'n' + S.idc,
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
    pinned: false,
    starred: false,
    created: Date.now(),
    doodle: null,
  };
  S.notes.unshift(note);
  save(); renderAll();
  toast('Note added ✨');
}

/* ══════════════════════════════════════
   NAV & VIEWS
══════════════════════════════════════ */
function setupNav() {
  // handled via event delegation
}
function showView(v) {
  S.view = v;
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const viewEl = document.getElementById('view-' + v);
  if (viewEl) viewEl.classList.add('active');
  const isHome = v === 'home';
  document.getElementById('cmd-bar').style.display = isHome ? '' : 'none';
  document.getElementById('filter-bar').style.display = isHome ? '' : 'none';
  if (v === 'pinned') renderPinned();
  if (v === 'links') renderFullLinks();
  if (v === 'goals') renderGoals();
  if (v === 'settings') document.getElementById('total-notes-desc').textContent = `${S.notes.length} notes saved`;
}

/* ══════════════════════════════════════
   FILTER
══════════════════════════════════════ */
function setupFilterTabs() {
  // via event delegation
}
function setFilter(f) {
  S.filter = f;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  renderNotes();
}

/* ══════════════════════════════════════
   CMD BAR
══════════════════════════════════════ */
function setupCmdBar() {
  document.getElementById('cmd-add-btn').addEventListener('click', () => {
    const t = document.getElementById('cmd-input').value.trim();
    if (t) {
      addNote({ type: 'note', content: t, color: 'yellow', tag: 'note' });
      document.getElementById('cmd-input').value = '';
    } else {
      openModal('note');
    }
  });
  document.getElementById('cmd-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const t = e.target.value.trim();
      if (t) {
        addNote({ type: 'note', content: t, color: 'yellow', tag: 'note' });
        e.target.value = '';
      } else {
        openModal('note');
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
  S.checklistItems = [];
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-title').value = '';
  document.getElementById('modal-content').value = '';
  document.getElementById('modal-content').style.display = 'block';
  document.getElementById('modal-checklist-area').classList.add('hidden');
  document.getElementById('checklist-items').innerHTML = '';
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === 'note'));
  S.modalTag = 'note'; S.modalStatus = 'none';
  document.getElementById('modal-status').value = 'none';
  setTimeout(() => document.getElementById('modal-title').focus(), 100);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
function submitNote() {
  const title   = document.getElementById('modal-title').value.trim();
  const content = document.getElementById('modal-content').value.trim();
  const data = {
    type: S.modalType,
    color: S.modalColor,
    tag: S.modalTag,
    status: S.modalStatus,
    title: title || null,
  };
  if (S.modalType === 'checklist') {
    const inputs = document.querySelectorAll('#checklist-items .ci-row input[type="text"]');
    data.items = Array.from(inputs).map(i => ({ text: i.value.trim(), done: false })).filter(i => i.text);
    if (!data.items.length && !title) return;
  } else if (S.modalType === 'quote') {
    const parts = content.split('\n');
    data.content = parts[0] || '';
    data.author  = parts[1]?.replace(/^[-–—]\s*/, '') || '';
  } else {
    data.content = content;
    if (!content && !title) return;
  }
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
}
function saveLink(url, title, favicon) {
  if (!url.startsWith('http')) url = 'https://' + url;
  try { new URL(url); } catch { toast('Invalid URL'); return; }
  const host = new URL(url).hostname;
  S.links.unshift({
    id: 'l' + Date.now(),
    url, title: title || host.replace('www.',''),
    host,
    favicon: favicon || `https://www.google.com/s2/favicons?sz=64&domain=${host}`,
    savedAt: Date.now()
  });
  saveLinks(); renderAll(); toast('Link saved 🔗');
}
function renderLinksGrid(container, links, compact) {
  if (!links.length) {
    container.innerHTML = '<div class="empty-msg"><strong>No links saved</strong>Save tabs using the button above or the popup</div>';
    return;
  }
  const emMap = { youtube:'🎥', instagram:'📸', linkedin:'💼', twitter:'🐦', x:'🐦', github:'⚡', notion:'📝', figma:'🎨', tiktok:'🎵', dribbble:'🎨', pinterest:'📌', spotify:'🎵' };
  container.innerHTML = links.slice(0, compact ? 4 : 999).map(lk => {
    const em = Object.entries(emMap).find(([k]) => lk.host.includes(k))?.[1] || '🌐';
    const saved = compact ? fmtTime(lk.savedAt) : new Date(lk.savedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    return `<div class="link-card">
      <div class="lc-thumb">
        <img src="${lk.favicon}" onerror="this.style.display='none'" alt="">
        <span class="lc-domain-em">${em}</span>
        <span class="lc-time">${saved}</span>
      </div>
      <div class="lc-body">
        <div class="lc-header">
          <img class="lc-favicon" src="${lk.favicon}" onerror="this.style.display='none'" alt="">
          <span class="lc-host">${lk.host.replace('www.','')}</span>
          <span class="lc-menu">⋮</span>
        </div>
        <div class="lc-title">${esc(lk.title)}</div>
        <div class="lc-saved">Saved ${saved}</div>
        <div class="lc-actions">
          <button class="lc-btn" data-laction="open" data-lid="${lk.id}">Open ↗</button>
          <button class="lc-btn" data-laction="copy" data-lid="${lk.id}">Copy</button>
          <button class="lc-btn danger" data-laction="del" data-lid="${lk.id}">Delete</button>
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
  const g = document.getElementById('pinned-grid');
  const pinned = S.notes.filter(n => n.pinned);
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
  S.theme = id;
  document.documentElement.dataset.theme = id;
  document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.tid === id));
  if (save) { localStorage.setItem('sv_theme', id); toast('Theme applied ✨'); }
}

/* ══════════════════════════════════════
   SETTINGS
══════════════════════════════════════ */
function setupSettings() {
  document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Delete all notes and links? Cannot be undone.')) return;
    S.notes = []; S.links = []; save(); renderAll();
    toast('Data cleared');
  });
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
  return d.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'}) + ' · ' +
         d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}
function fmtTime(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return Math.floor(d/60000) + 'm ago';
  if (d < 86400000) return Math.floor(d/3600000) + 'h ago';
  if (d < 172800000) return 'Yesterday';
  const dt = new Date(ts);
  return `${dt.getDate()} ${dt.toLocaleString('default',{month:'short'})}, ${dt.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
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

