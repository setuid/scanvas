import { useStoryStore } from '@/store/useStoryStore'
import { frameworks, getFramework } from '@/data/frameworks'
import type { StoryAct } from '@/types'
import GuidingQuestion from '@/components/ui/GuidingQuestion'

export default function StructureTab() {
  const current = useStoryStore(s => s.current)!
  const updateStory = useStoryStore(s => s.updateStory)
  const setActs = useStoryStore(s => s.setActs)
  const story = current.story
  const fw = getFramework(story.framework)

  const selectFramework = (id: string) => {
    updateStory({ framework: id })
    const newFw = getFramework(id)
    if (!newFw) return
    const newActs: StoryAct[] = newFw.stages.map(stage => {
      const existing = current.acts.find(a => a.act_index === stage.index && a.framework === id)
      return existing || {
        id: crypto.randomUUID(),
        story_id: story.id,
        framework: id,
        act_index: stage.index,
        act_name: stage.name,
        description: '',
      }
    })
    setActs(newActs)
  }

  // Tension curve calculation
  const sortedScenes = [...current.scenes].sort((a, b) => a.sort_order - b.sort_order)
  const tensionPoints: number[] = []
  let tension = 0
  for (const scene of sortedScenes) {
    if (scene.charge_end === '+') tension += 1
    else tension -= 1
    tensionPoints.push(tension)
  }
  const maxTension = Math.max(Math.abs(Math.min(...tensionPoints, 0)), Math.max(...tensionPoints, 0), 1)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Framework selector */}
      <div className="mb-8">
        <h2 className="text-xl font-serif text-gold mb-3">Framework Narrativo</h2>
        <div className="flex flex-wrap gap-2">
          {frameworks.map(f => (
            <button
              key={f.id}
              onClick={() => selectFramework(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                story.framework === f.id
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-bg-tertiary text-text-secondary border border-transparent hover:text-text'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tension curve mini */}
      {sortedScenes.length > 1 && (
        <div className="mb-8 bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Curva de Tensão</h3>
          <div className="h-24 flex items-end gap-1">
            {tensionPoints.map((t, i) => {
              const height = ((t + maxTension) / (maxTension * 2)) * 100
              const isStatic = sortedScenes[i]?.charge_start === sortedScenes[i]?.charge_end
              return (
                <div
                  key={i}
                  className="flex-1 min-w-2 rounded-t transition-all group relative"
                  style={{ height: `${Math.max(height, 4)}%` }}
                >
                  <div
                    className={`w-full h-full rounded-t ${isStatic ? 'bg-warning/50' : t >= 0 ? 'bg-positive/50' : 'bg-negative/50'}`}
                  />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded px-2 py-1 text-xs text-text whitespace-nowrap z-10 mb-1">
                    {sortedScenes[i]?.title || `Cena ${i + 1}`}: {t > 0 ? '+' : ''}{t}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>Início</span>
            <span>Fim</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      {fw ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {fw.stages.map(stage => {
              const act = current.acts.find(a => a.act_index === stage.index)
              const scenesInAct = current.scenes.filter(s => s.act_index === stage.index)
              const filled = act?.description?.trim()

              return (
                <div key={stage.index} className="relative pl-12">
                  {/* Node */}
                  <div className={`absolute left-3 w-5 h-5 rounded-full border-2 ${
                    filled ? 'bg-gold border-gold' : 'bg-bg border-border'
                  }`} />

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-text-muted font-mono">{stage.index + 1}</span>
                      <h4 className="font-semibold text-text">{stage.name}</h4>
                    </div>

                    <GuidingQuestion question={stage.guidingQuestion} />

                    <textarea
                      value={act?.description || ''}
                      onChange={e => {
                        if (act) {
                          const updated = current.acts.map(a =>
                            a.id === act.id ? { ...a, description: e.target.value } : a
                          )
                          setActs(updated)
                        }
                      }}
                      placeholder="O que acontece neste estágio..."
                      rows={3}
                      className="input-field text-sm"
                    />

                    {/* Scenes nested under act */}
                    {scenesInAct.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-xs text-text-muted">Cenas neste estágio:</span>
                        {scenesInAct.map(sc => (
                          <div key={sc.id} className="flex items-center gap-2 text-sm bg-bg-tertiary rounded px-2 py-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              sc.charge_start !== sc.charge_end ? 'bg-positive' : 'bg-warning'
                            }`} />
                            <span className="text-text-secondary">{sc.title || 'Sem título'}</span>
                            <span className="text-text-muted text-xs ml-auto">
                              {sc.charge_start}→{sc.charge_end}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Nenhum framework selecionado</p>
          <p className="text-sm">Escolha um framework narrativo acima para estruturar sua história.</p>
        </div>
      )}
    </div>
  )
}
