import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Story, StoryAct, Character, CharacterRelation, Scene,
  SceneConnection, Subplot, NarrativePromise, InformationReveal,
  WorldNote, BoardNote, CharacterArcPoint,
} from '@/types'

// ============================================================
// Story Canvas — Supabase Sync Layer
// ============================================================

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
    supabase.from('characters').select('*').eq('story_id', storyId),
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

export async function saveStoryToSupabase(data: StoryData): Promise<boolean> {
  if (!supabase) return false

  const storyId = data.story.id

  try {
    // 1. Upsert story
    const { error: storyErr } = await supabase
      .from('stories')
      .upsert(data.story, { onConflict: 'id' })
    if (storyErr) throw storyErr

    // 2. Sync child tables using delete + insert pattern
    // This is simpler and more reliable than trying to diff individual rows
    await Promise.all([
      syncTable('story_acts', storyId, data.acts),
      syncTable('characters', storyId, data.characters),
      syncTable('character_relations', storyId, data.relations),
      syncTable('scenes', storyId, data.scenes),
      syncTable('scene_connections', storyId, data.sceneConnections),
      syncTable('subplots', storyId, data.subplots),
      syncTable('promises', storyId, data.promises),
      syncTable('information_reveals', storyId, data.informationReveals),
      syncTable('world_notes', storyId, data.worldNotes),
      syncTable('board_notes', storyId, data.boardNotes),
      syncTable('character_arc_points', storyId, data.characterArcPoints),
    ])

    return true
  } catch (err) {
    console.error('Failed to save story to Supabase:', err)
    return false
  }
}

async function syncTable(table: string, storyId: string, rows: any[]) {
  if (!supabase) return

  // Delete existing rows for this story
  const { error: delErr } = await supabase
    .from(table)
    .delete()
    .eq('story_id', storyId)
  if (delErr) throw delErr

  // Insert new rows (if any)
  if (rows.length > 0) {
    const { error: insErr } = await supabase
      .from(table)
      .insert(rows)
    if (insErr) throw insErr
  }
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

// --- Check if supabase is ready (configured + authenticated) ---

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured
}
