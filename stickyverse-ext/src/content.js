// Content script for StickyVerse Chrome Extension
// Runs on all websites to show background water reminders, 
// and on specific target websites (localhost/production) to sync Supabase sessions.

console.log('StickyVerse content script initialized on:', window.location.hostname);

const isTargetSite = window.location.hostname.includes('localhost') || 
                     window.location.hostname.includes('127.0.0.1') || 
                     window.location.hostname.includes('peaceful-peony-58cb08.netlify.app');

if (isTargetSite) {
  console.log('StickyVerse content script loaded for session detection');
}

// ─── Supabase Session Detection (Target Sites Only) ───────────────────────────

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
    
    if (response && response.success) {
      console.log('Session sent to background successfully');
    } else {
      console.error('Failed to send session to background:', response ? response.error : 'No response');
    }
  } catch (error) {
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.log('StickyVerse: Extension context invalidated (Extension reloaded or updated). Please refresh the tab to reconnect.');
    } else {
      console.error('Error sending session to background:', error);
    }
  }
}

// Main session detection logic
async function detectAndSendSession() {
  if (!isTargetSite) return;
  
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

// Initialize session detection if applicable
if (isTargetSite) {
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
        try {
          chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' });
        } catch (e) {
          if (e.message && e.message.includes('Extension context invalidated')) {
            console.log('StickyVerse: Extension context invalidated on SIGNED_OUT.');
          } else {
            console.error('Failed to send CLEAR_SESSION message:', e);
          }
        }
      }
    });
  }
}

// ─── Custom DOM Toast Notification for Water Reminders (All Sites) ────────────

function showAestheticToast(emoji, title, body) {
  // Check if style tag already exists, if not create it
  let styleTag = document.getElementById('sv-toast-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'sv-toast-styles';
    styleTag.innerHTML = `
      @keyframes svSlideIn {
        from { transform: translateY(40px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes svSlideOut {
        from { transform: translateY(0) scale(1); opacity: 1; }
        to { transform: translateY(40px) scale(0.95); opacity: 0; }
      }
      .sv-toast-close:hover {
        color: #fff !important;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(styleTag);
  }

  // Remove any existing toast
  const existing = document.getElementById('sv-water-toast');
  if (existing) {
    existing.remove();
  }

  // Create the toast container
  const toast = document.createElement('div');
  toast.id = 'sv-water-toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.width = '320px';
  toast.style.background = 'rgba(30, 27, 75, 0.95)';
  toast.style.border = '1px solid rgba(139, 92, 246, 0.3)';
  toast.style.borderRadius = '16px';
  toast.style.padding = '16px';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.2)';
  toast.style.display = 'flex';
  toast.style.gap = '12px';
  toast.style.zIndex = '999999999'; // High z-index to stay on top
  toast.style.color = '#fff';
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.webkitBackdropFilter = 'blur(10px)';
  toast.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  toast.style.boxSizing = 'border-box';
  toast.style.animation = 'svSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';

  // Create elements inside the toast
  const iconSpan = document.createElement('span');
  iconSpan.innerText = emoji || '💧';
  iconSpan.style.fontSize = '24px';
  iconSpan.style.alignSelf = 'center';
  iconSpan.style.lineHeight = '1';

  const contentDiv = document.createElement('div');
  contentDiv.style.flex = '1';
  contentDiv.style.minWidth = '0';
  contentDiv.style.textAlign = 'left';

  const titleDiv = document.createElement('div');
  titleDiv.innerText = title;
  titleDiv.style.fontWeight = 'bold';
  titleDiv.style.fontSize = '14px';
  titleDiv.style.marginBottom = '2px';
  titleDiv.style.color = '#fff';
  titleDiv.style.lineHeight = '1.4';

  const bodyDiv = document.createElement('div');
  bodyDiv.innerText = body;
  bodyDiv.style.fontSize = '12.5px';
  bodyDiv.style.color = 'rgba(255, 255, 255, 0.7)';
  bodyDiv.style.lineHeight = '1.4';

  contentDiv.appendChild(titleDiv);
  contentDiv.appendChild(bodyDiv);

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '×';
  closeBtn.className = 'sv-toast-close';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'rgba(255, 255, 255, 0.4)';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.alignSelf = 'flex-start';
  closeBtn.style.padding = '0 4px';
  closeBtn.style.lineHeight = '1';
  closeBtn.style.outline = 'none';
  closeBtn.style.transition = 'all 0.2s';

  const dismissToast = () => {
    toast.style.animation = 'svSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  closeBtn.onclick = dismissToast;

  toast.appendChild(iconSpan);
  toast.appendChild(contentDiv);
  toast.appendChild(closeBtn);

  document.body.appendChild(toast);

  // Auto clear after 8 seconds
  const autoClear = setTimeout(() => {
    dismissToast();
  }, 8000);

  // Clear timeout if manually dismissed
  closeBtn.addEventListener('click', () => {
    clearTimeout(autoClear);
  });
}

// ─── Global Message Receiver (All Sites) ──────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSession') {
    if (!isTargetSite) return;
    let session = getSessionFromCookies() || getSessionFromLocalStorage();
    sendResponse({ session });
    return true;
  }
  
  if (message.type === 'DETECT_SESSION') {
    if (!isTargetSite) return;
    detectAndSendSession().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'SHOW_WATER_TOAST') {
    console.log('StickyVerse content script received SHOW_WATER_TOAST:', message);
    showAestheticToast('💧', message.title, message.body);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'SHOW_TOAST') {
    console.log('StickyVerse content script received SHOW_TOAST:', message);
    showAestheticToast('⏰', message.title, message.body);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'SHOW_POMODORO_TOAST') {
    console.log('StickyVerse content script received SHOW_POMODORO_TOAST:', message);
    showAestheticToast('🍅', message.title, message.body);
    sendResponse({ success: true });
    return true;
  }
});
