import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useStoryStore } from '@/store/useStoryStore'
import { supabase } from '@/lib/supabase'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const user = useAuthStore(s => s.user)
  const current = useStoryStore(s => s.current)
  const isDirty = useStoryStore(s => s.isDirty)

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    useAuthStore.getState().setUser(null)
    useStoryStore.getState().closeStory()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-gold font-serif text-xl font-bold">Story Canvas</span>
            </Link>

            {current && (
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <Link to="/" className="hover:text-text transition-colors">&larr;</Link>
                <span className="text-text-muted">/</span>
                <span className="text-text truncate max-w-48">
                  {current.story.title || 'Sem título'}
                </span>
                {isDirty && <span className="text-warning text-xs ml-1" title="Alterações não salvas">●</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-text-secondary text-sm hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-text-muted hover:text-text text-sm transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </>
            ) : (
              <span className="text-text-muted text-sm">Modo local</span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
