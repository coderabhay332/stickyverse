// Background service worker for StickyVerse Chrome Extension

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_SESSION') {
    // Store Supabase session from content script
    chrome.storage.local.set({ supabase_session: message.session })
      .then(() => {
        console.log('Session stored in background:', message.session?.user?.email);
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Failed to store session:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'GET_SESSION') {
    // Retrieve stored session
    chrome.storage.local.get(['supabase_session'])
      .then(result => {
        sendResponse({ session: result.supabase_session || null });
      })
      .catch(error => {
        console.error('Failed to get session:', error);
        sendResponse({ session: null, error: error.message });
      });
    return true;
  }
  
  if (message.type === 'CLEAR_SESSION') {
    // Clear stored session
    chrome.storage.local.remove(['supabase_session'])
      .then(() => {
        console.log('Session cleared');
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Failed to clear session:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('StickyVerse extension installed');
    
    // Set default values
    chrome.storage.local.set({
      sv_theme: 'void',
      sv_wallpaper: 'none',
      sv_idc: '0'
    });
    
    // Open new tab on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
  } else if (details.reason === 'update') {
    console.log('StickyVerse extension updated');
  }
});

// Handle extension icon click - open StickyVerse workspace in a single tab (reuse if open)
chrome.action.onClicked.addListener(() => {
  const targetUrl = chrome.runtime.getURL('newtab.html');
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find(tab => tab.url === targetUrl || tab.url?.startsWith(targetUrl));
    if (existingTab) {
      chrome.tabs.update(existingTab.id, { active: true });
      chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
  });
});

// Listen for tab updates to handle OAuth callback
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Handle OAuth callback
    if (tab.url.includes('access_token=') && tab.url.includes('refresh_token=')) {
      // Extract tokens from URL and send to newtab page
      chrome.tabs.sendMessage(tabId, {
        type: 'OAUTH_CALLBACK',
        url: tab.url
      });
    }
  }
});
