// ============================================================
// Story Canvas — Core Types
// ============================================================

export type ChargePolarity = '+' | '-'
export type SceneWeight = 'light' | 'medium' | 'heavy'
export type PromiseStatus = 'open' | 'resolved' | 'abandoned'
export type PromiseType = 'object' | 'information' | 'relation' | 'skill' | 'prophecy' | 'other'
export type RelationNature = 'positive' | 'negative' | 'ambiguous'
export type StoryStatus = 'active' | 'archived' | 'deleted'
export type SubplotType = 'romance' | 'friendship' | 'political' | 'investigation' | 'secondary_arc' | 'custom'

// --- Genre ---
export interface Genre {
  id: string
  name: string
  icon: string
  description: string
  structuralImplication: string
  color: string
}

// --- Narrative Framework ---
export interface FrameworkStage {
  index: number
  name: string
  guidingQuestion: string
}

export interface NarrativeFramework {
  id: string
  name: string
  author: string
  stageCount: number
  description: string
  stages: FrameworkStage[]
}

// --- Archetype ---
export interface Archetype {
  id: string
  name: string
  function: string
  guidingQuestion: string
}

// --- Story ---
export interface Story {
  id: string
  user_id: string
  title: string
  logline: string
  premise: string
  inciting_incident: string
  genre: string[]
  framework: string
  theme_central: string
  theme_question: string
  theme_message: string
  theme_value: string
  theme_declaration: string
  parent_story_id: string | null
  fork_point: string | null
  status: StoryStatus
  created_at: string
  updated_at: string
}

// --- Story Act ---
export interface StoryAct {
  id: string
  story_id: string
  framework: string
  act_index: number
  act_name: string
  description: string
  guiding_answer?: string
}

// --- Character ---
export interface ArchetypeAssignment {
  archetype: string
  phase: string
}

export interface Character {
  id: string
  story_id: string
  name: string
  role: string
  archetypes: ArchetypeAssignment[]
  desire: string
  need: string
  fear: string
  flaw: string
  save_the_cat: string
  arc: string
  backstory: string
  notes: string
}

// --- Character Relation ---
export interface TemporalChange {
  phase: string
  label: string
  nature: RelationNature
}

export interface CharacterRelation {
  id: string
  story_id: string
  character_a_id: string
  character_b_id: string
  label: string
  nature: RelationNature
  temporal_changes: TemporalChange[]
  notes: string
}

// --- Scene ---
export interface Scene {
  id: string
  story_id: string
  title: string
  act_index: number | null
  subplot_id: string | null
  characters: string[]
  value_at_stake: string
  charge_start: ChargePolarity
  charge_end: ChargePolarity
  conflict: string
  change: string
  gap_expected: string
  gap_actual: string
  weight: SceneWeight
  position_x: number
  position_y: number
  sort_order: number
  notes: string
}

// --- Scene Connection ---
export interface SceneConnection {
  id: string
  story_id: string
  scene_from_id: string
  scene_to_id: string
  label: string
}

// --- Subplot ---
export interface Subplot {
  id: string
  story_id: string
  name: string
  type: SubplotType
  characters: string[]
  theme_connection: string
  arc_start: string
  arc_development: string
  arc_resolution: string
  notes: string
}

// --- Narrative Promise ---
export interface NarrativePromise {
  id: string
  story_id: string
  name: string
  type: PromiseType
  setup_scene_id: string | null
  payoff_scene_id: string | null
  status: PromiseStatus
  notes: string
}

// --- Information Reveal ---
export interface CharacterKnowledge {
  character_id: string
  from_scene_id: string
}

export interface InformationReveal {
  id: string
  story_id: string
  description: string
  scenes_known_by: CharacterKnowledge[]
  reader_reveal_scene_id: string | null
  dramatic_irony: boolean
  notes: string
}

// --- World Note ---
export interface WorldNote {
  id: string
  story_id: string
  category: string
  title: string
  content: string
  linked_characters: string[]
  linked_scenes: string[]
  linked_promises: string[]
}

// --- Board Note ---
export interface BoardNote {
  id: string
  story_id: string
  content: string
  position_x: number
  position_y: number
  color: string
}

// --- Character Arc Point ---
export interface CharacterArcPoint {
  id: string
  story_id: string
  character_id: string
  scene_id: string
  level: number // -1 to 1
  notes: string
}

// --- Wizard State ---
export interface WizardState {
  currentStep: number
  story: Partial<Story>
  acts: Partial<StoryAct>[]
  characters: Partial<Character>[]
  scenes: Partial<Scene>[]
}

// --- Store helpers ---
export function createEmptyStory(userId: string): Story {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    title: '',
    logline: '',
    premise: '',
    inciting_incident: '',
    genre: [],
    framework: '',
    theme_central: '',
    theme_question: '',
    theme_message: '',
    theme_value: '',
    theme_declaration: '',
    parent_story_id: null,
    fork_point: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
