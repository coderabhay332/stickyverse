/* ══════════════════════════════════════
   SETTINGS PAGE - Auth & Sync Management
══════════════════════════════════════ */

// Initialize
let supabase = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase
  supabase = initSupabase();
  
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
});

async function autoDetectWebsiteSession() {
  try {
    showMessage('Checking if you\'re logged in on the website...', 'info');
    
    // Query any tab that has localhost:3000 open
    const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    
    if (tabs.length === 0) {
      // No website tab open — silently clear message, user can paste manually
      showMessage('', '');
      return;
    }
    
    // Ask the content script in that tab for the session
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSession' });
    
    if (response?.session) {
      await handleConnectWithToken(btoa(JSON.stringify(response.session)));
    } else {
      showMessage('Not logged in on website. Sign in at localhost:3000 first, or paste token manually.', 'error');
    }
  } catch (err) {
    // Content script not ready yet or tab issue — fail silently
    console.log('Auto-detect skipped:', err.message);
    showMessage('', '');
  }
}

async function checkSession() {
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    
    if (result.supabase_session) {
      const { data, error } = await supabase.auth.setSession({
        access_token: result.supabase_session.access_token,
        refresh_token: result.supabase_session.refresh_token
      });
      
      if (!error && data.session) {
        currentUser = data.session.user;
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
  // Connect button
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.addEventListener('click', handleConnect);
  }
  
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
  const webLink = document.getElementById('web-link');
  if (webLink) {
    webLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    });
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
    const { data, error } = await supabase.auth.setSession({
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

async function handleConnect() {
  const tokenInput = document.getElementById('auth-token');
  const messageEl = document.getElementById('message');
  const connectBtn = document.getElementById('connect-btn');
  
  const token = tokenInput.value.trim();
  
  if (!token) {
    showMessage('Please paste your auth token', 'error');
    return;
  }
  
  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';
  
  try {
    // Decode the token
    const sessionData = JSON.parse(atob(token));
    
    if (!sessionData.access_token || !sessionData.refresh_token) {
      throw new Error('Invalid token format');
    }
    
    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
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
      
      showMessage('Connected successfully!', 'success');
      
      setTimeout(() => {
        showLoggedInState();
        tokenInput.value = '';
      }, 1500);
    }
  } catch (error) {
    console.error('Connection error:', error);
    showMessage('Invalid token. Please copy it again from the website.', 'error');
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect Account';
  }
}

async function handleDisconnect() {
  if (!confirm('Are you sure? Your local data will not be deleted, but sync will stop.')) {
    return;
  }
  
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear from chrome storage
    await chrome.storage.local.remove(['supabase_session']);
    
    currentUser = null;
    
    showLoggedOutState();
    showMessage('Disconnected successfully', 'success');
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
  document.getElementById('connect-section').classList.add('hidden');
  
  // Show logged in sections
  document.getElementById('logged-in-section').classList.remove('hidden');
  document.getElementById('sync-section').classList.remove('hidden');
  document.getElementById('actions-section').classList.remove('hidden');
  
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
  document.getElementById('connect-section').classList.remove('hidden');
  
  // Hide logged in sections
  document.getElementById('logged-in-section').classList.add('hidden');
  document.getElementById('sync-section').classList.add('hidden');
  document.getElementById('actions-section').classList.add('hidden');
}

function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  if (type === 'success') {
    messageEl.className = 'mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300';
  } else if (type === 'error') {
    messageEl.className = 'mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300';
  } else {
    messageEl.className = 'mt-3 p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white/70';
  }
  messageEl.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'hidden';
  }, 5000);
}
