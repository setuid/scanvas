import { useState } from 'react'
import { frameworks } from '@/data/frameworks'
import Button from '@/components/ui/Button'
import AuthModal from '@/components/AuthModal'

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const features = [
    {
      title: 'Wizard Guiado',
      description: 'Crie sua história passo a passo com os frameworks de Campbell, McKee, Snyder e Vogler.',
      icon: '🧭',
    },
    {
      title: 'Canvas Visual',
      description: 'Dashboard completo com personagens, cenas, estrutura narrativa e relacionamentos.',
      icon: '🎨',
    },
    {
      title: 'Sincronização',
      description: 'Seus dados salvos na nuvem, acessíveis de qualquer dispositivo.',
      icon: '☁️',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-serif text-gold mb-4">Story Canvas</h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
          O cockpit do escritor. Arquitete, visualize e itere sobre a estrutura da sua história
          antes de escrevê-la.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Button size="lg" onClick={() => openAuth('signup')}>
            Criar Conta Grátis
          </Button>
          <button
            onClick={() => openAuth('login')}
            className="text-text-muted hover:text-gold text-sm transition-colors cursor-pointer"
          >
            Já tem conta? <span className="underline">Entrar</span>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map(f => (
          <div
            key={f.title}
            className="bg-surface border border-border rounded-lg p-6 text-center"
          >
            <span className="text-3xl mb-3 block">{f.icon}</span>
            <h3 className="font-serif text-lg text-text mb-2">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Frameworks */}
      <div className="text-center mb-16">
        <p className="text-text-muted text-sm mb-4">Frameworks narrativos inclusos:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {frameworks.map(fw => (
            <span
              key={fw.id}
              className="px-3 py-1.5 bg-surface border border-border rounded-full text-text-secondary text-sm"
            >
              {fw.name}
            </span>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <Button size="lg" onClick={() => openAuth('signup')}>
          Começar Agora
        </Button>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  )
}
