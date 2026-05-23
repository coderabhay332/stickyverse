/* ══════════════════════════════════════
   SUPABASE CONFIGURATION
══════════════════════════════════════ */

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://kzhovelxcwychkmykirc.supabase.co',
  anonKey: 'sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl',
  
  // Database schema
  schema: {
    users: 'users',
    notes: 'notes', 
    links: 'links',
    goals: 'goals',
    user_preferences: 'user_preferences'
  }
};

// Initialize Supabase client
let supabase = null;

function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase) {
    return supabase;
  }

  // Load Supabase script if not loaded
  if (typeof window.supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
      console.log('✅ Supabase initialized');
    };
    document.head.appendChild(script);
  } else {
    supabase = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  
  return supabase;
}

// Authentication functions
async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, error: error.message };
  }
}

async function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_CONFIG,
    initSupabase,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    onAuthStateChange
  };
}
