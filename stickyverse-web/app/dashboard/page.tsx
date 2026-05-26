'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, LogOut, Chrome, StickyNote, Link2, Target, ExternalLink, Loader2, X, Copy, Check } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Failed to check authentication')
          setLoading(false)
          return
        }
        
        if (!session) {
          router.push('/auth')
          return
        }
        
        setUser(session.user)
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        setError('Something went wrong')
        setLoading(false)
      }
    }
    
    // Timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Loading timed out. Please refresh.')
        setLoading(false)
      }
    }, 10000)
    
    checkAuth()
    
    return () => clearTimeout(timeoutId)
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generateToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const tokenData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user
      }
      const encodedToken = btoa(JSON.stringify(tokenData))
      setToken(encodedToken)
      setShowConnectModal(true)
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
          <span className="text-white/60">Loading...</span>
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-sm">
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={() => router.push('/auth')}
                className="mt-2 text-sm text-white/80 hover:text-white underline"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold text-white">StickyVerse</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">
              {user.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-white/60">
            Manage your digital workspace and connect your Chrome extension.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ActionCard 
            icon={<StickyNote className="h-6 w-6" />}
            title="Notes"
            description="View and manage your sticky notes"
            href="#"
            color="bg-yellow-500/20 text-yellow-400"
          />
          <ActionCard 
            icon={<Link2 className="h-6 w-6" />}
            title="Links"
            description="Access your saved links"
            href="#"
            color="bg-blue-500/20 text-blue-400"
          />
          <ActionCard 
            icon={<Target className="h-6 w-6" />}
            title="Goals"
            description="Track your goals and progress"
            href="#"
            color="bg-pink-500/20 text-pink-400"
          />
          <ActionCard 
            icon={<Chrome className="h-6 w-6" />}
            title="Extension"
            description="Connect Chrome extension"
            href="#extension"
            color="bg-green-500/20 text-green-400"
          />
        </div>

        {/* Extension Section */}
        <div id="extension" className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-white/10">
                <Chrome className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Chrome Extension
                </h2>
                <p className="text-white/60 max-w-md">
                  Connect your browser extension to sync notes and save links directly from any website.
                </p>
              </div>
            </div>
            
            <button
              onClick={generateToken}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-all whitespace-nowrap"
            >
              <Chrome className="h-5 w-5" />
              Connect Extension
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">
              How it works
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Step number={1} text="Install the StickyVerse extension from Chrome Web Store" />
              <Step number={2} text="Click 'Connect Extension' to authenticate" />
              <Step number={3} text="Your data syncs between web and extension automatically" />
            </div>
          </div>
        </div>

        {/* Stats or Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <StatCard label="Total Notes" value="Coming soon" />
          <StatCard label="Saved Links" value="Coming soon" />
          <StatCard label="Active Goals" value="Coming soon" />
        </div>
      </main>

      {/* Connect Extension Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Connect Extension</h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-white/60 mb-4">
              Copy this token and paste it in your StickyVerse extension settings:
            </p>
            
            <div className="bg-black/30 border border-white/10 rounded-lg p-3 mb-4">
              <code className="text-xs text-white/80 break-all font-mono">{token}</code>
            </div>
            
            <button
              onClick={copyToken}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold py-2.5 px-4 rounded-xl hover:bg-white/90 transition-all"
            >
              {copied ? (
                <><Check className="h-4 w-4" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy Token</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Link 
      href={href}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
        {title}
      </h3>
      <p className="text-white/50 text-sm">{description}</p>
    </Link>
  )
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
        {number}
      </div>
      <p className="text-white/60 text-sm pt-1">{text}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
