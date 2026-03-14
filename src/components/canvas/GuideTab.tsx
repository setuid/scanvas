import { useMemo } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import { runDiagnostics } from '@/lib/storyDiagnostics'
import DiagnosticPanel from './DiagnosticPanel'
import GuidingPanel from './GuidingPanel'

interface GuideTabProps {
  onNavigate: (tab: string) => void
}

export default function GuideTab({ onNavigate }: GuideTabProps) {
  const current = useStoryStore(s => s.current)!
  const fw = getFramework(current.story.framework)

  const diagnostics = useMemo(() => runDiagnostics(current, fw), [
    current.acts,
    current.scenes,
    current.characters,
    current.promises,
    current.characterArcPoints,
    current.story.framework,
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Panel */}
        <div>
          <h2 className="text-xl font-serif text-gold mb-4">Diagnostico Narrativo</h2>
          <p className="text-xs text-text-muted mb-4">
            Analise automatica da sua historia. Clique num card para navegar.
          </p>
          <DiagnosticPanel diagnostics={diagnostics} onNavigate={onNavigate} />
        </div>

        {/* Guiding Panel */}
        <div>
          <h2 className="text-xl font-serif text-gold mb-4">Guia Socratico</h2>
          <p className="text-xs text-text-muted mb-4">
            Navegue pelos estagios do framework e reflita sobre cada pergunta.
          </p>
          <div className="bg-surface border border-border rounded-xl p-5">
            <GuidingPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
