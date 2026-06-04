import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://kzhovelxcwychkmykirc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rhZmRguI0mEl7vpDaL5ivg_Bz_DZLPl';

// Function to load Supabase script for Chrome extension
async function loadSupabaseScript() {
  if (typeof window.supabase !== 'undefined') {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('supabase.min.js');
    script.onload = () => {
      console.log('Supabase script loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load Supabase script');
      resolve(); // Continue even if script fails
    };
    document.head.appendChild(script);
  });
}

export function useSupabase() {
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeSupabase = async () => {
      try {
        // Load Supabase script for Chrome extension context
        if (typeof window.supabase === 'undefined') {
          await loadSupabaseScript();
        }

        // Initialize Supabase client
        if (window.supabase && isMounted) {
          const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          setSupabase(client);
        } else if (isMounted) {
          console.warn('Supabase not available, using local storage only');
          setLoading(false);
        }
      } catch (err) {
        console.warn('Supabase initialization failed:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializeSupabase();
    
    return () => { isMounted = false; };
  }, []);

  // Check for existing session when supabase is ready
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!supabase || !isMounted) return;
      
      try {
        // Try to get session from chrome.storage (Chrome extension specific)
        let restoredFromStorage = false;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            const result = await chrome.storage.local.get(['supabase_session']);
            if (result.supabase_session && isMounted) {
              const { data, error } = await supabase.auth.setSession(result.supabase_session);
              if (!error && data.session) {
                setUser(data.session.user);
                restoredFromStorage = true;
              }
            }
          } catch (storageError) {
            console.log('Chrome storage not available:', storageError.message);
          }
        }

        // Fallback: check Supabase directly if not restored from storage
        if (!restoredFromStorage && isMounted) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && isMounted) {
            setUser(session.user);
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();
    
    return () => { isMounted = false; };
  }, [supabase]);

  // Listen for auth changes
  useEffect(() => {
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          // Save session to chrome.storage if it has changed
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
              const result = await chrome.storage.local.get(['supabase_session']);
              if (result.supabase_session?.access_token !== session.access_token) {
                await chrome.storage.local.set({ supabase_session: session });
              }
            } catch (e) {
              console.log('Failed to save session to storage:', e.message);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          // Clear session from chrome.storage
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
              await chrome.storage.local.remove(['supabase_session']);
            } catch (e) {
              console.log('Failed to clear session from storage:', e.message);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Listen to chrome.storage changes to sync session dynamically
  useEffect(() => {
    if (!supabase) return;
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) return;

    const handleStorageChange = async (changes, areaName) => {
      if (areaName === 'local' && changes.supabase_session) {
        const newSession = changes.supabase_session.newValue;
        if (newSession) {
          // Check if current session already matches the new storage session to prevent loop
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.access_token === newSession.access_token) {
            return;
          }

          console.log('Syncing auth session from chrome storage changes:', newSession.user?.email);
          const { data, error } = await supabase.auth.setSession({
            access_token: newSession.access_token,
            refresh_token: newSession.refresh_token
          });
          if (!error && data.session) {
            setUser(data.session.user);
          }
        } else {
          console.log('Clearing auth session from chrome storage changes');
          setUser(null);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [supabase]);

  const signIn = async () => {
    const webUrl = 'https://peaceful-peony-58cb08.netlify.app/dashboard';
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: webUrl });
      } else {
        window.open(webUrl, '_blank');
      }
    } catch (error) {
      console.error('Sign in redirect failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  return {
    user,
    supabase,
    loading,
    error,
    signIn,
    signOut
  };
}
