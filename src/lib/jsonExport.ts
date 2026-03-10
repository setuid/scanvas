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

export function importStoryFromJson(json: string) {
  const data = JSON.parse(json)
  const store = useStoryStore.getState()

  // Assign new IDs to avoid conflicts
  const newId = crypto.randomUUID()
  data.story.id = newId
  data.story.user_id = store.userId || 'local'
  data.story.created_at = new Date().toISOString()
  data.story.updated_at = new Date().toISOString()

  store.loadStory({
    story: data.story,
    acts: data.acts || [],
    characters: data.characters || [],
    relations: data.relations || [],
    scenes: data.scenes || [],
    sceneConnections: data.sceneConnections || [],
    subplots: data.subplots || [],
    promises: data.promises || [],
    informationReveals: data.informationReveals || [],
    worldNotes: data.worldNotes || [],
    boardNotes: data.boardNotes || [],
    characterArcPoints: data.characterArcPoints || [],
  })

  store.addStoryToList(data.story)
}
