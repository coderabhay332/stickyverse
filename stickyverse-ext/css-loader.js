// Dynamically attach the compiled Tailwind CSS using a safe, absolute extension URL
(function attachTailwindCss() {
  try {
    var href = chrome.runtime.getURL('dist/styles.css');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    // Optional: log for debugging
    console.log('[StickyVerse] Loaded CSS:', href);
  } catch (e) {
    console.warn('[StickyVerse] Failed to load CSS:', e);
  }
})();
