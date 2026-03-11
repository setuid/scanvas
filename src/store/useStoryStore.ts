import { create } from 'zustand'
import type {
  Story, StoryAct, Character, CharacterRelation, Scene,
  SceneConnection, Subplot, NarrativePromise, InformationReveal,
  WorldNote, BoardNote, CharacterArcPoint,
} from '@/types'
import { createEmptyStory } from '@/types'

interface StoryData {
  story: Story
  acts: StoryAct[]
  characters: Character[]
  relations: CharacterRelation[]
  scenes: Scene[]
  sceneConnections: SceneConnection[]
  subplots: Subplot[]
  promises: NarrativePromise[]
  informationReveals: InformationReveal[]
  worldNotes: WorldNote[]
  boardNotes: BoardNote[]
  characterArcPoints: CharacterArcPoint[]
}

function emptyStoryData(userId: string): StoryData {
  return {
    story: createEmptyStory(userId),
    acts: [],
    characters: [],
    relations: [],
    scenes: [],
    sceneConnections: [],
    subplots: [],
    promises: [],
    informationReveals: [],
    worldNotes: [],
    boardNotes: [],
    characterArcPoints: [],
  }
}

interface StoryStore {
  // Auth
  userId: string | null
  setUserId: (id: string | null) => void

  // Stories list (home)
  stories: Story[]
  setStories: (stories: Story[]) => void
  addStoryToList: (story: Story) => void
  removeStoryFromList: (id: string) => void

  // Current story data
  current: StoryData | null
  isDirty: boolean

  // Actions
  loadStory: (data: StoryData) => void
  newStory: () => void
  closeStory: () => void

  // Story field updates
  updateStory: (fields: Partial<Story>) => void

  // Acts
  setActs: (acts: StoryAct[]) => void
  updateAct: (id: string, fields: Partial<StoryAct>) => void

  // Characters
  addCharacter: (char: Character) => void
  updateCharacter: (id: string, fields: Partial<Character>) => void
  removeCharacter: (id: string) => void
  moveCharacter: (id: string, direction: 'up' | 'down') => void

  // Scenes
  addScene: (scene: Scene) => void
  updateScene: (id: string, fields: Partial<Scene>) => void
  removeScene: (id: string) => void

  // Subplots
  addSubplot: (subplot: Subplot) => void
  updateSubplot: (id: string, fields: Partial<Subplot>) => void
  removeSubplot: (id: string) => void

  // Promises
  addPromise: (promise: NarrativePromise) => void
  updatePromise: (id: string, fields: Partial<NarrativePromise>) => void
  removePromise: (id: string) => void

  // Relations
  addRelation: (rel: CharacterRelation) => void
  updateRelation: (id: string, fields: Partial<CharacterRelation>) => void
  removeRelation: (id: string) => void

  // World notes
  addWorldNote: (note: WorldNote) => void
  updateWorldNote: (id: string, fields: Partial<WorldNote>) => void
  removeWorldNote: (id: string) => void

  // Board notes
  addBoardNote: (note: BoardNote) => void
  updateBoardNote: (id: string, fields: Partial<BoardNote>) => void
  removeBoardNote: (id: string) => void

  // Mark clean
  markClean: () => void
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  stories: [],
  setStories: (stories) => set({ stories }),
  addStoryToList: (story) => set(s => ({ stories: [...s.stories, story] })),
  removeStoryFromList: (id) => set(s => ({ stories: s.stories.filter(st => st.id !== id) })),

  current: null,
  isDirty: false,

  loadStory: (data) => set({ current: data, isDirty: false }),
  newStory: () => {
    const userId = get().userId || 'local'
    const data = emptyStoryData(userId)
    set({ current: data, isDirty: true })
  },
  closeStory: () => set({ current: null, isDirty: false }),

  updateStory: (fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        story: { ...s.current.story, ...fields, updated_at: new Date().toISOString() },
      },
      isDirty: true,
    }
  }),

  setActs: (acts) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, acts }, isDirty: true }
  }),
  updateAct: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        acts: s.current.acts.map(a => a.id === id ? { ...a, ...fields } : a),
      },
      isDirty: true,
    }
  }),

  addCharacter: (char) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, characters: [...s.current.characters, char] }, isDirty: true }
  }),
  updateCharacter: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        characters: s.current.characters.map(c => c.id === id ? { ...c, ...fields } : c),
      },
      isDirty: true,
    }
  }),
  removeCharacter: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        characters: s.current.characters.filter(c => c.id !== id),
      },
      isDirty: true,
    }
  }),
  moveCharacter: (id, direction) => set(s => {
    if (!s.current) return s
    const chars = [...s.current.characters]
    const idx = chars.findIndex(c => c.id === id)
    if (idx < 0) return s
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= chars.length) return s
    ;[chars[idx], chars[targetIdx]] = [chars[targetIdx], chars[idx]]
    return { current: { ...s.current, characters: chars }, isDirty: true }
  }),

  addScene: (scene) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, scenes: [...s.current.scenes, scene] }, isDirty: true }
  }),
  updateScene: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        scenes: s.current.scenes.map(sc => sc.id === id ? { ...sc, ...fields } : sc),
      },
      isDirty: true,
    }
  }),
  removeScene: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        scenes: s.current.scenes.filter(sc => sc.id !== id),
      },
      isDirty: true,
    }
  }),

  addSubplot: (subplot) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, subplots: [...s.current.subplots, subplot] }, isDirty: true }
  }),
  updateSubplot: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        subplots: s.current.subplots.map(sp => sp.id === id ? { ...sp, ...fields } : sp),
      },
      isDirty: true,
    }
  }),
  removeSubplot: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        subplots: s.current.subplots.filter(sp => sp.id !== id),
      },
      isDirty: true,
    }
  }),

  addPromise: (promise) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, promises: [...s.current.promises, promise] }, isDirty: true }
  }),
  updatePromise: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        promises: s.current.promises.map(p => p.id === id ? { ...p, ...fields } : p),
      },
      isDirty: true,
    }
  }),
  removePromise: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        promises: s.current.promises.filter(p => p.id !== id),
      },
      isDirty: true,
    }
  }),

  addRelation: (rel) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, relations: [...s.current.relations, rel] }, isDirty: true }
  }),
  updateRelation: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        relations: s.current.relations.map(r => r.id === id ? { ...r, ...fields } : r),
      },
      isDirty: true,
    }
  }),
  removeRelation: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        relations: s.current.relations.filter(r => r.id !== id),
      },
      isDirty: true,
    }
  }),

  addWorldNote: (note) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, worldNotes: [...s.current.worldNotes, note] }, isDirty: true }
  }),
  updateWorldNote: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        worldNotes: s.current.worldNotes.map(n => n.id === id ? { ...n, ...fields } : n),
      },
      isDirty: true,
    }
  }),
  removeWorldNote: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        worldNotes: s.current.worldNotes.filter(n => n.id !== id),
      },
      isDirty: true,
    }
  }),

  addBoardNote: (note) => set(s => {
    if (!s.current) return s
    return { current: { ...s.current, boardNotes: [...s.current.boardNotes, note] }, isDirty: true }
  }),
  updateBoardNote: (id, fields) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        boardNotes: s.current.boardNotes.map(n => n.id === id ? { ...n, ...fields } : n),
      },
      isDirty: true,
    }
  }),
  removeBoardNote: (id) => set(s => {
    if (!s.current) return s
    return {
      current: {
        ...s.current,
        boardNotes: s.current.boardNotes.filter(n => n.id !== id),
      },
      isDirty: true,
    }
  }),

  markClean: () => set({ isDirty: false }),
}))
