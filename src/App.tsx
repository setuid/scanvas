import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useStoryStore } from '@/store/useStoryStore'
import { supabase } from '@/lib/supabase'
import { loadStoriesFromLocal, loadStoryDataFromLocal, saveStoriesToLocal } from '@/lib/localStorage'
import { fetchStoriesFromSupabase, migrateLocalStoriesToSupabase } from '@/lib/supabaseSync'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Wizard from '@/pages/Wizard'
import Canvas from '@/pages/Canvas'

async function syncOnLogin(userId: string) {
  const setStories = useStoryStore.getState().setStories
  const setSyncing = useAuthStore.getState().setSyncing

  setSyncing(true)

  try {
    // 1. Check if user has remote stories already
    const remoteStories = await fetchStoriesFromSupabase()

    // 2. Check local stories that belong to 'local' user (not yet migrated)
    const localStories = loadStoriesFromLocal()
    const localOnlyStories = localStories.filter(s =>
      s.user_id === 'local' && s.status !== 'deleted'
    )

    // 3. Migrate local stories to cloud
    if (localOnlyStories.length > 0) {
      const localStoryData = localOnlyStories
        .map(s => loadStoryDataFromLocal(s.id))
        .filter(Boolean)

      if (localStoryData.length > 0) {
        const migrated = await migrateLocalStoriesToSupabase(localStoryData, userId)
        if (migrated > 0) {
          console.log(`Migrated ${migrated} local stories to Supabase`)
          // Update local stories to reflect the new user_id
          const updatedLocal = localStories.map(s =>
            s.user_id === 'local' ? { ...s, user_id: userId } : s
          )
          saveStoriesToLocal(updatedLocal)
        }
      }
    }

    // 4. Fetch the merged list from Supabase
    const allRemote = await fetchStoriesFromSupabase()
    if (allRemote.length > 0) {
      setStories(allRemote)
      saveStoriesToLocal(allRemote)
    } else if (remoteStories.length === 0 && localStories.length > 0) {
      // Keep local stories if remote is empty
      setStories(localStories)
    }
  } catch (err) {
    console.error('Sync on login failed:', err)
    // Fallback: keep local stories
  } finally {
    setSyncing(false)
  }
}

export default function App() {
  const setUser = useAuthStore(s => s.setUser)
  const setLoading = useAuthStore(s => s.setLoading)
  const setUserId = useStoryStore(s => s.setUserId)
  const setStories = useStoryStore(s => s.setStories)

  useEffect(() => {
    // Load local stories on mount (immediate, works offline)
    const localStories = loadStoriesFromLocal()
    if (localStories.length > 0) {
      setStories(localStories)
    }

    // Auth listener
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        setUserId(u?.id ?? 'local')
        setLoading(false)

        if (u) {
          await syncOnLogin(u.id)
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setUserId(u?.id ?? 'local')

        if (u) {
          await syncOnLogin(u.id)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      setUserId('local')
      setLoading(false)
    }
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wizard/:storyId" element={<Wizard />} />
        <Route path="/canvas/:storyId" element={<Canvas />} />
      </Routes>
    </Layout>
  )
}
