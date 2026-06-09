import Link from 'next/link'
import { Sparkles, StickyNote, Link2, Target, Palette, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <span className="text-xl font-bold text-white">StickyVerse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/auth"
            className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth"
            className="px-4 py-2 text-sm bg-white text-slate-900 rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Your aesthetic digital workspace</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Notes, Links & Ideas
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500">
              All in One Place
            </span>
          </h1>
          
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            StickyVerse is your personal digital workspace. Capture ideas, save links, 
            track goals, and stay productive with beautiful sticky notes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth"
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <Zap className="h-5 w-5" />
              Start Creating Free
            </Link>
            <Link 
              href="#features"
              className="px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-white/60">A complete workspace for your digital life</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<StickyNote className="h-6 w-6" />}
              title="Sticky Notes"
              description="Create beautiful notes, checklists, and ideas with customizable colors and styles."
            />
            <FeatureCard 
              icon={<Link2 className="h-6 w-6" />}
              title="Link Vault"
              description="Save and organize links from anywhere. Never lose an important article again."
            />
            <FeatureCard 
              icon={<Target className="h-6 w-6" />}
              title="Goal Tracking"
              description="Set and track your goals. Monitor progress and celebrate achievements."
            />
            <FeatureCard 
              icon={<Palette className="h-6 w-6" />}
              title="Beautiful Themes"
              description="Choose from multiple aesthetic themes including Void, Cyber, and Lofi."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="Chrome Extension"
              description="Save links directly from your browser. Works as your new tab page."
            />
            <FeatureCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="Sync Everywhere"
              description="Your data syncs across all devices. Access from web or extension."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-white/60 mb-8">
            Join thousands of users who have made StickyVerse their digital home.
          </p>
          <Link 
            href="/auth"
            className="inline-flex px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:opacity-90 transition-all"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-semibold">StickyVerse</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2024 StickyVerse. Made with care.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  )
}
