# StickyVerse Website

The official website for StickyVerse - Your aesthetic digital workspace.

## Features

- **Landing Page** - Beautiful gradient design with feature showcase
- **Google OAuth** - Sign in with Google (via Supabase)
- **Dashboard** - User dashboard with extension connection flow
- **Chrome Extension Integration** - Connect extension to sync data

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Environment variables** (already configured in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://kzhovelxcwychkmykirc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl
```

3. **Run development server**:
```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
```

## Architecture

```
/app
  /page.tsx           - Landing page
  /auth/page.tsx      - Sign in with Google
  /auth/callback      - OAuth callback handler
  /dashboard          - User dashboard
  /api/auth           - Auth API routes
/lib
  /supabase-client.ts - Browser Supabase client
  /supabase-server.ts - Server Supabase client
```

## Extension Auth Flow

1. User signs in on website
2. Dashboard shows "Connect Extension" button
3. Clicking generates a token with session data
4. User copies token and pastes in extension settings
5. Extension validates token and sets up Supabase session

## Deployment

Build output is in `dist/` folder. Deploy to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting

## Next Steps

1. Enable Google OAuth in Supabase Dashboard:
   - Authentication → Providers → Google → Enable
   - Add your domain to Authorized Redirect URIs

2. Update extension to accept auth tokens

3. Deploy website to production
