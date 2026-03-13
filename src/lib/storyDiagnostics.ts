import type {
  Story, StoryAct, Character, Scene, NarrativePromise,
  CharacterArcPoint, NarrativeFramework,
} from '@/types'

export type DiagnosticSeverity = 'error' | 'warning' | 'ok'
export type DiagnosticTarget = 'structure' | 'scenes' | 'characters' | 'promises'

export interface Diagnostic {
  id: string
  severity: DiagnosticSeverity
  message: string
  detail?: string
  action: string
  target: DiagnosticTarget
  targetId?: string
}

interface StorySnapshot {
  story: Story
  acts: StoryAct[]
  characters: Character[]
  scenes: Scene[]
  promises: NarrativePromise[]
  characterArcPoints: CharacterArcPoint[]
}

export function runDiagnostics(data: StorySnapshot, fw: NarrativeFramework | undefined): Diagnostic[] {
  const results: Diagnostic[] = []
  results.push(...analyzeMissingStages(data, fw))
  results.push(...analyzeOpenPromises(data))
  results.push(...analyzeCharacterPresence(data))
  results.push(...analyzeTensionFlow(data))
  results.push(...analyzeCharacterArcs(data))
  results.push(...analyzeCompletedStages(data, fw))
  return results
}

function analyzeMissingStages(data: StorySnapshot, fw: NarrativeFramework | undefined): Diagnostic[] {
  if (!fw) return []
  const results: Diagnostic[] = []
  const sortedScenes = [...data.scenes].sort((a, b) => a.sort_order - b.sort_order)

  for (const stage of fw.stages) {
    const act = data.acts.find(a => a.act_index === stage.index)
    const scenesInStage = data.scenes.filter(s => s.act_index === stage.index)
    const hasDescription = act?.description?.trim()

    if (!hasDescription && scenesInStage.length === 0) {
      results.push({
        id: `missing-stage-${stage.index}`,
        severity: 'error',
        message: `"${stage.name}" esta vazio`,
        detail: `Nenhuma cena e nenhuma descricao neste estagio do framework.`,
        action: 'Ir para Estrutura',
        target: 'structure',
      })
    } else if (scenesInStage.length === 0 && hasDescription) {
      results.push({
        id: `no-scenes-stage-${stage.index}`,
        severity: 'warning',
        message: `"${stage.name}" sem cenas`,
        detail: `O estagio tem descricao mas nenhuma cena associada.`,
        action: 'Criar cena',
        target: 'scenes',
      })
    }
  }

  // Identify current position in the framework
  if (sortedScenes.length > 0) {
    const lastScene = sortedScenes[sortedScenes.length - 1]
    if (lastScene.act_index !== null) {
      const currentStageIdx = lastScene.act_index
      const nextStage = fw.stages.find(s => s.index === currentStageIdx + 1)
      if (nextStage) {
        const nextScenes = data.scenes.filter(s => s.act_index === nextStage.index)
        if (nextScenes.length === 0) {
          results.push({
            id: 'next-stage-hint',
            severity: 'warning',
            message: `Proximo estagio: "${nextStage.name}"`,
            detail: nextStage.guidingQuestion,
            action: 'Ir para Estrutura',
            target: 'structure',
          })
        }
      }
    }
  }

  return results
}

function analyzeOpenPromises(data: StorySnapshot): Diagnostic[] {
  const open = data.promises.filter(p => p.status === 'open')
  if (open.length === 0) return []

  return open.map(p => ({
    id: `open-promise-${p.id}`,
    severity: 'warning' as const,
    message: `Promessa aberta: "${p.name}"`,
    detail: p.notes || 'Sem payoff definido — considere resolver ou abandonar.',
    action: 'Ver promessas',
    target: 'scenes' as const,
    targetId: p.id,
  }))
}

