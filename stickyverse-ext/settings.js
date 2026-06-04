/* ══════════════════════════════════════
   SETTINGS PAGE - Auth & Sync Management
══════════════════════════════════════ */

// Initialize
// Note: supabase is declared globally by supabase.min.js, using window.supabaseClient for client instance
let currentUser = null;
let pollInterval = null;
let isConnected = false;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase
  initSupabase();
  
  // Check for token in URL (from website redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  
  if (urlToken) {
    await handleConnectWithToken(urlToken);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  // Check for existing saved session first
  const hasSession = await checkSession();
  
  // If not connected, try auto-detecting from website
  if (!hasSession) {
    await autoDetectWebsiteSession();
  }
  
  // Setup event listeners
  setupEventListeners();
  
  const WEB_URL = 'https://peaceful-peony-58cb08.netlify.app';
  
  // Listen for tab updates (user logs in on website)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ((tab.url?.includes('localhost:3000') || tab.url?.includes('peaceful-peony-58cb08.netlify.app')) && changeInfo.status === 'complete') {
      // Tab refreshed or navigated, check for session
      if (!isConnected) {
        setTimeout(() => autoDetectWebsiteSession(), 500);
      }
    }
  });
  
  // Listen for tab activation (user switches to website tab)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if ((tab.url?.includes('localhost:3000') || tab.url?.includes('peaceful-peony-58cb08.netlify.app')) && !isConnected) {
      setTimeout(() => autoDetectWebsiteSession(), 500);
    }
  });
  
  // Check when window gets focus (user returns to settings)
  window.addEventListener('focus', () => {
    if (!isConnected) {
      autoDetectWebsiteSession();
    }
  });
  
  // Start continuous polling (faster initially, then slower)
  startPolling();
});

function startPolling() {
  // Clear any existing interval
  if (pollInterval) clearInterval(pollInterval);
  
  let attempts = 0;
  const maxFastAttempts = 20; // Fast polling for ~20 seconds
  
  pollInterval = setInterval(async () => {
    if (isConnected) {
      clearInterval(pollInterval);
      return;
    }
    
    attempts++;
    await autoDetectWebsiteSession();
    
    // After fast polling period, slow down
    if (attempts >= maxFastAttempts) {
      clearInterval(pollInterval);
      pollInterval = setInterval(() => {
        if (!isConnected) autoDetectWebsiteSession();
      }, 5000); // Slower polling after initial period
    }
  }, 1000); // Check every second initially
}

async function autoDetectWebsiteSession() {
  if (isConnected) return;
  
  const WEB_URL = 'https://peaceful-peony-58cb08.netlify.app';
  
  try {
    // Query any tab that has the website open (localhost or production)
    const localTabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    const prodTabs = await chrome.tabs.query({ url: 'https://peaceful-peony-58cb08.netlify.app/*' });
    const tabs = [...localTabs, ...prodTabs];

    if (tabs.length === 0) {
      updateConnectStatus(`Open ${WEB_URL} and sign in to connect`);
      return;
    }

    // Ask the content script in that tab for the session
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSession' });

    if (response?.session) {
      isConnected = true;
      if (pollInterval) clearInterval(pollInterval);
      await handleConnectWithToken(btoa(JSON.stringify(response.session)));
    } else {
      updateConnectStatus(`Not signed in on website. Sign in at ${WEB_URL}`);
    }
  } catch (err) {
    // Content script not ready or no response - this is normal
    console.log('Waiting for content script...');
  }
}

function updateConnectStatus(text) {
  const statusEl = document.getElementById('connect-status');
  if (statusEl) {
    statusEl.textContent = text;
  }
}

async function checkSession() {
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    
    if (result.supabase_session) {
      const { data, error } = await window.supabaseClient.auth.setSession({
        access_token: result.supabase_session.access_token,
        refresh_token: result.supabase_session.refresh_token
      });
      
      if (!error && data.session) {
        currentUser = data.session.user;
        isConnected = true;
        showLoggedInState();
        return true; // Already connected
      }
    }
    
    showLoggedOutState();
    return false; // Not connected
  } catch (error) {
    console.error('Error checking session:', error);
    showLoggedOutState();
    return false;
  }
}

