document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status
  let isAuthenticated = false;
  let currentUser = null;
  let noteCount = 0;
  let linkCount = 0;
  
  async function loadAndRender() {
    try {
      const result = await chrome.storage.local.get(['supabase_session', 'sv_notes', 'sv_links']);
      if (result.supabase_session) {
        currentUser = result.supabase_session.user;
        isAuthenticated = true;
      } else {
        currentUser = null;
        isAuthenticated = false;
      }
      const notes = result.sv_notes || [];
      const links = result.sv_links || [];
      noteCount = notes.filter(n => n.title !== '__sv_streaks__').length;
      linkCount = links.length;
      renderCounts();
    } catch (e) {
      console.log('No auth session found:', e);
    }
  }

  function renderCounts() {
    const noteEl = document.getElementById('note-count');
    const linkEl = document.getElementById('link-count');
    if (noteEl && linkEl) {
      if (isAuthenticated) {
        noteEl.textContent = `${noteCount} notes (synced)`;
        linkEl.textContent = `${linkCount} links (synced)`;
      } else {
        noteEl.textContent = `${noteCount} note${noteCount !== 1 ? 's' : ''}`;
        linkEl.textContent = `${linkCount} link${linkCount !== 1 ? 's' : ''}`;
      }
    }
  }

  // Approach 3: React to session changes without reopening popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.supabase_session) {
      loadAndRender();
    }
  });

  await loadAndRender();
  

  // Open workspace
  document.getElementById('open-workspace-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
    window.close();
  });

  // Save current tab
  document.getElementById('save-tab-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
        showToast('Cannot save this page', true);
        return;
      }
      try {
        const links = JSON.parse(localStorage.getItem('sv_links') || '[]');
        const host = new URL(tab.url).hostname;
        const newLink = {
          id: 'l' + Date.now(),
          url: tab.url,
          title: tab.title || host,
          host: host,
          favicon: tab.favIconUrl || `https://www.google.com/s2/favicons?sz=64&domain=${host}`,
          savedAt: Date.now()
        };
        links.unshift(newLink);
        localStorage.setItem('sv_links', JSON.stringify(links));
        document.getElementById('link-count').textContent = `${links.length} links`;
        showToast('✓ Saved to Link Vault!');
      } catch (e) {
        showToast('Error saving tab', true);
      }
    });
  });

  // Open settings
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    window.close();
  });

  function showToast(msg, isError = false) {
    const toast = document.getElementById('popup-toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (isError) toast.style.color = '#f87171';
    setTimeout(() => toast.classList.add('hidden'), 2500);
  }
});
