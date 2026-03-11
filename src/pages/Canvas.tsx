import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoryStore } from '@/store/useStoryStore'
import { useAuthStore } from '@/store/useAuthStore'
import { saveStoryDataToLocal, saveStoriesToLocal, loadStoryDataFromLocal } from '@/lib/localStorage'
import { saveStoryToSupabase, loadStoryFromSupabase } from '@/lib/supabaseSync'
import DashboardTab from '@/components/canvas/DashboardTab'
import StructureTab from '@/components/canvas/StructureTab'
import CharactersTab from '@/components/canvas/CharactersTab'
import ScenesTab from '@/components/canvas/ScenesTab'

const TABS = [
  { id: 'dashboard', label: 'Visão Geral' },
  { id: 'structure', label: 'Estrutura' },
  { id: 'characters', label: 'Personagens' },
  { id: 'scenes', label: 'Cenas' },
]

export default function Canvas() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()
  const current = useStoryStore(s => s.current)
  const loadStory = useStoryStore(s => s.loadStory)
  const [activeTab, setActiveTab] = useState('dashboard')
  const isDirty = useStoryStore(s => s.isDirty)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')

  // Track save status for indicator
  useEffect(() => {
    if (isDirty) {
      setSaveStatus('saving')
    }
  }, [isDirty])

  useEffect(() => {
    if (!isDirty && saveStatus === 'saving') {
      setSaveStatus('saved')
      const t = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(t)
    }
  }, [isDirty, saveStatus])

  useEffect(() => {
    if (!current && storyId) {
      const data = loadStoryDataFromLocal(storyId)
      if (data) {
        loadStory(data)
      } else if (useAuthStore.getState().user) {
        // Try loading from Supabase if local not found
        loadStoryFromSupabase(storyId).then(remoteData => {
          if (remoteData) {
            loadStory(remoteData)
          } else {
            navigate('/')
          }
        })
      } else {
        navigate('/')
      }
    }
  }, [storyId])

  // Auto-save with debounce (localStorage + Supabase)
  useEffect(() => {
    if (!current) return
    const isDirty = useStoryStore.getState().isDirty
    if (!isDirty) return

    const t = setTimeout(async () => {
      // Always save locally
      saveStoryDataToLocal(current.story.id, current)
      const stories = useStoryStore.getState().stories.map(s =>
        s.id === current.story.id ? current.story : s
      )
      saveStoriesToLocal(stories)
      useStoryStore.getState().markClean()

      // Also save to Supabase if authenticated
      if (useAuthStore.getState().user) {
        const ok = await saveStoryToSupabase(current)
        if (!ok) {
          console.warn('Failed to sync to Supabase, data saved locally')
        }
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [current])

  if (!current) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Tab bar */}
      <div className="border-b border-border bg-bg-secondary/50 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 px-3 text-xs">
            {saveStatus === 'saving' && (
              <span className="text-warning animate-pulse">Salvando...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-positive">Salvo</span>
            )}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
        {activeTab === 'structure' && <StructureTab />}
        {activeTab === 'characters' && <CharactersTab />}
        {activeTab === 'scenes' && <ScenesTab />}
      </div>
    </div>
  )
}