function setupEventListeners() {
  // Disconnect button
  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', handleDisconnect);
  }
  
  // Sync button
  const syncBtn = document.getElementById('sync-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', handleForceSync);
  }
  
  // Web link
  const WEB_URL = 'https://peaceful-peony-58cb08.netlify.app';
  const webLink = document.getElementById('web-link');
  if (webLink) {
    webLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: `${WEB_URL}/dashboard` });
    });
    // Update link text to show production URL
    webLink.textContent = WEB_URL;
  }
}

async function handleConnectWithToken(token) {
  // Show loading state
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.className = 'mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300';
    messageEl.textContent = 'Connecting from website...';
  }
  
  try {
    // Decode the token
    const sessionData = JSON.parse(atob(token));
    
    if (!sessionData.access_token || !sessionData.refresh_token) {
      throw new Error('Invalid token format');
    }
    
    // Set the session in Supabase
    const { data, error } = await window.supabaseClient.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token
    });
    
    if (error) throw error;
    
    if (data.session) {
      // Save to chrome storage
      await chrome.storage.local.set({
        supabase_session: {
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
          expires_at: sessionData.expires_at,
          user: sessionData.user
        }
      });
      
      currentUser = data.session.user;
      
      showLoggedInState();
      showMessage('Connected successfully from website!', 'success');
    }
  } catch (error) {
    console.error('Connection error:', error);
    showMessage('Failed to connect. Please try again from the website.', 'error');
  }
}

async function handleDisconnect() {
  if (!confirm('Are you sure? Your local data will not be deleted, but sync will stop.')) {
    return;
  }
  
  try {
    // Sign out from Supabase
    await window.supabaseClient.auth.signOut();
    
    // Clear from chrome storage
    await chrome.storage.local.remove(['supabase_session']);
    
    currentUser = null;
    isConnected = false;
    
    showLoggedOutState();
    showMessage('Disconnected successfully', 'success');
    
    // Restart polling
    startPolling();
  } catch (error) {
    console.error('Disconnect error:', error);
    showMessage('Error disconnecting', 'error');
  }
}

async function handleForceSync() {
  const syncBtn = document.getElementById('sync-btn');
  syncBtn.disabled = true;
  syncBtn.textContent = 'Syncing...';
  
  try {
    // Trigger sync from newtab.js
    await chrome.runtime.sendMessage({ action: 'forceSync' });
    showMessage('Sync completed!', 'success');
  } catch (error) {
    console.error('Sync error:', error);
    showMessage('Sync failed. Check your connection.', 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = 'Force Sync Now';
  }
}

function showLoggedInState() {
  // Hide connect section
  const connectSection = document.getElementById('connect-section');
  if (connectSection) connectSection.classList.add('hidden');
  
  // Show logged in sections
  const loggedInSection = document.getElementById('logged-in-section');
  const syncSection = document.getElementById('sync-section');
  const actionsSection = document.getElementById('actions-section');
  if (loggedInSection) loggedInSection.classList.remove('hidden');
  if (syncSection) syncSection.classList.remove('hidden');
  if (actionsSection) actionsSection.classList.remove('hidden');
  
  // Update user info
  if (currentUser) {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    
    avatarEl.textContent = currentUser.user_metadata?.full_name?.[0]?.toUpperCase() || 
                           currentUser.email?.[0]?.toUpperCase() || '?';
    nameEl.textContent = currentUser.user_metadata?.full_name || 'User';
    emailEl.textContent = currentUser.email;
  }
  
  // Clear any messages
  const messageEl = document.getElementById('message');
  if (messageEl) messageEl.innerHTML = '';
}

function showLoggedOutState() {
  // Show connect section
  const connectSection = document.getElementById('connect-section');
  if (connectSection) connectSection.classList.remove('hidden');
  
  // Hide logged in sections
  const loggedInSection = document.getElementById('logged-in-section');
  const syncSection = document.getElementById('sync-section');
  const actionsSection = document.getElementById('actions-section');
  if (loggedInSection) loggedInSection.classList.add('hidden');
  if (syncSection) syncSection.classList.add('hidden');
  if (actionsSection) actionsSection.classList.add('hidden');
}

function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  if (!messageEl) {
    console.log(`[settings] ${type || 'info'}: ${text}`);
    return;
  }
  messageEl.textContent = text;
  if (type === 'success') {
    messageEl.className = 'mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300';
  } else if (type === 'error') {
    messageEl.className = 'mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300';
  } else {
    messageEl.className = 'mt-3 p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white/70';
  }
  if (messageEl.classList) messageEl.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (!messageEl) return;
    messageEl.textContent = '';
    messageEl.className = 'hidden';
  }, 5000);
}
