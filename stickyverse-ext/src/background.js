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

// ─── Water Reminder Background Scheduler ──────────────────────────────────────

const broadcastToNewTabs = (message) => {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({}, (tabs) => {
      console.log('StickyVerse Background: Broadcasting message to', tabs.length, 'tabs:', message);
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message)
            .then(() => {
              console.log('StickyVerse Background: Successfully sent message to tab', tab.id, tab.url);
            })
            .catch((err) => {
              // This is normal for system tabs, background tabs, etc.
              console.log('StickyVerse Background: Skipped sending to tab', tab.id, 'Url:', tab.url, 'Reason:', err.message);
            });
        }
      });
    });
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_WATER_REMINDER') {
    const { enabled, interval } = message;
    
    chrome.storage.local.set({
      water_reminder_enabled: enabled,
      water_reminder_interval: interval
    }).then(() => {
      console.log('Water reminder settings saved:', enabled, interval);
      
      if (enabled) {
        chrome.alarms.clear('water_reminder').then(() => {
          chrome.alarms.create('water_reminder', { periodInMinutes: Number(interval) });
          console.log('Alarms created for water_reminder every', interval, 'minutes');
          
          // Show initial confirmation banner
          chrome.notifications.create('water_reminder_active', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon128.png'),
            title: '💧 Water Reminder Active!',
            message: `We will remind you to drink water every ${interval} minutes.`,
            priority: 2
          }, (id) => {
            if (chrome.runtime.lastError) {
              console.error('Initial Notification Error:', chrome.runtime.lastError.message);
            } else {
              console.log('Initial notification displayed with ID:', id);
            }
          });

          // Fallback visual toast
          broadcastToNewTabs({
            type: 'SHOW_WATER_TOAST',
            title: '💧 Water Reminder Active!',
            body: `We will remind you to drink water every ${interval} minutes.`
          });
        });
      } else {
        chrome.alarms.clear('water_reminder');
        console.log('Alarms cleared for water_reminder');
      }
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Failed to update water reminder:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // async callback
  }
});

// Alarm Listener for water reminder and notes reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm fired:', alarm.name);
  if (alarm.name === 'water_reminder') {
    chrome.notifications.create('water_reminder_alert_' + Date.now(), {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: '💧 Stay Hydrated!',
      message: "Time to drink some water and take a quick stretch break.",
      priority: 2
    }, (id) => {
      if (chrome.runtime.lastError) {
        console.error('Alarm Notification Error:', chrome.runtime.lastError.message);
      } else {
        console.log('Alarm notification displayed with ID:', id);
      }
    });

    // Fallback visual toast
    broadcastToNewTabs({
      type: 'SHOW_WATER_TOAST',
      title: '💧 Stay Hydrated!',
      body: "Time to drink some water and take a quick stretch break."
    });
  } else if (alarm.name === 'notes_reminder_checker') {
    checkNotesReminders();
  }
});

// Function to check notes reminders in background
function checkNotesReminders() {
  chrome.storage.local.get(['sv_notes'], (res) => {
    if (!res.sv_notes || !Array.isArray(res.sv_notes)) return;

    const now = Date.now();
    let hasUpdates = false;

    const updatedNotes = res.sv_notes.map(note => {
      if (note.reminder && !note.reminderTriggered) {
        const remTime = new Date(note.reminder).getTime();
        if (remTime <= now) {
          // Trigger browser notification
          chrome.notifications.create('note_reminder_' + note.id + '_' + now, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon128.png'),
            title: `⏰ Reminder: ${note.title || 'StickyVerse Task'}`,
            message: note.content || 'Your scheduled reminder has arrived!',
            priority: 2
          });
          hasUpdates = true;
          return { ...note, reminderTriggered: true, updated: now };
        }
      }
      return note;
    });

    if (hasUpdates) {
      chrome.storage.local.set({ sv_notes: updatedNotes }).then(() => {
        broadcastToNewTabs({
          type: 'NOTES_UPDATED_BACKGROUND',
          notes: updatedNotes
        });
      });
    }
  });
}

// Restore and initialize alarms on startup/sw wake-up
chrome.storage.local.get(['water_reminder_enabled', 'water_reminder_interval']).then(res => {
  if (res.water_reminder_enabled) {
    chrome.alarms.clear('water_reminder').then(() => {
      chrome.alarms.create('water_reminder', { periodInMinutes: Number(res.water_reminder_interval || 120) });
      console.log('Water reminder alarm restored on SW startup.');
    });
  }
});

// Make sure notes reminder checker runs every 1 minute
chrome.alarms.get('notes_reminder_checker', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('notes_reminder_checker', { periodInMinutes: 1 });
    console.log('Notes reminder checker alarm created on SW startup.');
  }
});
