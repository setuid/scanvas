import { useState } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import GuidingQuestion from '@/components/ui/GuidingQuestion'

export default function GuidingPanel() {
  const current = useStoryStore(s => s.current)!
  const updateActGuidingAnswer = useStoryStore(s => s.updateActGuidingAnswer)
  const fw = getFramework(current.story.framework)
  const [activeStage, setActiveStage] = useState(0)

  if (!fw) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p className="text-sm">Nenhum framework selecionado.</p>
        <p className="text-xs mt-1">Escolha um framework na aba Estrutura para ver o guia.</p>
      </div>
    )
  }

  const stage = fw.stages[activeStage]
  if (!stage) return null

  const act = current.acts.find(a => a.act_index === stage.index)
  const scenesInStage = current.scenes.filter(s => s.act_index === stage.index)
  const hasDescription = act?.description?.trim()

  // Status per stage for the nav dots
  const stageStatuses = fw.stages.map(s => {
    const stageAct = current.acts.find(a => a.act_index === s.index)
    const stageScenes = current.scenes.filter(sc => sc.act_index === s.index)
    if (stageAct?.description?.trim() && stageScenes.length > 0) return 'complete'
    if (stageAct?.description?.trim() || stageScenes.length > 0) return 'partial'
    return 'empty'
  })

  return (
    <div>
      {/* Stage navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
          disabled={activeStage === 0}
          className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-border-light disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors flex items-center justify-center text-sm"
        >
          &larr;
        </button>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto px-1">
          {fw.stages.map((s, i) => {
            const status = stageStatuses[i]
            const isActive = i === activeStage
            return (
              <button
                key={s.index}
                onClick={() => setActiveStage(i)}
                className={`w-3 h-3 rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-gold ring-offset-1 ring-offset-bg'
                    : ''
                } ${
                  status === 'complete' ? 'bg-positive' :
                  status === 'partial' ? 'bg-warning' :
                  'bg-border'
                }`}
                title={`${s.name} (${
                  status === 'complete' ? 'completo' :
                  status === 'partial' ? 'parcial' :
                  'vazio'
                })`}
              />
            )
          })}
        </div>

        <button
          onClick={() => setActiveStage(Math.min(fw.stages.length - 1, activeStage + 1))}
          disabled={activeStage === fw.stages.length - 1}
          className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-border-light disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors flex items-center justify-center text-sm"
        >
          &rarr;
        </button>
      </div>

      {/* Stage header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-text-muted">{stage.index + 1}/{fw.stages.length}</span>
          <h4 className="font-serif text-lg text-gold">{stage.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            stageStatuses[activeStage] === 'complete' ? 'bg-positive/20 text-positive' :
            stageStatuses[activeStage] === 'partial' ? 'bg-warning/20 text-warning' :
            'bg-border text-text-muted'
          }`}>
            {stageStatuses[activeStage] === 'complete' ? 'Completo' :
             stageStatuses[activeStage] === 'partial' ? 'Parcial' :
             'Vazio'}
          </span>
        </div>
      </div>

      {/* Guiding question */}
      <GuidingQuestion question={stage.guidingQuestion} />

      {/* Existing description preview */}
      {hasDescription && (
        <div className="mt-3 bg-bg-tertiary rounded-lg p-3">
          <span className="text-xs text-text-muted block mb-1">Descricao do estagio:</span>
          <p className="text-sm text-text-secondary">{act!.description}</p>
        </div>
      )}

      {/* Scenes in this stage */}
      {scenesInStage.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-text-muted block mb-1">Cenas neste estagio ({scenesInStage.length}):</span>
          <div className="space-y-1">
            {scenesInStage.map(sc => (
              <div key={sc.id} className="flex items-center gap-2 text-sm bg-bg-tertiary rounded px-2 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  sc.charge_start !== sc.charge_end ? 'bg-positive' : 'bg-warning'
                }`} />
                <span className="text-text-secondary truncate">{sc.title || 'Sem titulo'}</span>
                <span className="text-text-muted text-xs ml-auto shrink-0">
                  {sc.charge_start}&rarr;{sc.charge_end}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guiding answer textarea */}
      <div className="mt-4">
        <label className="text-xs text-text-muted block mb-1">
          Sua reflexao sobre esta pergunta:
        </label>
        <textarea
          value={act?.guiding_answer || ''}
          onChange={e => updateActGuidingAnswer(stage.index, e.target.value)}
          placeholder="Como voce esta respondendo a pergunta deste estagio na sua historia..."
          rows={3}
          className="input-field text-sm"
        />
      </div>
    </div>
  )
}
