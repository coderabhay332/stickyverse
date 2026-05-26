/* ══════════════════════════════════════
   BACKGROUND SERVICE WORKER
   Approach 2: Central session store
══════════════════════════════════════ */

// Approach 2: Listen for AUTH_SESSION from content script (primary)
// and legacy saveSession action (fallback)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // Primary auth handler — content script sends this
  if (request.type === 'AUTH_SESSION' && request.session) {
    chrome.storage.local.set({ supabase_session: request.session }, () => {
      console.log('StickyVerse: session saved for', request.session.user?.email);
      sendResponse({ success: true });
    });
    return true;
  }

  // Legacy handler
  if (request.action === 'saveSession' && request.session) {
    chrome.storage.local.set({ supabase_session: request.session }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'forceSync') {
    chrome.runtime.sendMessage({ action: 'syncData' });
    sendResponse({ success: true });
  }
  
  if (request.action === 'saveLink') {
    saveLink(request.data);
    sendResponse({ success: true });
  }

  if (request.action === 'clearSession') {
    chrome.storage.local.remove('supabase_session', () => {
      sendResponse({ success: true });
    });
    return true;
  }

  return true;
});

// Approach 2 fallback: BroadcastChannel from service worker
// Catches auth events even if content script message fails
try {
  const bc = new BroadcastChannel('supabase-auth');
  bc.onmessage = (event) => {
    if (event.data?.session) {
      chrome.storage.local.set({ supabase_session: event.data.session }, () => {
        console.log('StickyVerse: session saved via BroadcastChannel');
      });
    }
  };
} catch (e) {
  console.log('BroadcastChannel not supported in this SW context');
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('StickyVerse installed');
    // Open settings page on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  }
});

async function saveLink(linkData) {
  try {
    // Get existing links from chrome storage
    const result = await chrome.storage.local.get(['sv_links']);
    const links = result.sv_links || [];
    
    // Add new link
    links.unshift({
      ...linkData,
      id: 'l' + Date.now(),
      savedAt: Date.now()
    });
    
    // Save back
    await chrome.storage.local.set({ sv_links: links });
    
    // Also sync to Supabase if user is authenticated
    await syncLinkToCloud(linkData);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving link:', error);
    return { success: false, error: error.message };
  }
}

async function syncLinkToCloud(linkData) {
  try {
    // Check if user is authenticated
    const result = await chrome.storage.local.get(['supabase_session']);
    if (!result.supabase_session) return;
    
    // The actual sync will be handled by newtab.js which has Supabase loaded
    // This is just a placeholder for future background sync implementation
    console.log('Link queued for cloud sync:', linkData.url);
  } catch (error) {
    console.error('Cloud sync error:', error);
  }
}
