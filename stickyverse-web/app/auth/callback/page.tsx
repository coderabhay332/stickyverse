'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth error:', error)
        router.push('/auth?error=auth_failed')
        return
      }

      if (session) {
        // Check if this is an extension connection request
        const params = new URLSearchParams(window.location.search)
        const connectExtension = params.get('connect_extension')
        
        if (connectExtension === 'true') {
          // Generate a token for the extension
          const token = btoa(JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user
          }))
          
          // Redirect to extension with token
          const extensionUrl = `chrome-extension://STICKYVERSE_EXTENSION_ID/auth-callback.html?token=${encodeURIComponent(token)}`
          window.location.href = extensionUrl
        } else {
          // Normal login, go to dashboard
          router.push('/dashboard')
        }
      } else {
        router.push('/auth')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
          <span className="text-2xl font-bold text-white">StickyVerse</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Completing sign in...</span>
        </div>
      </div>
    </div>
  )
}
