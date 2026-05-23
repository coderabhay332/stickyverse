# StickyVerse Supabase Setup Guide

This guide will help you set up Supabase backend services for StickyVerse V1 with authentication, cloud sync, and real-time data synchronization.

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with Google
4. Create new project:
   - **Organization**: Your name
   - **Project Name**: `stickyverse`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

### 2. Set Up Google Authentication
1. In your Supabase project dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google OAuth credentials:
     - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
     - **Client Secret**: Get from Google Cloud Console
   - Set **Redirect URL**: `https://[your-project-id].supabase.co/auth/v1/callback`
   - Click **Save**

### 3. Run Database Schema
1. In Supabase dashboard:
   - Go to **SQL Editor**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and click **Run**
   - Wait for schema to be created

### 4. Get Your Credentials
1. In Supabase dashboard:
   - Go to **Project Settings** → **API**
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxxxxx.supabase.co`)
     - **anon public** (public) key

### 5. Update Configuration
1. Open `supabase-config.js`
2. Replace placeholder values:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'YOUR_SUPABASE_URL', // Replace with your Project URL
     anonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with your anon key
   };
   ```
3. Open `newtab.js`
4. Replace placeholder values:
   ```javascript
   supabase = window.supabase.createClient(
     'YOUR_SUPABASE_URL', // Replace with your Project URL  
     'YOUR_SUPABASE_ANON_KEY' // Replace with your anon key
   );
   ```

## 🔧 Google OAuth Setup

### Get Google Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: StickyVerse
   - **Authorized redirect URIs**:
     - `https://[your-project-id].supabase.co/auth/v1/callback`
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

### Add Required APIs
1. In Google Cloud Console:
   - Go to **APIs & Services** → **Library**
   - Enable these APIs:
     - Google+ API
     - Google People API

## 📊 Database Schema Overview

The schema includes these tables:

### **Core Tables**
- `users` - User profiles and preferences
- `notes` - All note types (regular, checklist, quote, bullet, photo)
- `links` - Saved links and bookmarks
- `goals` - Goal tracking system
- `user_preferences` - User settings and preferences
- `activity_log` - Timeline of user actions

### **Security Features**
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic activity logging
- Secure authentication flows

## 🧪 Testing the Setup

### 1. Test Authentication
1. Load the updated extension
2. Click "Sign in with Google" in sidebar
3. Complete Google OAuth flow
4. Verify user profile appears in sidebar

### 2. Test Cloud Sync
1. Create a test note while signed in
2. Open extension in different browser/incognito
3. Sign in with same Google account
4. Verify note appears (real-time sync)

### 3. Test Data Migration
1. Sign out and create local notes
2. Sign in - notes should migrate to cloud
3. Check Supabase dashboard → **Table Editor** to verify data

## 🔒 Security Configuration

### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only access their own data
- No data leakage between users
- Secure authentication flows

### API Keys
- **Anon Key**: Safe for client-side use
- **Service Role Key**: Never expose to client (admin only)
- Authentication handled by Supabase automatically

## 📱 Cross-Platform Sync

### Extension ↔ Web App
- Both platforms use same Supabase backend
- Real-time synchronization via Supabase subscriptions
- Automatic conflict resolution
- Offline support with local storage fallback

### Data Flow
```
Extension/Web App → Supabase → Real-time Sync → All Devices
```

## 🚨 Troubleshooting

### Common Issues

**"Supabase initialization failed"**
- Check URL and anon key are correct
- Verify Supabase project is active
- Check network connectivity

**"Google sign in not working"**
- Verify Google OAuth credentials
- Check redirect URL matches exactly
- Ensure Google APIs are enabled

**"Data not syncing"**
- Check user is authenticated
- Verify RLS policies are working
- Check browser console for errors

**"Database schema errors"**
- Ensure all SQL was executed successfully
- Check table names and constraints
- Verify indexes were created

### Debug Mode
Enable console logging to debug issues:
```javascript
// In browser console
localStorage.setItem('sv_debug', 'true');
```

## 📈 Monitoring

### Supabase Dashboard
- **Authentication**: Monitor sign-ups and sessions
- **Database**: Track table sizes and queries
- **Storage**: Monitor file uploads (if added)
- **Functions**: Monitor edge functions (if used)

### Performance Tips
- Use database indexes for queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor API usage limits

## 🔄 Next Steps

After completing setup:

1. **Test thoroughly** with multiple users
2. **Set up monitoring** and alerts
3. **Configure backup** strategies
4. **Plan scaling** for user growth
5. **Implement goals system** (next phase)

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase configuration
3. Review this troubleshooting guide
4. Check Supabase documentation

---

**Your StickyVerse V1 backend is now ready!** 🎉

Users can:
- Sign in with Google
- Sync data across devices
- Access their workspace anywhere
- Enjoy real-time collaboration