function analyzeCharacterPresence(data: StorySnapshot): Diagnostic[] {
  if (data.characters.length === 0 || data.scenes.length === 0) return []
  const results: Diagnostic[] = []

  for (const ch of data.characters) {
    const sceneCount = data.scenes.filter(s => s.characters.includes(ch.id)).length
    if (sceneCount === 0) {
      results.push({
        id: `char-absent-${ch.id}`,
        severity: 'warning',
        message: `"${ch.name || 'Sem nome'}" nao aparece em nenhuma cena`,
        detail: 'Personagem criado mas sem participacao em cenas.',
        action: 'Ver personagens',
        target: 'characters',
        targetId: ch.id,
      })
    } else if (sceneCount === 1 && data.scenes.length >= 4) {
      results.push({
        id: `char-rare-${ch.id}`,
        severity: 'warning',
        message: `"${ch.name || 'Sem nome'}" aparece em apenas 1 cena`,
        detail: `Com ${data.scenes.length} cenas, este personagem pode estar sub-representado.`,
        action: 'Ver personagens',
        target: 'characters',
        targetId: ch.id,
      })
    }
  }

  return results
}

function analyzeTensionFlow(data: StorySnapshot): Diagnostic[] {
  const sorted = [...data.scenes].sort((a, b) => a.sort_order - b.sort_order)
  if (sorted.length < 3) return []
  const results: Diagnostic[] = []

  // Detect 3+ consecutive scenes with same polarity end
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].charge_end === sorted[i - 1].charge_end) {
      streak++
      if (streak >= 3) {
        results.push({
          id: `flat-tension-${i}`,
          severity: 'warning',
          message: `${streak} cenas seguidas terminam em "${sorted[i].charge_end}"`,
          detail: 'A tensao pode estar estagnada. Considere alternar a polaridade para criar dinamismo.',
          action: 'Ver cenas',
          target: 'scenes',
        })
        break
      }
    } else {
      streak = 1
    }
  }

  // Detect static scenes (start == end)
  const staticScenes = sorted.filter(s => s.charge_start === s.charge_end && s.title)
  if (staticScenes.length > 0 && staticScenes.length >= sorted.length * 0.5) {
    results.push({
      id: 'many-static-scenes',
      severity: 'warning',
      message: `${staticScenes.length} de ${sorted.length} cenas sao estaticas`,
      detail: 'Cenas estaticas (mesma carga inicio/fim) nao geram mudanca. Considere revisar.',
      action: 'Ver cenas',
      target: 'scenes',
    })
  }

  return results
}

function analyzeCharacterArcs(data: StorySnapshot): Diagnostic[] {
  if (data.characters.length === 0) return []
  const results: Diagnostic[] = []

  for (const ch of data.characters) {
    const hasArcDefined = ch.arc?.trim()
    const arcPoints = data.characterArcPoints.filter(p => p.character_id === ch.id)

    if (hasArcDefined && arcPoints.length === 0 && data.scenes.length >= 3) {
      results.push({
        id: `arc-no-points-${ch.id}`,
        severity: 'warning',
        message: `Arco de "${ch.name}" sem pontos de desenvolvimento`,
        detail: `O arco "${ch.arc}" esta definido, mas nao ha pontos de arco em cenas.`,
        action: 'Ver personagens',
        target: 'characters',
        targetId: ch.id,
      })
    }
  }

  return results
}

function analyzeCompletedStages(data: StorySnapshot, fw: NarrativeFramework | undefined): Diagnostic[] {
  if (!fw) return []
  const results: Diagnostic[] = []

  let completedCount = 0
  for (const stage of fw.stages) {
    const act = data.acts.find(a => a.act_index === stage.index)
    const scenesInStage = data.scenes.filter(s => s.act_index === stage.index)
    if (act?.description?.trim() && scenesInStage.length > 0) {
      completedCount++
    }
  }

  if (completedCount > 0) {
    results.push({
      id: 'completed-stages',
      severity: 'ok',
      message: `${completedCount} de ${fw.stages.length} estagios completos`,
      detail: 'Estagios com descricao e ao menos uma cena associada.',
      action: 'Ver estrutura',
      target: 'structure',
    })
  }

  return results
}
