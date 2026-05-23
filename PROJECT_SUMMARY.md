# StickyVerse Extension + Website Setup

## Architecture Overview

```
┌─────────────────────┐          ┌──────────────────┐
│   Website           │          │   Supabase       │
│  (stickyverse-web)  │◄────────►│  (Auth + DB)     │
│  - Landing page     │          │                  │
│  - Google OAuth     │          │  URL: kzhovelx...│
│  - Dashboard        │          │  Schema applied  │
└──────────┬──────────┘          └──────────────────┘
           │
           │  "Connect Extension" - generates token
           ▼
┌─────────────────────┐
│   Chrome Extension  │
│  (stickyverse-ext)  │
│  - Settings page    │
│  - Paste token      │
│  - chrome.storage   │
└─────────────────────┘
```

## What Was Created

### 1. Website (`stickyverse-web/`)
- **Landing page** - Beautiful gradient design with features
- **Auth page** - Google OAuth via Supabase
- **Dashboard** - User dashboard with extension connection
- **API routes** - Extension token generation

### 2. Extension Updates (`stickyverse-ext/`)
- **settings.html** - Auth management page
- **settings.js** - Token handling & session management
- **background.js** - Service worker for sync
- **manifest.json** - Updated with permissions & resources
- **popup.html/js** - Added Settings button

## Setup Instructions

### Website Setup

```bash
cd stickyverse-web
npm install
npm run dev
```

Then enable Google OAuth in Supabase:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add redirect URL: `http://localhost:3000/auth/callback`

### Extension Setup

1. Open Chrome → Extensions → Developer Mode ON
2. Load unpacked → Select `stickyverse-ext` folder
3. Open extension → Click "Settings & Sync"
4. Click link to open website

## Auth Flow

```
1. User visits website → Signs in with Google
2. User clicks "Connect Extension" on Dashboard
3. Website generates token with session data
4. User copies token
5. User pastes token in Extension Settings
6. Extension validates and stores session
7. Data syncs between web and extension
```

## File Structure

```
stickyverse-extension/
├── stickyverse-web/              # Next.js website
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/page.tsx         # Sign in
│   │   ├── auth/callback/        # OAuth callback
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   └── api/auth/             # API routes
│   ├── lib/
│   │   ├── supabase-client.ts    # Browser client
│   │   └── supabase-server.ts    # Server client
│   └── .env.local                # Supabase credentials
│
└── stickyverse-ext/              # Chrome extension
    ├── manifest.json              # Updated config
    ├── settings.html              # Auth management
    ├── settings.js                # Token handler
    ├── background.js              # Service worker
    ├── popup.html                 # Added settings btn
    ├── popup.js                   # Settings handler
    ├── supabase-config.js         # Updated URL/key
    └── ... (existing files)
```

## Environment Variables (Already Set)

```env
NEXT_PUBLIC_SUPABASE_URL=https://kzhovelxcwychkmykirc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl
```

## Database Schema

Tables created in Supabase:
- `users` - User profiles
- `notes` - Sticky notes
- `links` - Saved links
- `goals` - User goals
- `user_preferences` - Settings
- `activity_log` - Activity timeline

## Next Steps

1. **Install website dependencies**: `npm install` in `stickyverse-web/`
2. **Enable Google OAuth** in Supabase dashboard
3. **Test locally**: `npm run dev`
4. **Build website**: `npm run build` → deploy `dist/` folder
5. **Test extension**: Load in Chrome, connect to website
6. **Deploy website** to Vercel/Netlify

## Deployment

### Website (Vercel - Free)
```bash
cd stickyverse-web
npm run build
# Upload dist/ folder to Vercel
```

### Extension
- Zip `stickyverse-ext/` folder
- Upload to Chrome Web Store Developer Dashboard
- Or use unpacked for local testing

## Notes

- The lint errors in website files are expected (dependencies not installed)
- Extension uses `chrome.storage.local` for session persistence
- Token-based auth allows website-to-extension communication
- Both share the same Supabase project
