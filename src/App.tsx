import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useStoryStore } from '@/store/useStoryStore'
import { supabase } from '@/lib/supabase'
import { loadStoriesFromLocal } from '@/lib/localStorage'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Wizard from '@/pages/Wizard'
import Canvas from '@/pages/Canvas'

export default function App() {
  const setUser = useAuthStore(s => s.setUser)
  const setLoading = useAuthStore(s => s.setLoading)
  const setUserId = useStoryStore(s => s.setUserId)
  const setStories = useStoryStore(s => s.setStories)

  useEffect(() => {
    // Load local stories on mount
    const localStories = loadStoriesFromLocal()
    if (localStories.length > 0) {
      setStories(localStories)
    }

    // Auth listener
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setUserId(session?.user?.id ?? 'local')
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setUserId(session?.user?.id ?? 'local')
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
