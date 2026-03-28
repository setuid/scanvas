import { useState } from 'react'
import { frameworks } from '@/data/frameworks'
import Button from '@/components/ui/Button'
import AuthModal from '@/components/AuthModal'

function BookIcon() {
  return (
    <svg viewBox="0 0 64 44" className="w-16 h-auto mx-auto mb-4 opacity-60" aria-hidden="true">
      {/* Left page */}
      <path d="M28,38 L28,6 Q28,1 22,1 L6,1 Q2,1 2,5 L2,38 Q2,42 6,42 L28,42 Z"
        fill="currentColor" className="text-surface" stroke="#d4a843" strokeWidth="1.2" />
      {/* Right page */}
      <path d="M36,38 L36,6 Q36,1 42,1 L58,1 Q62,1 62,5 L62,38 Q62,42 58,42 L36,42 Z"
        fill="currentColor" className="text-surface" stroke="#d4a843" strokeWidth="1.2" />
      {/* Spine */}
      <path d="M28,1 Q32,-3 36,1 L36,42 Q32,46 28,42 Z" fill="#d4a843" opacity="0.2" />
      {/* Left lines */}
      <line x1="8" y1="10" x2="22" y2="10" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
      <line x1="8" y1="16" x2="22" y2="16" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
      <line x1="8" y1="22" x2="22" y2="22" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
      {/* Right lines */}
      <line x1="42" y1="10" x2="56" y2="10" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
      <line x1="42" y1="16" x2="56" y2="16" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
      <line x1="42" y1="22" x2="56" y2="22" stroke="#d4a843" strokeWidth="0.8" opacity="0.3" />
    </svg>
  )
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="text-center -mt-16">
        <BookIcon />

        <h1 className="text-4xl md:text-5xl font-serif text-gold mb-3">Story Canvas</h1>
        <p className="text-text-secondary text-base mb-8">
          Planeje a estrutura da sua história.
        </p>

        <div className="flex flex-col items-center gap-3 mb-12">
          <Button size="lg" onClick={() => openAuth('signup')}>
            Criar Conta
          </Button>
          <button
            onClick={() => openAuth('login')}
            className="text-text-muted hover:text-gold text-sm transition-colors cursor-pointer"
          >
            Já tem conta? <span className="underline">Entrar</span>
          </button>
        </div>

        <hr className="border-border w-24 mx-auto mb-8" />

        <p className="text-text-muted text-xs mb-3">Frameworks narrativos inclusos</p>
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {frameworks.map(fw => (
            <span
              key={fw.id}
              className="px-3 py-1 border border-border rounded-full text-text-secondary text-xs"
            >
              {fw.name}
            </span>
          ))}
        </div>

        <p className="text-text-muted text-xs opacity-50">
          Código aberto · Dados seus
        </p>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  )
}
