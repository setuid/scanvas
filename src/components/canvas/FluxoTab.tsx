import { useState, useMemo, useCallback } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import type { SceneConnection } from '@/types'
import Modal from '@/components/ui/Modal'

const NODE_W = 160
const NODE_H = 100
const GAP = 60
const PAD_LEFT = 100
const PAD_RIGHT = 40
const CURVE_H = 80
const CURVE_TOP = NODE_H + 40
const LANE_H = 28
const LANE_GAP = 8

export default function FluxoTab() {
  const current = useStoryStore(s => s.current)!
  const addSceneConnection = useStoryStore(s => s.addSceneConnection)
  const removeSceneConnection = useStoryStore(s => s.removeSceneConnection)

  const [showSwimLanes, setShowSwimLanes] = useState(false)
  const [connectionMode, setConnectionMode] = useState<{ fromId: string } | null>(null)
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [connLabel, setConnLabel] = useState('')
  const [pendingConn, setPendingConn] = useState<{ from: string; to: string } | null>(null)

  const fw = getFramework(current.story.framework)
  const sortedScenes = useMemo(
    () => [...current.scenes].sort((a, b) => a.sort_order - b.sort_order),
    [current.scenes]
  )

  // Tension curve
  const tensionData = useMemo(() => {
    const points: number[] = []
    let t = 0
    for (const sc of sortedScenes) {
      if (sc.charge_end === '+') t += 1
      else t -= 1
      points.push(t)
    }
    const max = Math.max(Math.abs(Math.min(...points, 0)), Math.max(...points, 0), 1)
    return { points, max }
  }, [sortedScenes])

  // Layout
  const totalW = PAD_LEFT + PAD_RIGHT + sortedScenes.length * (NODE_W + GAP) - GAP
  const swimLanesTop = CURVE_TOP + CURVE_H + 20
  const totalH = showSwimLanes
    ? swimLanesTop + current.characters.length * (LANE_H + LANE_GAP) + PAD_RIGHT
    : CURVE_TOP + CURVE_H + PAD_RIGHT

  const sceneX = useCallback((i: number) => PAD_LEFT + i * (NODE_W + GAP), [])
  const sceneCenter = useCallback((i: number) => sceneX(i) + NODE_W / 2, [sceneX])

  // Handle scene click
  const handleSceneClick = (sceneId: string) => {
    if (connectionMode) {
      if (connectionMode.fromId === sceneId) return
      setPendingConn({ from: connectionMode.fromId, to: sceneId })
      setConnLabel('')
      setConnectionMode(null)
    } else {
      setSelectedScene(selectedScene === sceneId ? null : sceneId)
    }
  }

  const confirmConnection = () => {
    if (!pendingConn) return
    const conn: SceneConnection = {
      id: crypto.randomUUID(),
      story_id: current.story.id,
      scene_from_id: pendingConn.from,
      scene_to_id: pendingConn.to,
      label: connLabel,
    }
    addSceneConnection(conn)
    setPendingConn(null)
    setConnLabel('')
  }

  // Find scene index by id
  const sceneIdx = useCallback(
    (id: string) => sortedScenes.findIndex(s => s.id === id),
    [sortedScenes]
  )

  // Act boundaries
  const actBoundaries = useMemo(() => {
    if (!fw) return []
    const bounds: { x: number; label: string }[] = []
    for (let i = 0; i < sortedScenes.length - 1; i++) {
      const a = sortedScenes[i].act_index
      const b = sortedScenes[i + 1].act_index
      if (a !== b && a !== null && b !== null) {
        const x = sceneX(i) + NODE_W + GAP / 2
        const stage = fw.stages.find(s => s.index === b)
        bounds.push({ x, label: stage?.name || '' })
      }
    }
    return bounds
  }, [sortedScenes, fw, sceneX])

  if (sortedScenes.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p className="text-lg mb-2">Nenhuma cena ainda</p>
        <p className="text-sm">Crie cenas na aba "Cenas" para visualizar o fluxo da história.</p>
      </div>
    )
  }

  // Tension curve SVG path
  const tensionY = (val: number) => {
    const normalized = (val + tensionData.max) / (tensionData.max * 2)
    return CURVE_TOP + CURVE_H - normalized * CURVE_H
  }

  const tensionLinePath = sortedScenes
    .map((_, i) => `${i === 0 ? 'M' : 'L'} ${sceneCenter(i)} ${tensionY(tensionData.points[i])}`)
    .join(' ')

  const tensionAreaPath = `${tensionLinePath} L ${sceneCenter(sortedScenes.length - 1)} ${tensionY(0)} L ${sceneCenter(0)} ${tensionY(0)} Z`

  return (
    <div className="px-4 py-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 max-w-7xl mx-auto">
        <h2 className="text-xl font-serif text-gold">Fluxo</h2>
        <div className="flex-1" />
        <button
          onClick={() => setShowSwimLanes(!showSwimLanes)}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            showSwimLanes
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-bg-tertiary text-text-muted border border-transparent'
          }`}
        >
          Personagens
        </button>
        <button
          onClick={() => setConnectionMode(connectionMode ? null : { fromId: '' })}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            connectionMode
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-bg-tertiary text-text-muted border border-transparent'
          }`}
        >
          {connectionMode ? 'Cancelar Conexão' : 'Conectar Cenas'}
        </button>
      </div>

      {connectionMode && (
        <div className="max-w-7xl mx-auto mb-3 text-xs text-gold bg-gold/10 border border-gold/20 rounded px-3 py-2">
          {connectionMode.fromId
            ? 'Clique na cena de destino para criar a conexão.'
            : 'Clique na cena de origem para iniciar a conexão.'}
        </div>
      )}

      {/* Scrollable canvas */}
      <div className="overflow-x-auto max-w-7xl mx-auto">
        <div className="relative" style={{ width: Math.max(totalW, 600), height: totalH }}>
          {/* SVG layer */}
          <svg
            className="absolute inset-0"
            width={Math.max(totalW, 600)}
            height={totalH}
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--color-border)" />
              </marker>
              <marker
                id="arrowhead-gold"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--color-gold)" opacity="0.6" />
              </marker>
            </defs>

            {/* Sequential arrows */}
            {sortedScenes.map((_, i) => {
              if (i === sortedScenes.length - 1) return null
              const x1 = sceneX(i) + NODE_W
              const x2 = sceneX(i + 1)
              const y = NODE_H / 2
              return (
                <line
                  key={`seq-${i}`}
                  x1={x1} y1={y} x2={x2} y2={y}
                  stroke="var(--color-border)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                />
              )
            })}

            {/* Act boundaries */}
            {actBoundaries.map((b, i) => (
              <g key={`act-${i}`}>
                <line
                  x1={b.x} y1={0} x2={b.x} y2={totalH}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                <text
                  x={b.x}
                  y={NODE_H + 20}
                  fill="var(--color-text-muted)"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {b.label}
                </text>
              </g>
            ))}

            {/* Custom connections (SceneConnection arcs) */}
            {current.sceneConnections.map(conn => {
              const fi = sceneIdx(conn.scene_from_id)
              const ti = sceneIdx(conn.scene_to_id)
              if (fi < 0 || ti < 0) return null
              const x1 = sceneCenter(fi)
              const x2 = sceneCenter(ti)
              const dist = Math.abs(ti - fi)
              const arcY = -30 - dist * 15
              const midX = (x1 + x2) / 2
              const path = `M ${x1} 0 C ${x1} ${arcY}, ${x2} ${arcY}, ${x2} 0`
              return (
                <g key={conn.id} style={{ pointerEvents: 'auto' }} className="group">
                  <path
                    d={path}
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth={1.5}
                    opacity={0.5}
                    markerEnd="url(#arrowhead-gold)"
                    className="group-hover:opacity-100 transition-opacity"
                  />
                  {conn.label && (
                    <text
                      x={midX}
                      y={arcY / 2 - 4}
                      fill="var(--color-gold)"
                      fontSize={10}
                      textAnchor="middle"
                      opacity={0.7}
                      className="group-hover:opacity-100"
                    >
                      {conn.label}
                    </text>
                  )}
                  <text
                    x={midX + (conn.label ? conn.label.length * 3 + 8 : 0)}
                    y={arcY / 2 - 4}
                    fill="var(--color-negative)"
                    fontSize={11}
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => removeSceneConnection(conn.id)}
                  >
                    ✕
                  </text>
                </g>
              )
            })}

            {/* Tension curve - zero line */}
            <line
              x1={PAD_LEFT}
              y1={tensionY(0)}
              x2={sceneX(sortedScenes.length - 1) + NODE_W}
              y2={tensionY(0)}
              stroke="var(--color-border)"
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.5}
            />

            {/* Tension area */}
            {sortedScenes.length > 1 && (
              <>
                <path
                  d={tensionAreaPath}
                  fill="var(--color-gold)"
                  opacity={0.08}
                />
                <path
                  d={tensionLinePath}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth={2}
                  opacity={0.8}
                />
              </>
            )}

            {/* Tension dots */}
            {tensionData.points.map((t, i) => (
              <g key={`dot-${i}`}>
                <circle
                  cx={sceneCenter(i)}
                  cy={tensionY(t)}
                  r={4}
                  fill={t >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
                  opacity={0.8}
                />
                <title>{sortedScenes[i].title || `Cena ${i + 1}`}: {t > 0 ? '+' : ''}{t}</title>
              </g>
            ))}

            {/* Tension labels */}
            <text x={PAD_LEFT - 4} y={CURVE_TOP + 4} fill="var(--color-text-muted)" fontSize={9} textAnchor="end">+</text>
            <text x={PAD_LEFT - 4} y={CURVE_TOP + CURVE_H} fill="var(--color-text-muted)" fontSize={9} textAnchor="end">-</text>

            {/* Swim lanes */}
            {showSwimLanes && current.characters.map((char, ci) => {
              const laneY = swimLanesTop + ci * (LANE_H + LANE_GAP)
              return (
                <g key={char.id}>
                  {/* Lane background */}
                  <rect
                    x={PAD_LEFT}
                    y={laneY}
                    width={totalW - PAD_LEFT - PAD_RIGHT}
                    height={LANE_H}
                    fill={ci % 2 === 0 ? 'var(--color-surface)' : 'transparent'}
                    opacity={0.3}
                    rx={4}
                  />
                  {/* Character label */}
                  <text
                    x={PAD_LEFT - 8}
                    y={laneY + LANE_H / 2 + 4}
                    fill="var(--color-text-muted)"
                    fontSize={11}
                    textAnchor="end"
                  >
                    {(char.name || '?').slice(0, 12)}
                  </text>
                  {/* Presence dots */}
                  {sortedScenes.map((sc, si) => {
                    if (!sc.characters.includes(char.id)) return null
                    return (
                      <circle
                        key={`${char.id}-${sc.id}`}
                        cx={sceneCenter(si)}
                        cy={laneY + LANE_H / 2}
                        r={6}
                        fill={sc.charge_end === '+' ? 'var(--color-positive)' : 'var(--color-negative)'}
                        opacity={0.6}
                      >
                        <title>{char.name} em "{sc.title || `Cena ${si + 1}`}"</title>
                      </circle>
                    )
                  })}
                </g>
              )
            })}
          </svg>

          {/* Scene nodes (HTML) */}
          {sortedScenes.map((scene, i) => {
            const isSelected = selectedScene === scene.id
            const isConnSource = connectionMode?.fromId === scene.id
            const isConnMode = !!connectionMode
            const isStatic = scene.charge_start === scene.charge_end
            const charNames = scene.characters
              .map(id => current.characters.find(c => c.id === id))
              .filter(Boolean)

            return (
              <div
                key={scene.id}
                className={`absolute rounded-lg border-2 p-2 transition-all cursor-pointer select-none ${
                  isConnSource
                    ? 'border-gold ring-2 ring-gold/40 bg-surface'
                    : isConnMode
                    ? 'border-border hover:border-gold/50 bg-surface'
                    : isSelected
                    ? 'border-gold bg-surface'
                    : scene.charge_end === '+'
                    ? 'border-positive/40 bg-surface hover:border-positive/70'
                    : 'border-negative/40 bg-surface hover:border-negative/70'
                } ${isStatic ? 'border-warning/50' : ''}`}
                style={{
                  left: sceneX(i),
                  top: 0,
                  width: NODE_W,
                  height: NODE_H,
                }}
                onClick={() => {
                  if (isConnMode && !connectionMode?.fromId) {
                    setConnectionMode({ fromId: scene.id })
                  } else {
                    handleSceneClick(scene.id)
                  }
                }}
              >
                {/* Scene number */}
                <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-bg-secondary border border-border text-text-muted text-[10px] flex items-center justify-center">
                  {i + 1}
                </span>

                {/* Title */}
                <div className="text-xs font-medium text-text truncate mb-1">
                  {scene.title || <span className="text-text-muted italic">Sem título</span>}
                </div>

                {/* Charge */}
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-[10px] ${scene.charge_start === '+' ? 'text-positive' : 'text-negative'}`}>
                    {scene.charge_start}
                  </span>
                  <span className="text-text-muted text-[10px]">→</span>
                  <span className={`text-[10px] ${scene.charge_end === '+' ? 'text-positive' : 'text-negative'}`}>
                    {scene.charge_end}
                  </span>
                  {isStatic && <span className="text-warning text-[10px] ml-1">⚠</span>}
                  <span className="text-text-muted text-[10px] ml-auto">
                    {scene.weight === 'heavy' ? '■■■' : scene.weight === 'medium' ? '■■' : '■'}
                  </span>
                </div>

                {/* Characters */}
                {charNames.length > 0 && (
                  <div className="flex gap-0.5 mt-auto">
                    {charNames.slice(0, 4).map(c => (
                      <span
                        key={c!.id}
                        className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[9px] flex items-center justify-center"
                        title={c!.name}
                      >
                        {(c!.name || '?')[0]}
                      </span>
                    ))}
                    {charNames.length > 4 && (
                      <span className="text-text-muted text-[9px] self-center">+{charNames.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Act label if assigned */}
                {scene.act_index !== null && fw && (
                  <div className="absolute -bottom-2 left-2 text-[9px] text-text-muted bg-bg-secondary border border-border rounded px-1">
                    {fw.stages.find(s => s.index === scene.act_index)?.name || ''}
                  </div>
                )}
              </div>
            )
          })}

          {/* Scene detail popover */}
          {selectedScene && (() => {
            const idx = sceneIdx(selectedScene)
            const scene = sortedScenes[idx]
            if (!scene) return null
            return (
              <div
                className="absolute bg-bg-secondary border border-border rounded-lg p-3 shadow-lg z-10"
                style={{
                  left: sceneX(idx),
                  top: NODE_H + 8,
                  width: NODE_W + 60,
                  maxWidth: 260,
                }}
              >
                <div className="text-sm font-medium text-text mb-2">
                  {scene.title || 'Sem título'}
                </div>
                {scene.conflict && (
                  <div className="mb-1">
                    <span className="text-[10px] text-text-muted uppercase">Conflito</span>
                    <p className="text-xs text-text-secondary">{scene.conflict}</p>
                  </div>
                )}
                {scene.value_at_stake && (
                  <div className="mb-1">
                    <span className="text-[10px] text-text-muted uppercase">Valor em jogo</span>
                    <p className="text-xs text-text-secondary">{scene.value_at_stake}</p>
                  </div>
                )}
                {scene.change && (
                  <div className="mb-1">
                    <span className="text-[10px] text-text-muted uppercase">O que muda</span>
                    <p className="text-xs text-text-secondary">{scene.change}</p>
                  </div>
                )}
                <button
                  onClick={() => setSelectedScene(null)}
                  className="text-text-muted text-xs hover:text-text cursor-pointer mt-1"
                >
                  Fechar
                </button>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Connection label modal */}
      <Modal
        open={!!pendingConn}
        onClose={() => setPendingConn(null)}
        title="Conexão entre Cenas"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            De: <span className="text-text">{sortedScenes[sceneIdx(pendingConn?.from || '')]?.title || 'Sem título'}</span>
            {' → '}
            Para: <span className="text-text">{sortedScenes[sceneIdx(pendingConn?.to || '')]?.title || 'Sem título'}</span>
          </p>
          <div>
            <label className="text-xs text-text-muted block mb-1">Rótulo (opcional)</label>
            <input
              value={connLabel}
              onChange={e => setConnLabel(e.target.value)}
              placeholder="ex: consequência, paralelo, foreshadowing..."
              className="input-field w-full"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && confirmConnection()}
            />
          </div>
          <button
            onClick={confirmConnection}
            className="px-4 py-2 bg-gold text-bg rounded-lg text-sm font-medium hover:bg-gold-hover transition-colors cursor-pointer w-full"
          >
            Criar Conexão
          </button>
        </div>
      </Modal>
    </div>
  )
}
