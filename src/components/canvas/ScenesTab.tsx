import { useState } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import type { Scene } from '@/types'
import Button from '@/components/ui/Button'
import GuidingQuestion from '@/components/ui/GuidingQuestion'
import SceneTimeline from './SceneTimeline'

export default function ScenesTab() {
  const current = useStoryStore(s => s.current)!
  const addScene = useStoryStore(s => s.addScene)
  const updateScene = useStoryStore(s => s.updateScene)
  const removeScene = useStoryStore(s => s.removeScene)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'byAct' | 'timeline'>('list')

  const fw = getFramework(current.story.framework)
  const sortedScenes = [...current.scenes].sort((a, b) => a.sort_order - b.sort_order)

  const handleAdd = () => {
    const sc: Scene = {
      id: crypto.randomUUID(),
      story_id: current.story.id,
      title: '',
      act_index: null,
      subplot_id: null,
      characters: [],
      value_at_stake: '',
      charge_start: '+',
      charge_end: '-',
      conflict: '',
      change: '',
      gap_expected: '',
      gap_actual: '',
      weight: 'medium',
      position_x: 0,
      position_y: 0,
      sort_order: current.scenes.length,
      notes: '',
    }
    addScene(sc)
    setExpanded(sc.id)
  }

  const moveScene = (id: string, direction: 'up' | 'down') => {
    const idx = sortedScenes.findIndex(s => s.id === id)
    if (direction === 'up' && idx > 0) {
      updateScene(sortedScenes[idx].id, { sort_order: sortedScenes[idx - 1].sort_order })
      updateScene(sortedScenes[idx - 1].id, { sort_order: sortedScenes[idx].sort_order })
    } else if (direction === 'down' && idx < sortedScenes.length - 1) {
      updateScene(sortedScenes[idx].id, { sort_order: sortedScenes[idx + 1].sort_order })
      updateScene(sortedScenes[idx + 1].id, { sort_order: sortedScenes[idx].sort_order })
    }
  }

  const renderScene = (scene: Scene, index: number) => {
    const isExpanded = expanded === scene.id
    const isStatic = scene.charge_start === scene.charge_end
    const charNames = scene.characters
      .map(id => current.characters.find(c => c.id === id))
      .filter(Boolean)
      .map(c => c!.name || '?')

    return (
      <div
        key={scene.id}
        className={`bg-surface border rounded-lg overflow-hidden ${isStatic && scene.title ? 'border-warning/50' : 'border-border'}`}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-surface-hover transition-colors"
          onClick={() => setExpanded(isExpanded ? null : scene.id)}
        >
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); moveScene(scene.id, 'up') }}
              className="text-text-muted hover:text-text text-xs cursor-pointer leading-none"
            >
              ▲
            </button>
            <button
              onClick={e => { e.stopPropagation(); moveScene(scene.id, 'down') }}
              className="text-text-muted hover:text-text text-xs cursor-pointer leading-none"
            >
              ▼
            </button>
          </div>

          <span className="text-xs text-text-muted font-mono w-6 text-center">{index + 1}</span>

          <div className={`flex items-center gap-1 shrink-0 ${
            scene.charge_start === '+' ? 'text-positive' : 'text-negative'
          }`}>
            <span className="text-xs">{scene.charge_start}</span>
            <span className="text-text-muted">→</span>
            <span className={scene.charge_end === '+' ? 'text-positive' : 'text-negative'}>
              {scene.charge_end}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-text truncate block">
              {scene.title || <span className="text-text-muted italic">Sem título</span>}
            </span>
          </div>

          {charNames.length > 0 && (
            <div className="hidden sm:flex gap-1 shrink-0">
              {charNames.slice(0, 3).map((n, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center" title={n}>
                  {n[0]}
                </span>
              ))}
            </div>
          )}

          <span className={`text-xs shrink-0 px-1.5 py-0.5 rounded ${
            scene.weight === 'heavy' ? 'bg-border text-text' : scene.weight === 'light' ? 'text-text-muted' : 'text-text-secondary'
          }`}>
            {scene.weight === 'heavy' ? '■■■' : scene.weight === 'medium' ? '■■' : '■'}
          </span>

          {isStatic && scene.title && (
            <span className="text-warning text-xs shrink-0" title="Cena estática">⚠</span>
          )}

          <span className="text-text-muted">{isExpanded ? '▾' : '▸'}</span>
        </div>

        {/* Expanded */}
        {isExpanded && (
          <div className="border-t border-border p-4">
            {isStatic && scene.title && (
              <div className="text-warning text-xs mb-3 bg-warning/10 rounded px-3 py-2">
                ⚠ McKee diz: se nada muda na cena, ela pode ser cortada. A carga começa e termina igual ({scene.charge_start}).
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Título</label>
                <input
                  value={scene.title}
                  onChange={e => updateScene(scene.id, { title: e.target.value })}
                  placeholder="Título da cena"
                  className="input-field font-semibold"
                />
              </div>
              {fw && (
                <div>
                  <label className="text-xs text-text-muted block mb-1">Estágio</label>
                  <select
                    value={scene.act_index ?? ''}
                    onChange={e => updateScene(scene.id, { act_index: e.target.value === '' ? null : Number(e.target.value) })}
                    className="input-field"
                  >
                    <option value="">Nenhum</option>
                    {fw.stages.map(s => (
                      <option key={s.index} value={s.index}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Valor em jogo (McKee)</label>
                <input
                  value={scene.value_at_stake}
                  onChange={e => updateScene(scene.id, { value_at_stake: e.target.value })}
                  placeholder="amor, verdade, poder..."
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Carga início → fim</label>
                <div className="flex gap-2">
                  <select
                    value={scene.charge_start}
                    onChange={e => updateScene(scene.id, { charge_start: e.target.value as '+' | '-' })}
                    className="input-field flex-1"
                  >
                    <option value="+">+ Positiva</option>
                    <option value="-">- Negativa</option>
                  </select>
                  <span className="text-text-muted self-center">→</span>
                  <select
                    value={scene.charge_end}
                    onChange={e => updateScene(scene.id, { charge_end: e.target.value as '+' | '-' })}
                    className="input-field flex-1"
                  >
                    <option value="+">+ Positiva</option>
                    <option value="-">- Negativa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Peso/Duração</label>
                <select
                  value={scene.weight}
                  onChange={e => updateScene(scene.id, { weight: e.target.value as any })}
                  className="input-field"
                >
                  <option value="light">Leve (rápida)</option>
                  <option value="medium">Média</option>
                  <option value="heavy">Pesada (longa)</option>
                </select>
              </div>
            </div>

            {/* Characters */}
            <div className="mb-4">
              <label className="text-xs text-text-muted block mb-2">Personagens</label>
              <div className="flex flex-wrap gap-2">
                {current.characters.map(ch => {
                  const active = scene.characters.includes(ch.id)
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        const next = active
                          ? scene.characters.filter(id => id !== ch.id)
                          : [...scene.characters, ch.id]
                        updateScene(scene.id, { characters: next })
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        active ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-bg-tertiary text-text-muted border border-transparent'
                      }`}
                    >
                      {ch.name || 'Sem nome'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Conflito</label>
                <textarea
                  value={scene.conflict}
                  onChange={e => updateScene(scene.id, { conflict: e.target.value })}
                  placeholder="O que está em jogo?"
                  rows={2}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">O que muda</label>
                <textarea
                  value={scene.change}
                  onChange={e => updateScene(scene.id, { change: e.target.value })}
                  placeholder="Que informação, relação ou estado se transforma?"
                  rows={2}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <GuidingQuestion
              question="O que o personagem esperava que acontecesse? E o que realmente aconteceu? Quanto maior a distância, mais poderosa a cena."
              author="McKee — Gap"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Esperava...</label>
                <textarea
                  value={scene.gap_expected}
                  onChange={e => updateScene(scene.id, { gap_expected: e.target.value })}
                  rows={2}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Aconteceu...</label>
                <textarea
                  value={scene.gap_actual}
                  onChange={e => updateScene(scene.id, { gap_actual: e.target.value })}
                  rows={2}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-text-muted block mb-1">Notas</label>
              <textarea
                value={scene.notes}
                onChange={e => updateScene(scene.id, { notes: e.target.value })}
                placeholder="Notas livres sobre esta cena..."
                rows={2}
                className="input-field text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => { removeScene(scene.id); setExpanded(null) }}
              >
                Excluir Cena
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gold">Cenas</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-tertiary rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-surface text-text' : 'text-text-muted'}`}
            >
              Lista
            </button>
            {fw && (
              <button
                onClick={() => setViewMode('byAct')}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${viewMode === 'byAct' ? 'bg-surface text-text' : 'text-text-muted'}`}
              >
                Por Ato
              </button>
            )}
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${viewMode === 'timeline' ? 'bg-surface text-text' : 'text-text-muted'}`}
            >
              Timeline
            </button>
          </div>
          <Button size="sm" onClick={handleAdd}>+ Nova Cena</Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="space-y-2">
          {sortedScenes.map((scene, i) => renderScene(scene, i))}
        </div>
      )}

      {viewMode === 'byAct' && fw && (
        <div className="space-y-6">
          {fw.stages.map(stage => {
            const scenesInAct = sortedScenes.filter(s => s.act_index === stage.index)
            return (
              <div key={stage.index}>
                <h3 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                    {stage.index + 1}
                  </span>
                  {stage.name}
                  <span className="text-text-muted">({scenesInAct.length})</span>
                </h3>
                {scenesInAct.length > 0 ? (
                  <div className="space-y-2">
                    {scenesInAct.map((sc, i) => renderScene(sc, i))}
                  </div>
                ) : (
                  <div className="text-text-muted text-xs italic pl-7">Nenhuma cena neste estágio</div>
                )}
              </div>
            )
          })}
          {(() => {
            const unassigned = sortedScenes.filter(s => s.act_index === null)
            if (unassigned.length === 0) return null
            return (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">Sem estágio ({unassigned.length})</h3>
                <div className="space-y-2">
                  {unassigned.map((sc, i) => renderScene(sc, i))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {viewMode === 'timeline' && (
        <SceneTimeline
          expanded={expanded}
          setExpanded={setExpanded}
          renderScene={renderScene}
        />
      )}

      {current.scenes.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Nenhuma cena ainda</p>
          <p className="text-sm mb-4">Cenas são o coração da narrativa. Cada uma deve mudar algo.</p>
          <Button onClick={handleAdd}>+ Primeira Cena</Button>
        </div>
      )}
    </div>
  )
}
