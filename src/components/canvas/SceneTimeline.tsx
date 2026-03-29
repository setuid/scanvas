import { useState, useRef } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import type { Scene } from '@/types'

interface Props {
  expanded: string | null
  setExpanded: (id: string | null) => void
  renderScene: (scene: Scene, index: number) => React.ReactNode
}

export default function SceneTimeline({ expanded, setExpanded, renderScene }: Props) {
  const current = useStoryStore(s => s.current)!
  const updateScene = useStoryStore(s => s.updateScene)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fw = getFramework(current.story.framework)
  const sortedScenes = [...current.scenes].sort((a, b) => a.sort_order - b.sort_order)

  // Group scenes by act
  type ActGroup = { index: number | null; name: string; scenes: Scene[] }
  const groups: ActGroup[] = []

  if (fw) {
    for (const stage of fw.stages) {
      groups.push({
        index: stage.index,
        name: stage.name,
        scenes: sortedScenes.filter(s => s.act_index === stage.index),
      })
    }
  }
  // Unassigned scenes
  const unassigned = sortedScenes.filter(s => s.act_index === null || (fw && !fw.stages.some(st => st.index === s.act_index)))
  if (unassigned.length > 0 || !fw) {
    groups.push({ index: null, name: fw ? 'Sem estágio' : 'Cenas', scenes: fw ? unassigned : sortedScenes })
  }

  // --- Drag and drop ---
  const handleDragStart = (e: React.DragEvent, sceneId: string) => {
    setDragId(sceneId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', sceneId)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(targetId)
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDropOnScene = (e: React.DragEvent, targetScene: Scene) => {
    e.preventDefault()
    setDropTarget(null)
    if (!dragId || dragId === targetScene.id) { setDragId(null); return }

    const dragScene = sortedScenes.find(s => s.id === dragId)
    if (!dragScene) { setDragId(null); return }

    // Reorder: place dragged scene before target
    const without = sortedScenes.filter(s => s.id !== dragId)
    const targetIdx = without.findIndex(s => s.id === targetScene.id)
    without.splice(targetIdx, 0, dragScene)

    // Update sort_order for all affected scenes
    without.forEach((s, i) => {
      if (s.sort_order !== i) {
        updateScene(s.id, { sort_order: i })
      }
    })

    // If dropped in a different act group, update act_index
    if (dragScene.act_index !== targetScene.act_index) {
      updateScene(dragId, { act_index: targetScene.act_index })
    }

    setDragId(null)
  }

  const handleDropOnGroup = (e: React.DragEvent, actIndex: number | null) => {
    e.preventDefault()
    setDropTarget(null)
    if (!dragId) return

    const dragScene = sortedScenes.find(s => s.id === dragId)
    if (!dragScene) { setDragId(null); return }

    // Move to end of this act group
    if (dragScene.act_index !== actIndex) {
      updateScene(dragId, { act_index: actIndex })
    }

    setDragId(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDropTarget(null)
  }

  // Find the expanded scene for the detail panel
  const expandedScene = expanded ? sortedScenes.find(s => s.id === expanded) : null
  const expandedIndex = expandedScene ? sortedScenes.indexOf(expandedScene) : -1

  const charMap = new Map(current.characters.map(c => [c.id, c]))

  return (
    <div>
      {/* Horizontal scrollable timeline */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4"
      >
        <div className="flex gap-3 min-w-max px-1">
          {groups.map(group => (
            <div
              key={group.index ?? 'none'}
              className="flex flex-col"
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDrop={e => handleDropOnGroup(e, group.index)}
            >
              {/* Act header */}
              <div className="text-xs text-text-muted mb-2 px-1 font-medium truncate max-w-[200px]">
                {fw && group.index !== null && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold mr-1">
                    {group.index + 1}
                  </span>
                )}
                {group.name}
              </div>

              {/* Scene cards */}
              <div className="flex gap-2 min-h-[120px] bg-bg-secondary/30 rounded-lg p-2 border border-border/50">
                {group.scenes.length === 0 && (
                  <div className="flex items-center justify-center w-32 text-text-muted text-xs italic opacity-50">
                    Vazio
                  </div>
                )}
                {group.scenes.map(scene => {
                  const isExpanded = expanded === scene.id
                  const isDragging = dragId === scene.id
                  const isDropTarget = dropTarget === scene.id
                  const isStatic = scene.charge_start === scene.charge_end
                  const chars = scene.characters
                    .map(id => charMap.get(id))
                    .filter(Boolean)

                  return (
                    <div
                      key={scene.id}
                      draggable
                      onDragStart={e => handleDragStart(e, scene.id)}
                      onDragOver={e => handleDragOver(e, scene.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={e => handleDropOnScene(e, scene)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setExpanded(isExpanded ? null : scene.id)}
                      className={`
                        w-36 shrink-0 rounded-lg border p-3 cursor-pointer select-none
                        transition-all duration-150
                        ${isExpanded
                          ? 'border-gold bg-surface shadow-lg shadow-gold/10'
                          : isStatic && scene.title
                            ? 'border-warning/50 bg-surface hover:bg-surface-hover'
                            : 'border-border bg-surface hover:bg-surface-hover'}
                        ${isDragging ? 'opacity-40 scale-95' : ''}
                        ${isDropTarget ? 'border-gold/60 bg-gold/5' : ''}
                      `}
                    >
                      {/* Charge */}
                      <div className="flex items-center gap-1 text-xs mb-1.5">
                        <span className={scene.charge_start === '+' ? 'text-positive' : 'text-negative'}>
                          {scene.charge_start}
                        </span>
                        <span className="text-text-muted">→</span>
                        <span className={scene.charge_end === '+' ? 'text-positive' : 'text-negative'}>
                          {scene.charge_end}
                        </span>
                        {isStatic && scene.title && (
                          <span className="text-warning ml-auto" title="Cena estática">⚠</span>
                        )}
                      </div>

                      {/* Title */}
                      <div className="text-sm text-text font-medium truncate mb-2 min-h-[20px]">
                        {scene.title || <span className="text-text-muted italic text-xs">Sem título</span>}
                      </div>

                      {/* Characters */}
                      <div className="flex items-center gap-1">
                        {chars.slice(0, 3).map(c => (
                          <span
                            key={c!.id}
                            className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] flex items-center justify-center"
                            title={c!.name}
                          >
                            {(c!.name || '?')[0]}
                          </span>
                        ))}
                        {chars.length > 3 && (
                          <span className="text-text-muted text-[10px]">+{chars.length - 3}</span>
                        )}
                        <span className={`ml-auto text-[10px] ${
                          scene.weight === 'heavy' ? 'text-text' : 'text-text-muted'
                        }`}>
                          {scene.weight === 'heavy' ? '■■■' : scene.weight === 'medium' ? '■■' : '■'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded scene detail panel */}
      {expandedScene && (
        <div className="mt-4">
          {renderScene(expandedScene, expandedIndex)}
        </div>
      )}
    </div>
  )
}
