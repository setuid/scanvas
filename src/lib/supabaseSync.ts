import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Story, StoryAct, Character, CharacterRelation, Scene,
  SceneConnection, Subplot, NarrativePromise, InformationReveal,
  WorldNote, BoardNote, CharacterArcPoint,
} from '@/types'

// ============================================================
// Story Canvas — Supabase Sync Layer
// ============================================================

// --- Column whitelists ---
// Only send these columns to Supabase. This prevents:
// 1. "column does not exist" errors from extra TS-only fields
// 2. NOT NULL violations from mixed batches where some rows have
//    DB-generated fields (created_at, updated_at) and others don't.
//    PostgREST uses column keys from the first row in a batch —
//    if it has created_at but a later row doesn't, PostgREST sends
//    NULL for the missing field, which violates NOT NULL constraints.

const STORY_COLS: (keyof Story)[] = [
  'id', 'user_id', 'title', 'logline', 'premise', 'inciting_incident',
  'genre', 'framework', 'theme_central', 'theme_question', 'theme_message',
  'theme_value', 'theme_declaration', 'parent_story_id', 'fork_point',
  'status', 'created_at', 'updated_at',
]

const ACT_COLS = [
  'id', 'story_id', 'framework', 'act_index', 'act_name', 'description',
  // Note: guiding_answer deliberately excluded — column may not exist in DB yet
] as const

const CHARACTER_COLS = [
  'id', 'story_id', 'name', 'role', 'archetypes', 'desire', 'need',
  'fear', 'flaw', 'save_the_cat', 'arc', 'backstory', 'notes', 'sort_order',
  // created_at, updated_at excluded — let DB assign defaults
] as const

const SCENE_COLS = [
  'id', 'story_id', 'title', 'act_index', 'subplot_id', 'characters',
  'value_at_stake', 'charge_start', 'charge_end', 'conflict', 'change',
  'gap_expected', 'gap_actual', 'weight', 'position_x', 'position_y',
  'sort_order', 'notes',
  // created_at, updated_at excluded — let DB assign defaults
] as const

const RELATION_COLS = [
  'id', 'story_id', 'character_a_id', 'character_b_id', 'label', 'nature',
  'temporal_changes', 'notes',
] as const

const CONNECTION_COLS = [
  'id', 'story_id', 'scene_from_id', 'scene_to_id', 'label',
] as const

const SUBPLOT_COLS = [
  'id', 'story_id', 'name', 'type', 'characters', 'theme_connection',
  'arc_start', 'arc_development', 'arc_resolution', 'notes',
] as const

const PROMISE_COLS = [
  'id', 'story_id', 'name', 'type', 'setup_scene_id', 'payoff_scene_id',
  'status', 'notes',
] as const

const REVEAL_COLS = [
  'id', 'story_id', 'description', 'scenes_known_by',
  'reader_reveal_scene_id', 'dramatic_irony', 'notes',
] as const

const WORLD_NOTE_COLS = [
  'id', 'story_id', 'category', 'title', 'content',
  'linked_characters', 'linked_scenes', 'linked_promises',
] as const

const BOARD_NOTE_COLS = [
  'id', 'story_id', 'content', 'position_x', 'position_y', 'color',
] as const

const ARC_POINT_COLS = [
  'id', 'story_id', 'character_id', 'scene_id', 'level', 'notes',
] as const

// Pick only whitelisted columns from each row
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickColumns(rows: any[], cols: readonly string[]): any[] {
  return rows.map(row => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = {}
    for (const c of cols) {
      if (c in row) out[c] = row[c]
    }
    return out
  })
}

// --- Save mutex ---
// Prevents concurrent saves from interleaving deletes and inserts,
// which would corrupt data.
let _saveLock: Promise<void> = Promise.resolve()

function withSaveLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = _saveLock
  let resolve: () => void
  _saveLock = new Promise<void>(r => { resolve = r })
  return prev.then(fn).finally(() => resolve!())
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

// --- Save full story ---
// Uses a mutex to prevent concurrent saves from interleaving.
// FK-aware ordering: delete children first, then parents; insert parents first, then children.

export async function saveStoryToSupabase(data: StoryData): Promise<boolean> {
  return withSaveLock(() => _doSave(data))
}

async function _doSave(data: StoryData): Promise<boolean> {
  if (!supabase) return false

  const storyId = data.story.id

  // Prepare rows: whitelist columns and add sort_order for characters
  const storyRow = pickColumns([data.story], STORY_COLS)[0]
  const actRows = pickColumns(data.acts, ACT_COLS)
  const charRows = pickColumns(
    data.characters.map((c, i) => ({ ...c, sort_order: i })),
    CHARACTER_COLS,
  )
  const sceneRows = pickColumns(data.scenes, SCENE_COLS)
  const subplotRows = pickColumns(data.subplots, SUBPLOT_COLS)
  const promiseRows = pickColumns(data.promises, PROMISE_COLS)
  const revealRows = pickColumns(data.informationReveals, REVEAL_COLS)
  const worldRows = pickColumns(data.worldNotes, WORLD_NOTE_COLS)
  const boardRows = pickColumns(data.boardNotes, BOARD_NOTE_COLS)
  const relationRows = pickColumns(data.relations, RELATION_COLS)
  const connectionRows = pickColumns(data.sceneConnections, CONNECTION_COLS)
  const arcRows = pickColumns(data.characterArcPoints, ARC_POINT_COLS)

  try {
    // Phase 1: Delete child tables that have FK references to other child tables
    await Promise.all([
      deleteRows('character_arc_points', storyId),
      deleteRows('scene_connections', storyId),
      deleteRows('character_relations', storyId),
    ])

    // Phase 2: Delete the remaining child tables
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
      .upsert(storyRow, { onConflict: 'id' })
    if (storyErr) throw storyErr

    // Phase 4a: Insert tables that only reference stories (no child-to-child FK)
    await Promise.all([
      insertRows('story_acts', actRows),
      insertRows('characters', charRows),
      insertRows('subplots', subplotRows),
      insertRows('world_notes', worldRows),
      insertRows('board_notes', boardRows),
    ])

    // Phase 4b: Insert scenes (FK → subplots via subplot_id)
    await insertRows('scenes', sceneRows)

    // Phase 4c: Insert tables that reference scenes
    await Promise.all([
      insertRows('promises', promiseRows),
      insertRows('information_reveals', revealRows),
    ])

    // Phase 5: Insert child-of-child tables (FK deps on characters + scenes)
    await Promise.all([
      insertRows('character_relations', relationRows),
      insertRows('scene_connections', connectionRows),
      insertRows('character_arc_points', arcRows),
    ])

    return true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Failed to save story to Supabase:', msg, err)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
