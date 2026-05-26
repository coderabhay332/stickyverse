# StickyVerse ✨

A beautiful Chrome Extension + Next.js Web App productivity workspace. StickyVerse replaces your browser's new tab page with a stunning dashboard for notes, bookmarks, goals, and productivity tracking.

**🌐 Live Web App:** https://peaceful-peony-58cb08.netlify.app

---

## Project Structure

```
stickyverse/
├── stickyverse-ext/     # Chrome Extension (Manifest V3)
└── stickyverse-web/     # Next.js 14 Web App
```

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed
- [Chrome Browser](https://www.google.com/chrome/) for extension testing
- A [Supabase](https://supabase.com/) account (free tier works)

---

## Web App Setup

```bash
cd stickyverse-web

# Install dependencies
npm install

# Start development server
npm run dev
```

**Production:** https://peaceful-peony-58cb08.netlify.app  
**Local Dev:** http://localhost:3000

### Web App Environment Variables

The `.env.local` is already configured with:

```
NEXT_PUBLIC_SUPABASE_URL=https://kzhovelxcwychkmykirc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl
```

---

## Chrome Extension Setup

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `stickyverse-ext` folder
5. The extension will now override your new tab page

### 2. Connect to Web (for Sync)

1. Visit https://peaceful-peony-58cb08.netlify.app
2. Sign in with your Google account
3. Open extension settings (click the extension icon → Settings)
4. The extension will auto-detect your login and connect

### 3. Test the Extension

- Open a new tab - StickyVerse dashboard should appear
- Check browser console for: `StickyVerse loaded as new tab override`

---

## Full Development Workflow

### Running Both Projects

```bash
# Terminal 1: Start web app
cd stickyverse-web
npm run dev

# Terminal 2: Extension loads automatically via Chrome
# Just open new tabs to test
```

### Sync Between Extension and Web

1. Sign in on the web app at `http://localhost:3000`
2. Visit the Dashboard and click "Connect Extension"
3. The extension will automatically sync your Supabase session
4. Data syncs seamlessly between extension and web

---

## Build for Production

### Web App

```bash
cd stickyverse-web
npm run build
```

Output is in `dist/` - deploy to Vercel, Netlify, or any static host.

### Extension

The extension is ready to use as-is. To publish:

1. Zip the `stickyverse-ext` folder
2. Upload to Chrome Web Store Developer Dashboard

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| New tab shows blank | Check console for errors; verify manifest.json is valid |
| Web app won't start | Delete `node_modules` and run `npm install` again |
| Extension not loading | Disable other new tab extensions; restart Chrome |
| Auth not syncing | Ensure you're on `localhost:3000` when signing in |

---

## Tech Stack

- **Extension**: Vanilla JS, Manifest V3, Chrome APIs
- **Web App**: Next.js 14, TypeScript, Tailwind CSS, Supabase Auth
- **Backend**: Supabase (PostgreSQL + Realtime)

---

## Features

- **Notes**: Create, edit, color-code, pin, star, archive
- **Link Vault**: Save URLs with favicons, search/filter
- **Goals**: Track with progress bars, categories, priorities
- **Pomodoro Timer**: Built-in focus timer
- **Reading List**: Save articles to read later
- **Vision Board**: Visualize your aspirations
- **Themes**: 8 beautiful themes (Dark, Cyber, Ocean, etc.)
- **Cloud Sync**: Supabase sync for logged-in users

---

## License

MIT
