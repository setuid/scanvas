import { useStoryStore } from '@/store/useStoryStore'

export function exportStoryToJson(): string {
  const { current } = useStoryStore.getState()
  if (!current) throw new Error('No story loaded')

  const data = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    ...current,
  }

  return JSON.stringify(data, null, 2)
}

export function downloadStoryJson() {
  const json = exportStoryToJson()
  const { current } = useStoryStore.getState()
  const title = current?.story.title || 'story-canvas'
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// --- Import ---

interface StoryData {
  story: import('@/types').Story
  acts: import('@/types').StoryAct[]
  characters: import('@/types').Character[]
  relations: import('@/types').CharacterRelation[]
  scenes: import('@/types').Scene[]
  sceneConnections: import('@/types').SceneConnection[]
  subplots: import('@/types').Subplot[]
  promises: import('@/types').NarrativePromise[]
  informationReveals: import('@/types').InformationReveal[]
  worldNotes: import('@/types').WorldNote[]
  boardNotes: import('@/types').BoardNote[]
  characterArcPoints: import('@/types').CharacterArcPoint[]
}

/**
 * Parse a Story Canvas JSON export and return StoryData with fully remapped IDs.
 * All internal references (character IDs in scenes, scene IDs in promises, etc.)
 * are updated to point to the new IDs.
 */
export function importStoryFromJson(json: string, userId: string): StoryData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = JSON.parse(json) as any

  if (!raw.story?.id) {
    throw new Error('JSON inválido: campo "story" não encontrado.')
  }

  // Build old→new ID map for every record
  const idMap = new Map<string, string>()
  const remap = (oldId: string | null | undefined): string | null => {
    if (!oldId) return null
    return idMap.get(oldId) ?? oldId
  }
  const remapArr = (arr: string[] | undefined): string[] => {
    if (!arr) return []
    return arr.map(id => idMap.get(id) ?? id)
  }

  // Generate new IDs for story + all children
  const newStoryId = crypto.randomUUID()
  idMap.set(raw.story.id, newStoryId)

  const collections = [
    'acts', 'characters', 'scenes', 'relations',
    'sceneConnections', 'subplots', 'promises',
    'informationReveals', 'worldNotes', 'boardNotes', 'characterArcPoints',
  ] as const
  for (const key of collections) {
    const arr = raw[key]
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item.id) {
          idMap.set(item.id, crypto.randomUUID())
        }
      }
    }
  }

  const now = new Date().toISOString()

  // Remap story
  const story = {
    ...raw.story,
    id: newStoryId,
    user_id: userId,
    parent_story_id: null,
    fork_point: null,
    status: 'active' as const,
    created_at: now,
    updated_at: now,
  }

  // Remap acts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acts = (raw.acts || []).map((a: any) => ({
    ...a,
    id: remap(a.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
  }))

  // Remap characters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const characters = (raw.characters || []).map((c: any) => ({
    ...c,
    id: remap(c.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
  }))

  // Remap scenes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scenes = (raw.scenes || []).map((s: any) => ({
    ...s,
    id: remap(s.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    characters: remapArr(s.characters),
    subplot_id: remap(s.subplot_id),
  }))

  // Remap relations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relations = (raw.relations || []).map((r: any) => ({
    ...r,
    id: remap(r.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    character_a_id: remap(r.character_a_id) ?? r.character_a_id,
    character_b_id: remap(r.character_b_id) ?? r.character_b_id,
  }))

  // Remap scene connections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneConnections = (raw.sceneConnections || []).map((c: any) => ({
    ...c,
    id: remap(c.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    scene_from_id: remap(c.scene_from_id) ?? c.scene_from_id,
    scene_to_id: remap(c.scene_to_id) ?? c.scene_to_id,
  }))

  // Remap subplots
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subplots = (raw.subplots || []).map((s: any) => ({
    ...s,
    id: remap(s.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    characters: remapArr(s.characters),
  }))

  // Remap promises
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises = (raw.promises || []).map((p: any) => ({
    ...p,
    id: remap(p.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    setup_scene_id: remap(p.setup_scene_id),
    payoff_scene_id: remap(p.payoff_scene_id),
  }))

  // Remap information reveals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const informationReveals = (raw.informationReveals || []).map((r: any) => ({
    ...r,
    id: remap(r.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    reader_reveal_scene_id: remap(r.reader_reveal_scene_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scenes_known_by: (r.scenes_known_by || []).map((k: any) => ({
      character_id: remap(k.character_id) ?? k.character_id,
      from_scene_id: remap(k.from_scene_id) ?? k.from_scene_id,
    })),
  }))

  // Remap world notes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldNotes = (raw.worldNotes || []).map((n: any) => ({
    ...n,
    id: remap(n.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    linked_characters: remapArr(n.linked_characters),
    linked_scenes: remapArr(n.linked_scenes),
    linked_promises: remapArr(n.linked_promises),
  }))

  // Remap board notes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boardNotes = (raw.boardNotes || []).map((n: any) => ({
    ...n,
    id: remap(n.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
  }))

  // Remap character arc points
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const characterArcPoints = (raw.characterArcPoints || []).map((p: any) => ({
    ...p,
    id: remap(p.id) ?? crypto.randomUUID(),
    story_id: newStoryId,
    character_id: remap(p.character_id) ?? p.character_id,
    scene_id: remap(p.scene_id) ?? p.scene_id,
  }))

  return {
    story,
    acts,
    characters,
    relations,
    scenes,
    sceneConnections,
    subplots,
    promises,
    informationReveals,
    worldNotes,
    boardNotes,
    characterArcPoints,
  }
}
