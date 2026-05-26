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
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        console.error('OAuth error:', error, errorDescription)
        router.push(`/auth?error=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      if (code) {
        // Exchange the OAuth code for a session — this writes to localStorage
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          router.push('/auth?error=auth_failed')
          return
        }

        if (data.session) {
          // Session is now in localStorage — extension-bridge.js will pick it up
          router.push('/dashboard')
          return
        }
      }

      // Fallback: check if session already exists (e.g. implicit flow)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
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
