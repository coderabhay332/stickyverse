/* ══════════════════════════════════════
   EXTENSION BRIDGE - Webapp side
   Approach 1: Fire on onAuthStateChange,
   not on page load. Also broadcast via
   BroadcastChannel('supabase-auth').
══════════════════════════════════════ */

(function () {
  const bc = new BroadcastChannel('supabase-auth');

  function buildSession(session) {
    if (!session?.access_token || !session?.refresh_token) return null;
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: session.user
    };
  }

  function broadcastSession(session) {
    const s = buildSession(session);
    if (!s) return;
    // Broadcast via BroadcastChannel (background SW picks this up)
    bc.postMessage({ session: s });
    // Also postMessage for content script in same page
    window.postMessage({ type: 'STICKYVERSE_AUTH_CHANGED', session: s }, '*');
  }

  function readSession() {
    try {
      // @supabase/ssr stores session in cookies, not localStorage
      const cookies = document.cookie.split(';').map(c => c.trim());

      // Try chunked cookies: sb-<ref>-auth-token.0, .1, etc.
      const chunkKeys = cookies
        .map(c => c.split('=')[0])
        .filter(k => k.match(/^sb-.*-auth-token(\.\d+)?$/));

      if (chunkKeys.length > 0) {
        // Sort chunks and join
        const sorted = chunkKeys
          .filter(k => k.includes('.'))
          .sort();

        let raw = '';
        if (sorted.length > 0) {
          for (const key of sorted) {
            const match = cookies.find(c => c.startsWith(key + '='));
            if (match) raw += decodeURIComponent(match.split('=').slice(1).join('='));
          }
        } else {
          // Single cookie (no chunks)
          const match = cookies.find(c => c.startsWith(chunkKeys[0] + '='));
          if (match) raw = decodeURIComponent(match.split('=').slice(1).join('='));
        }

        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const session = parsed?.session || parsed;
        if (session?.access_token && session?.refresh_token) return session;
      }

      // Fallback: localStorage (some Supabase configs still use it)
      const lsKey = Object.keys(localStorage).find(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (lsKey) {
        const parsed = JSON.parse(localStorage.getItem(lsKey));
        const session = parsed?.session || parsed;
        if (session?.access_token) return session;
      }

      return null;
    } catch (e) { return null; }
  }

  let lastToken = null;

  // Poll every 500ms — storage event doesn't fire in the SAME tab that writes it
  // so we must poll. Stops once session is found and broadcast.
  function startPolling() {
    const interval = setInterval(() => {
      const session = readSession();
      if (!session?.access_token) return;
      // Only broadcast if token changed (handles refresh too)
      if (session.access_token === lastToken) return;
      lastToken = session.access_token;
      broadcastSession(session);
    }, 500);

    // Keep polling indefinitely to catch token refreshes
    // (Supabase refreshes access_token silently)
  }

  // Start once DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPolling);
  } else {
    startPolling();
  }

  // Also respond to on-demand requests from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== 'STICKYVERSE_GET_SESSION') return;
    try {
      const session = readSession();
      window.postMessage({
        type: 'STICKYVERSE_SESSION_RESPONSE',
        session: buildSession(session)
      }, '*');
    } catch (e) {
      window.postMessage({ type: 'STICKYVERSE_SESSION_RESPONSE', session: null }, '*');
    }
  });
})();
