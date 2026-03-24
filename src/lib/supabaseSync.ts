import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Story, StoryAct, Character, CharacterRelation, Scene,
  SceneConnection, Subplot, NarrativePromise, InformationReveal,
  WorldNote, BoardNote, CharacterArcPoint,
} from '@/types'

// ============================================================
// Story Canvas — Supabase Sync Layer
// ============================================================

// Fields that exist in TypeScript types but NOT in Supabase tables.
// Strip these before inserting to prevent "column does not exist" errors
// that would abort the entire save and cause data loss.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripExtraFields(rows: any[], fieldsToRemove: string[]): any[] {
  return rows.map(row => {
    const cleaned = { ...row }
    for (const f of fieldsToRemove) {
      delete cleaned[f]
    }
    return cleaned
  })
}

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

// --- Stories list ---

export async function fetchStoriesFromSupabase(): Promise<Story[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .neq('status', 'deleted')
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('Failed to fetch stories:', error)
    return []
  }
  return data ?? []
}

// --- Load full story ---

export async function loadStoryFromSupabase(storyId: string): Promise<StoryData | null> {
  if (!supabase) return null

  const [
    storyRes,
    actsRes,
    charsRes,
    relationsRes,
    scenesRes,
    connectionsRes,
    subplotsRes,
    promisesRes,
    revealsRes,
    worldRes,
    boardRes,
    arcRes,
  ] = await Promise.all([
    supabase.from('stories').select('*').eq('id', storyId).single(),
    supabase.from('story_acts').select('*').eq('story_id', storyId).order('act_index'),
    supabase.from('characters').select('*').eq('story_id', storyId).order('sort_order'),
    supabase.from('character_relations').select('*').eq('story_id', storyId),
    supabase.from('scenes').select('*').eq('story_id', storyId).order('sort_order'),
    supabase.from('scene_connections').select('*').eq('story_id', storyId),
    supabase.from('subplots').select('*').eq('story_id', storyId),
    supabase.from('promises').select('*').eq('story_id', storyId),
    supabase.from('information_reveals').select('*').eq('story_id', storyId),
    supabase.from('world_notes').select('*').eq('story_id', storyId),
    supabase.from('board_notes').select('*').eq('story_id', storyId),
    supabase.from('character_arc_points').select('*').eq('story_id', storyId),
  ])

  if (storyRes.error || !storyRes.data) {
    console.error('Failed to load story:', storyRes.error)
    return null
  }

  return {
    story: storyRes.data,
    acts: actsRes.data ?? [],
    characters: charsRes.data ?? [],
    relations: relationsRes.data ?? [],
    scenes: scenesRes.data ?? [],
    sceneConnections: connectionsRes.data ?? [],
    subplots: subplotsRes.data ?? [],
    promises: promisesRes.data ?? [],
    informationReveals: revealsRes.data ?? [],
    worldNotes: worldRes.data ?? [],
    boardNotes: boardRes.data ?? [],
    characterArcPoints: arcRes.data ?? [],
  }
}

// --- Save full story (upsert) ---
// FK-aware ordering: delete children first, then parents; insert parents first, then children.

export async function saveStoryToSupabase(data: StoryData): Promise<boolean> {
  if (!supabase) return false

  const storyId = data.story.id

  try {
    // Phase 1: Delete child tables that have FK references to other child tables
    // character_arc_points → characters, scenes
    // scene_connections → scenes
    // character_relations → characters
    // promises → scenes (nullable FK, but still)
    // information_reveals → scenes (nullable FK)
    await Promise.all([
      deleteRows('character_arc_points', storyId),
      deleteRows('scene_connections', storyId),
      deleteRows('character_relations', storyId),
    ])

    // Phase 2: Delete the remaining child tables (no cross-child FK deps)
    await Promise.all([
      deleteRows('story_acts', storyId),
      deleteRows('characters', storyId),
      deleteRows('scenes', storyId),
      deleteRows('subplots', storyId),
      deleteRows('promises', storyId),
      deleteRows('information_reveals', storyId),
      deleteRows('world_notes', storyId),
      deleteRows('board_notes', storyId),
    ])

    // Phase 3: Upsert the story itself
    const { error: storyErr } = await supabase
      .from('stories')
      .upsert(data.story, { onConflict: 'id' })
    if (storyErr) throw storyErr

    // Phase 4: Insert parent child tables (characters, scenes, subplots, acts, etc.)
    // Add sort_order to characters based on array position
    const charactersWithOrder = data.characters.map((c, i) => ({ ...c, sort_order: i }))
    // Strip fields that don't exist in Supabase tables
    const cleanedActs = stripExtraFields(data.acts, ['guiding_answer'])
    await Promise.all([
      insertRows('story_acts', cleanedActs),
      insertRows('characters', charactersWithOrder),
      insertRows('scenes', data.scenes),
      insertRows('subplots', data.subplots),
      insertRows('promises', data.promises),
      insertRows('information_reveals', data.informationReveals),
      insertRows('world_notes', data.worldNotes),
      insertRows('board_notes', data.boardNotes),
    ])

    // Phase 5: Insert child-of-child tables (FK deps on characters/scenes)
    await Promise.all([
      insertRows('character_relations', data.relations),
      insertRows('scene_connections', data.sceneConnections),
      insertRows('character_arc_points', data.characterArcPoints),
    ])

    return true
  } catch (err) {
    console.error('Failed to save story to Supabase:', err)
    return false
  }
}

async function deleteRows(table: string, storyId: string) {
  if (!supabase) return
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('story_id', storyId)
  if (error) throw error
}

async function insertRows(table: string, rows: any[]) {
  if (!supabase || rows.length === 0) return
  const { error } = await supabase
    .from(table)
    .insert(rows)
  if (error) throw error
}

// --- Delete story ---

export async function deleteStoryFromSupabase(storyId: string): Promise<boolean> {
  if (!supabase) return false

  // Soft delete — set status to 'deleted'
  const { error } = await supabase
    .from('stories')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('id', storyId)

  if (error) {
    console.error('Failed to delete story:', error)
    return false
  }
  return true
}

// --- Migrate local stories to Supabase on first login ---

export async function migrateLocalStoriesToSupabase(
  localStories: StoryData[],
  userId: string
): Promise<number> {
  if (!supabase) return 0
  let migrated = 0

  for (const data of localStories) {
    // Update user_id to the authenticated user
    const migratedData: StoryData = {
      ...data,
      story: { ...data.story, user_id: userId },
    }
    const success = await saveStoryToSupabase(migratedData)
    if (success) migrated++
  }

  return migrated
}

// --- Check if supabase is ready (configured + authenticated) ---

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured
}
