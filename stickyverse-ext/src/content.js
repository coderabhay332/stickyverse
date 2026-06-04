// Content script for StickyVerse Chrome Extension
// Runs on localhost:3000 and production website to detect Supabase sessions

console.log('StickyVerse content script loaded');

// Function to extract Supabase session from cookies
function getSessionFromCookies() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const chunkKeys = cookies
      .map(c => c.split('=')[0])
      .filter(k => k.match(/^sb-.*-auth-token(\.\d+)?$/));

    if (chunkKeys.length > 0) {
      // Sort chunk keys and merge them
      const sorted = chunkKeys.filter(k => k.includes('.')).sort();
      let raw = '';
      if (sorted.length > 0) {
        for (const key of sorted) {
          const match = cookies.find(c => c.startsWith(key + '='));
          if (match) raw += decodeURIComponent(match.split('=').slice(1).join('='));
        }
      } else {
        const match = cookies.find(c => c.startsWith(chunkKeys[0] + '='));
        if (match) raw = decodeURIComponent(match.split('=').slice(1).join('='));
      }
      
      if (raw) {
        const parsed = JSON.parse(raw);
        const session = parsed?.session || parsed;
        if (session?.access_token && session?.refresh_token) {
          return {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user
          };
        }
      }
    }
  } catch (error) {
    console.log('Failed to parse cookies:', error);
  }
  return null;
}

// Function to extract session from localStorage
function getSessionFromLocalStorage() {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        const tokenData = JSON.parse(localStorage.getItem(key));
        if (tokenData.access_token && tokenData.refresh_token) {
          return {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_at,
            user: tokenData.user
          };
        }
      }
    }
  } catch (error) {
    console.log('Failed to read localStorage:', error);
  }
  return null;
}

// Function to send session to background script
async function sendSessionToBackground(session) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'AUTH_SESSION',
      session: session
    });
    
    if (response.success) {
      console.log('Session sent to background successfully');
    } else {
      console.error('Failed to send session to background:', response.error);
    }
  } catch (error) {
    console.error('Error sending session to background:', error);
  }
}

// Main session detection logic
async function detectAndSendSession() {
  let session = null;
  
  // Try cookies first (primary method for @supabase/ssr)
  session = getSessionFromCookies();
  
  // Fallback to localStorage
  if (!session) {
    session = getSessionFromLocalStorage();
  }
  
  if (session) {
    console.log('Session detected:', session.user?.email);
    await sendSessionToBackground(session);
  } else {
    console.log('No session found in cookies/localStorage, requesting from page...');
    window.postMessage({ type: 'STICKYVERSE_GET_SESSION' }, '*');
  }
}

// Listen for messages from popup or newtab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSession') {
    // Get current session and send back
    let session = getSessionFromCookies() || getSessionFromLocalStorage();
    sendResponse({ session });
    return true;
  }
  
  if (message.type === 'DETECT_SESSION') {
    detectAndSendSession().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Listen for Supabase auth state changes broadcast from webapp
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === 'STICKYVERSE_AUTH_CHANGED' && event.data.session) {
    console.log('Detected STICKYVERSE_AUTH_CHANGED from window message, sending to background...');
    sendSessionToBackground(event.data.session);
  }
  if (event.data?.type === 'STICKYVERSE_SESSION_RESPONSE') {
    if (event.data.session) {
      console.log('Detected STICKYVERSE_SESSION_RESPONSE from window message, sending to background...');
      sendSessionToBackground(event.data.session);
    } else {
      console.log('STICKYVERSE_SESSION_RESPONSE returned empty session');
    }
  }
});

// Also listen for BroadcastChannel events
try {
  const bc = new BroadcastChannel('supabase-auth');
  bc.onmessage = (event) => {
    if (event.data?.session) {
      console.log('Detected session via BroadcastChannel, sending to background...');
      sendSessionToBackground(event.data.session);
    }
  };
} catch (e) {
  console.log('BroadcastChannel not supported in content script');
}

// Initial session detection
detectAndSendSession();

// Set up periodic checking (every 30 seconds)
setInterval(detectAndSendSession, 30000);

// Listen for storage changes (for real-time updates)
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('sb-') && e.key.includes('-auth-token')) {
    console.log('Auth storage changed, detecting new session...');
    setTimeout(detectAndSendSession, 1000);
  }
});

// Listen for Supabase auth events (if Supabase is available on the page)
if (window.supabase) {
  window.supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      console.log('Supabase auth state changed: SIGNED_IN');
      sendSessionToBackground({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user
      });
    } else if (event === 'SIGNED_OUT') {
      console.log('Supabase auth state changed: SIGNED_OUT');
      chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' });
    }
  });
}
