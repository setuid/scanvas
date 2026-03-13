import { supabase } from '@/lib/supabase'
import { useStoryStore } from '@/store/useStoryStore'
import { exportStoryToMarkdown } from '@/lib/markdownExport'

const BUCKET = 'shares'

export interface ShareData {
  version: string
  sharedAt: string
  markdown: string
  story: {
    title: string
    logline: string
    genre: string[]
    theme_central: string
  }
}

/**
 * Upload a read-only snapshot of the current story to Supabase Storage.
 * Returns the share ID (UUID) that can be used to construct the share URL.
 */
export type ShareResult =
  | { ok: true; shareId: string }
  | { ok: false; reason: 'no-supabase' | 'no-story' | 'upload-failed' }

export async function createShareLink(): Promise<ShareResult> {
  if (!supabase) return { ok: false, reason: 'no-supabase' }

  const { current } = useStoryStore.getState()
  if (!current) return { ok: false, reason: 'no-story' }

  const shareId = crypto.randomUUID()
  const markdown = exportStoryToMarkdown()

  const data: ShareData = {
    version: '1.0',
    sharedAt: new Date().toISOString(),
    markdown,
    story: {
      title: current.story.title,
      logline: current.story.logline,
      genre: current.story.genre,
      theme_central: current.story.theme_central,
    },
  }

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${shareId}.json`, blob, {
      contentType: 'application/json',
      upsert: false,
    })

  if (error) {
    console.error('Share upload failed:', error)
    return { ok: false, reason: 'upload-failed' }
  }

  return { ok: true, shareId }
}

/**
 * Load a shared story snapshot from Supabase Storage.
 */
export async function loadShareData(shareId: string): Promise<ShareData | null> {
  if (!supabase) return null

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`${shareId}.json`)

  if (error || !data) {
    console.error('Share download failed:', error)
    return null
  }

  try {
    const text = await data.text()
    return JSON.parse(text) as ShareData
  } catch {
    return null
  }
}

/**
 * Get the full share URL from a share ID.
 */
export function getShareUrl(shareId: string): string {
  const base = import.meta.env.VITE_SITE_URL || window.location.origin
  return `${base}/share/${shareId}`
}
