/* ══════════════════════════════════════
   CONTENT SCRIPT - Runs on localhost:3000
   Approach 4: Exponential backoff polling
   Never fires blindly on page load
══════════════════════════════════════ */

const SB_KEY_PREFIX = 'sb-';
const SB_KEY_SUFFIX = '-auth-token';
const MAX_BACKOFF_MS = 3000;
let sessionSent = false;

// Read session from cookies (@supabase/ssr stores here) with localStorage fallback
function readSessionFromStorage() {
  try {
    // Primary: cookies (used by @supabase/ssr createBrowserClient)
    const cookies = document.cookie.split(';').map(c => c.trim());
    const chunkKeys = cookies
      .map(c => c.split('=')[0])
      .filter(k => k.match(/^sb-.*-auth-token(\.\d+)?$/));

    if (chunkKeys.length > 0) {
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

    // Fallback: localStorage
    const key = Object.keys(localStorage).find(
      k => k.startsWith(SB_KEY_PREFIX) && k.endsWith(SB_KEY_SUFFIX)
    );
    if (key) {
      const parsed = JSON.parse(localStorage.getItem(key));
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
  } catch (e) {}
  return null;
}

// Send session to background with 3 retries
function sendSessionToBackground(session, attempt = 1) {
  if (sessionSent) return;
  chrome.runtime.sendMessage({ type: 'AUTH_SESSION', session }, (response) => {
    if (chrome.runtime.lastError) {
      if (attempt < 3) {
        setTimeout(() => sendSessionToBackground(session, attempt + 1), 500);
      }
      return;
    }
    if (response?.success) {
      sessionSent = true;
      console.log('StickyVerse: session delivered to extension');
    }
  });
}

// Exponential backoff poll: 50 → 100 → 200 → 400 → 800 → 1600 → 3000ms
function pollForSession(delay = 50) {
  if (sessionSent) return;
  const session = readSessionFromStorage();
  if (session) {
    sendSessionToBackground(session);
    return;
  }
  const next = Math.min(delay * 2, MAX_BACKOFF_MS);
  setTimeout(() => pollForSession(next), delay);
}

// Listen for Supabase auth state changes broadcast from webapp
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === 'STICKYVERSE_AUTH_CHANGED' && event.data.session) {
    sendSessionToBackground(event.data.session);
  }
});

// Also listen for BroadcastChannel events
try {
  const bc = new BroadcastChannel('supabase-auth');
  bc.onmessage = (event) => {
    if (event.data?.session) {
      sendSessionToBackground(event.data.session);
    }
  };
} catch (e) {}

// Start polling once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => pollForSession());
} else {
  pollForSession();
}

// On-demand: extension explicitly asks for session
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSession') {
    const session = readSessionFromStorage();
    if (session) {
      sendResponse({ session });
      return;
    }
    // Poll once more with short timeout
    let found = false;
    const interval = setInterval(() => {
      const s = readSessionFromStorage();
      if (s) {
        clearInterval(interval);
        found = true;
        sendResponse({ session: s });
      }
    }, 200);
    setTimeout(() => {
      if (!found) {
        clearInterval(interval);
        sendResponse({ session: null });
      }
    }, 3000);
    return true; // async
  }
});
