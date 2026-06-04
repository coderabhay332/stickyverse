/* ══════════════════════════════════════
   AUTHENTICATION HANDLER
══════════════════════════════════════ */

// Initialize Supabase - initSupabase() sets up window.supabaseClient
initSupabase();

// DOM elements
const googleBtn = document.getElementById('google-signin-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for Supabase to initialize (max 5 seconds)
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.supabaseClient) {
      showError('Failed to initialize. Please refresh the page.');
      return;
    }
    
    // Check for existing session
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      showError('Authentication error. Please try again.');
      return;
    }
    
    if (session) {
      // User is already logged in, redirect to dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || 'newtab.html';
      window.location.href = redirectTo;
      return;
    }
    
    // Check for OAuth callback
    if (window.location.hash.includes('access_token')) {
      await handleAuthCallback();
    }
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Something went wrong. Please refresh and try again.');
  }
});

function setupEventListeners() {
  googleBtn.addEventListener('click', handleGoogleSignIn);
}

async function handleGoogleSignIn() {
  try {
    showLoading(true);
    hideError();
    
    const { success, error } = await signInWithGoogle();
    
    if (!success) {
      showError(error);
      showLoading(false);
    }
    // OAuth redirect will handle the rest
    
  } catch (error) {
    console.error('Sign in error:', error);
    showError('Failed to sign in. Please try again.');
    showLoading(false);
  }
}

async function handleAuthCallback() {
  try {
    showLoading(true);
    
    // Get session from URL hash
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (session) {
      // Create or update user profile
      await createOrUpdateUserProfile(session.user);
      
      // Redirect to dashboard or original destination
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || 'newtab.html';
      
      // Show success message briefly
      showSuccess('Welcome to StickyVerse! ✨');
      
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);
    }
    
  } catch (error) {
    console.error('Auth callback error:', error);
    showError('Authentication failed. Please try again.');
    showLoading(false);
  }
}

async function createOrUpdateUserProfile(user) {
  try {
    const { data, error } = await window.supabaseClient
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        preferences: {
          theme: 'void',
          notifications: true,
          auto_save: true
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Profile creation error:', error);
      // Don't throw error, user can still continue
    }
    
    console.log('✅ User profile created/updated:', data);
    return data;
    
  } catch (error) {
    console.error('Profile creation error:', error);
    return null;
  }
}

// UI Helper functions
function showLoading(show) {
  loadingEl.style.display = show ? 'block' : 'none';
  googleBtn.disabled = show;
  if (show) {
    googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
  } else {
    googleBtn.innerHTML = `
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    `;
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError() {
  errorEl.style.display = 'none';
}

function showSuccess(message) {
  errorEl.textContent = message;
  errorEl.style.background = 'rgba(16, 185, 129, 0.1)';
  errorEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  errorEl.style.color = '#34D399';
  errorEl.style.display = 'block';
}

// Handle extension source
if (window.location.search.includes('source=extension')) {
  // Store that we came from extension for better UX
  localStorage.setItem('sv_auth_source', 'extension');
}
