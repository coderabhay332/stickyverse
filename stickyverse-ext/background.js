/* ══════════════════════════════════════
   BACKGROUND SERVICE WORKER
══════════════════════════════════════ */

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'forceSync') {
    // Trigger sync from newtab
    chrome.runtime.sendMessage({ action: 'syncData' });
    sendResponse({ success: true });
  }
  
  if (request.action === 'saveLink') {
    // Save link from context menu or shortcut
    saveLink(request.data);
    sendResponse({ success: true });
  }
  
  return true; // Keep channel open for async
});

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
