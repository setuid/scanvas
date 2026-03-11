import { useState } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { archetypes } from '@/data/archetypes'
import type { Character } from '@/types'
import Button from '@/components/ui/Button'
import GuidingQuestion from '@/components/ui/GuidingQuestion'

export default function CharactersTab() {
  const current = useStoryStore(s => s.current)!
  const addCharacter = useStoryStore(s => s.addCharacter)
  const updateCharacter = useStoryStore(s => s.updateCharacter)
  const removeCharacter = useStoryStore(s => s.removeCharacter)
  const moveCharacter = useStoryStore(s => s.moveCharacter)
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleAdd = () => {
    const ch: Character = {
      id: crypto.randomUUID(),
      story_id: current.story.id,
      name: '',
      role: '',
      archetypes: [],
      desire: '',
      need: '',
      fear: '',
      flaw: '',
      save_the_cat: '',
      arc: '',
      backstory: '',
      notes: '',
    }
    addCharacter(ch)
    setExpanded(ch.id)
  }

  const scenesForCharacter = (charId: string) =>
    current.scenes.filter(s => s.characters.includes(charId))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gold">Personagens</h2>
        <Button size="sm" onClick={handleAdd}>+ Novo Personagem</Button>
      </div>

      <div className="mb-4">
        <GuidingQuestion
          question="O desejo consciente e a necessidade inconsciente são opostos? Se sim, o conflito interno é forte. Que arquétipo esse personagem cumpre — e ele muda ao longo da história?"
          author="McKee + Vogler"
        />
      </div>

      <div className="space-y-3">
        {current.characters.map((ch, idx) => {
          const isExpanded = expanded === ch.id
          const sceneCount = scenesForCharacter(ch.id).length

          return (
            <div key={ch.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              {/* Header - always visible */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => setExpanded(isExpanded ? null : ch.id)}
              >
                <span className="w-9 h-9 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0">
                  {(ch.name || '?')[0].toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text truncate">{ch.name || 'Sem nome'}</span>
                    {ch.role && <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded">{ch.role}</span>}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {ch.archetypes.map(a => {
                      const arch = archetypes.find(ar => ar.id === a.archetype)
                      return arch ? (
                        <span key={a.archetype} className="text-xs text-gold-dim">{arch.name}</span>
                      ) : null
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => moveCharacter(ch.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-text-muted hover:text-gold disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
                    title="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCharacter(ch.id, 'down')}
                    disabled={idx === current.characters.length - 1}
                    className="p-1 text-text-muted hover:text-gold disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
                    title="Mover para baixo"
                  >
                    ▼
                  </button>
                </div>
                <span className="text-xs text-text-muted shrink-0">{sceneCount} cenas</span>
                <span className="text-text-muted">{isExpanded ? '▾' : '▸'}</span>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Nome</label>
                      <input
                        value={ch.name}
                        onChange={e => updateCharacter(ch.id, { name: e.target.value })}
                        placeholder="Nome do personagem"
                        className="input-field font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Papel</label>
                      <select
                        value={ch.role}
                        onChange={e => updateCharacter(ch.id, { role: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Selecione...</option>
                        <option value="protagonista">Protagonista</option>
                        <option value="antagonista">Antagonista</option>
                        <option value="mentor">Mentor</option>
                        <option value="aliado">Aliado</option>
                        <option value="interesse-romantico">Interesse Romântico</option>
                        <option value="secundario">Secundário</option>
                      </select>
                    </div>
                  </div>

                  {/* Archetypes */}
                  <div className="mb-4">
                    <label className="text-xs text-text-muted block mb-2">Arquétipos (Vogler)</label>
                    <div className="flex flex-wrap gap-2">
                      {archetypes.map(a => {
                        const active = ch.archetypes.some(ca => ca.archetype === a.id)
                        return (
                          <button
                            key={a.id}
                            onClick={() => {
                              const next = active
                                ? ch.archetypes.filter(ca => ca.archetype !== a.id)
                                : [...ch.archetypes, { archetype: a.id, phase: 'toda a história' }]
                              updateCharacter(ch.id, { archetypes: next })
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              active ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-bg-tertiary text-text-muted hover:text-text border border-transparent'
                            }`}
                            title={`${a.function}\n${a.guidingQuestion}`}
                          >
                            {a.name}
                            <span className="text-text-muted ml-1">— {a.function}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Desejo consciente / Spine</label>
                      <textarea
                        value={ch.desire}
                        onChange={e => updateCharacter(ch.id, { desire: e.target.value })}
                        placeholder="O que busca externamente — o desejo que puxa a história"
                        rows={2}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Necessidade inconsciente</label>
                      <textarea
                        value={ch.need}
                        onChange={e => updateCharacter(ch.id, { need: e.target.value })}
                        placeholder="O que realmente precisa — pode ser oposto ao desejo"
                        rows={2}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Medo central</label>
                      <input
                        value={ch.fear}
                        onChange={e => updateCharacter(ch.id, { fear: e.target.value })}
                        placeholder="Seu maior medo..."
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Falha / Fraqueza (hamartia)</label>
                      <input
                        value={ch.flaw}
                        onChange={e => updateCharacter(ch.id, { flaw: e.target.value })}
                        placeholder="A falha que pode destruí-lo..."
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-text-muted block mb-1">Save the Cat moment (Snyder)</label>
                    <textarea
                      value={ch.save_the_cat}
                      onChange={e => updateCharacter(ch.id, { save_the_cat: e.target.value })}
                      placeholder="O que esse personagem faz logo cedo que o torna simpático ao leitor?"
                      rows={2}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-text-muted block mb-1">Arco do personagem</label>
                    <textarea
                      value={ch.arc}
                      onChange={e => updateCharacter(ch.id, { arc: e.target.value })}
                      placeholder="Como muda do início ao fim..."
                      rows={2}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-text-muted block mb-1">Backstory / Notas</label>
                    <textarea
                      value={ch.backstory}
                      onChange={e => updateCharacter(ch.id, { backstory: e.target.value })}
                      placeholder="História pregressa, notas livres..."
                      rows={3}
                      className="input-field text-sm"
                    />
                  </div>

                  {/* Scenes this character appears in */}
                  {sceneCount > 0 && (
                    <div className="mb-4">
                      <label className="text-xs text-text-muted block mb-2">Aparece em:</label>
                      <div className="flex flex-wrap gap-1">
                        {scenesForCharacter(ch.id).map(sc => (
                          <span key={sc.id} className="text-xs bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">
                            {sc.title || 'Sem título'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => { removeCharacter(ch.id); setExpanded(null) }}
                    >
                      Excluir Personagem
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {current.characters.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Nenhum personagem ainda</p>
          <p className="text-sm mb-4">Adicione personagens para dar vida à sua história.</p>
          <Button onClick={handleAdd}>+ Primeiro Personagem</Button>
        </div>
      )}
    </div>
  )
}
