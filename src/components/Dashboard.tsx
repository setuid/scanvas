import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoryStore } from '@/store/useStoryStore'
import { useAuthStore } from '@/store/useAuthStore'
import {
  loadStoriesFromLocal,
  saveStoriesToLocal,
  loadStoryDataFromLocal,
  deleteStoryDataFromLocal,
  saveStoryDataToLocal,
} from '@/lib/localStorage'
import { saveStoryToSupabase, deleteStoryFromSupabase, loadStoryFromSupabase } from '@/lib/supabaseSync'
import { importStoryFromJson, downloadStoryJson } from '@/lib/jsonExport'
import { createEmptyStory } from '@/types'
import { genres as genreList } from '@/data/genres'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const syncing = useAuthStore(s => s.syncing)
  const stories = useStoryStore(s => s.stories)
  const setStories = useStoryStore(s => s.setStories)
  const loadStory = useStoryStore(s => s.loadStory)
  const addStoryToList = useStoryStore(s => s.addStoryToList)
  const removeStoryFromList = useStoryStore(s => s.removeStoryFromList)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const localStories = loadStoriesFromLocal()
    if (localStories.length > 0) {
      setStories(localStories)
    }
  }, [])

  const createNewStory = (navigateTo: 'wizard' | 'canvas') => {
    const userId = user?.id || 'local'
    const story = createEmptyStory(userId)
    const data = {
      story,
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
    loadStory(data)
    addStoryToList(story)
    saveStoryDataToLocal(story.id, data)
    saveStoriesToLocal([...stories, story])
    if (user) saveStoryToSupabase(data)
    navigate(navigateTo === 'wizard' ? `/wizard/${story.id}` : `/canvas/${story.id}`)
  }

  const handleOpen = async (storyId: string) => {
    let data = loadStoryDataFromLocal(storyId)
    if (!data && user) {
      data = await loadStoryFromSupabase(storyId)
    }
    if (data) {
      loadStory(data)
      navigate(`/canvas/${storyId}`)
    }
  }

  const handleDuplicate = async (storyId: string) => {
    let data = loadStoryDataFromLocal(storyId)
    if (!data && user) {
      data = await loadStoryFromSupabase(storyId)
    }
    if (!data) return
    const newId = crypto.randomUUID()
    const newStory = { ...data.story, id: newId, title: `${data.story.title} (cópia)`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    const newData = { ...data, story: newStory }
    saveStoryDataToLocal(newId, newData)
    const updated = [...stories, newStory]
    addStoryToList(newStory)
    saveStoriesToLocal(updated)
    if (user) saveStoryToSupabase(newData)
  }

  const handleDelete = (storyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta história?')) return
    deleteStoryDataFromLocal(storyId)
    removeStoryFromList(storyId)
    saveStoriesToLocal(stories.filter(s => s.id !== storyId))
    if (user) deleteStoryFromSupabase(storyId)
  }

  const handleExport = (storyId: string) => {
    const data = loadStoryDataFromLocal(storyId)
    if (!data) return
    loadStory(data)
    setTimeout(() => downloadStoryJson(), 0)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string
        importStoryFromJson(json)
        const { current } = useStoryStore.getState()
        if (current) {
          saveStoryDataToLocal(current.story.id, current)
          saveStoriesToLocal([...useStoryStore.getState().stories])
          navigate(`/canvas/${current.story.id}`)
        }
      } catch {
        alert('Erro ao importar arquivo. Verifique se é um JSON válido do Story Canvas.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const getGenreIcons = (genreIds: string[]) => {
    return genreIds
      .map(id => genreList.find(g => g.id === id))
      .filter(Boolean)
      .map(g => g!.icon)
      .join(' ')
  }

  const getStoryStats = (storyId: string) => {
    const data = loadStoryDataFromLocal(storyId)
    if (!data) return null
    return {
      characters: data.characters?.length || 0,
      scenes: data.scenes?.length || 0,
    }
  }

  const activeStories = stories.filter(s => s.status !== 'deleted')

  const timeSince = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'hoje'
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Welcome bar */}
      <div className="bg-surface border border-gold/20 rounded-lg p-4 mb-8 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0">
          {(user?.email || '?')[0].toUpperCase()}
        </span>
        <div className="flex-1">
          <p className="text-text text-sm font-medium">{user?.email}</p>
          <p className="text-text-muted text-xs">
            {syncing ? (
              'Sincronizando dados com a nuvem...'
            ) : (
              <>
                {activeStories.length} {activeStories.length === 1 ? 'história' : 'histórias'} em andamento
              </>
            )}
          </p>
        </div>
        {syncing && (
          <span className="text-gold text-sm animate-pulse">Sincronizando...</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        <Button size="lg" onClick={() => createNewStory('wizard')}>
          Começar com o Wizard
        </Button>
        <Button variant="secondary" size="lg" onClick={() => createNewStory('canvas')}>
          Ir direto ao Canvas
        </Button>
        <Button variant="ghost" size="lg" onClick={handleImport}>
          Importar JSON
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Stories list */}
      {activeStories.length > 0 ? (
        <div>
          <h2 className="text-xl font-serif text-text mb-4">
            Suas Histórias
            <span className="text-text-muted text-sm font-sans ml-2">({activeStories.length})</span>
          </h2>
          <div className="grid gap-3">
            {activeStories
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map(story => {
                const stats = getStoryStats(story.id)
                return (
                  <Card key={story.id} clickable onClick={() => handleOpen(story.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-text truncate">
                          {story.title || <span className="text-text-muted italic">Sem título</span>}
                        </h3>
                        {story.logline && (
                          <p className="text-text-secondary text-sm mt-1 line-clamp-2">{story.logline}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                          {story.genre?.length > 0 && (
                            <span>{getGenreIcons(story.genre)}</span>
                          )}
                          <span>Editada {timeSince(story.updated_at)}</span>
                          {stats && (
                            <>
                              <span>{stats.characters} personagens</span>
                              <span>{stats.scenes} cenas</span>
                            </>
                          )}
                          {story.parent_story_id && (
                            <span className="text-info">Bifurcação</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleDuplicate(story.id)}
                          className="p-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                          title="Duplicar"
                        >
                          ⧉
                        </button>
                        <button
                          onClick={() => handleExport(story.id)}
                          className="p-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                          title="Exportar JSON"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="p-2 text-text-muted hover:text-negative transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg mb-2">Nenhuma história ainda.</p>
          <p className="text-text-muted text-sm mb-6">
            Comece com o Wizard para ser guiado pelos fundamentos narrativos,
            ou vá direto ao Canvas para construir livremente.
          </p>
          <Button onClick={() => createNewStory('wizard')}>
            Criar sua primeira história
          </Button>
        </div>
      )}
    </div>
  )
}
