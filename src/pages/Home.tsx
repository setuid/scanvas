import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoryStore } from '@/store/useStoryStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
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

export default function Home() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const stories = useStoryStore(s => s.stories)
  const setStories = useStoryStore(s => s.setStories)
  const loadStory = useStoryStore(s => s.loadStory)
  const addStoryToList = useStoryStore(s => s.addStoryToList)
  const removeStoryFromList = useStoryStore(s => s.removeStoryFromList)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load stories list from localStorage (works offline and without Supabase)
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

  const handleNewWithWizard = () => createNewStory('wizard')
  const handleNewDirect = () => createNewStory('canvas')

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
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique se é um JSON válido do Story Canvas.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleLogin = async () => {
    if (!supabase) {
      alert('Supabase não está configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      return
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const getGenreIcons = (genreIds: string[]) => {
    return genreIds
      .map(id => genreList.find(g => g.id === id))
      .filter(Boolean)
      .map(g => g!.icon)
      .join(' ')
  }

  const activeStories = stories.filter(s => s.status !== 'deleted')

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gold mb-4">Story Canvas</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          O cockpit do escritor. Arquitete, visualize e itere sobre a estrutura da sua história
          antes de escrevê-la — com a sabedoria de Campbell, McKee, Snyder e Vogler.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        <Button size="lg" onClick={handleNewWithWizard}>
          Começar com o Wizard
        </Button>
        <Button variant="secondary" size="lg" onClick={handleNewDirect}>
          Ir direto ao Canvas
        </Button>
        <Button variant="ghost" size="lg" onClick={handleImport}>
          Importar JSON
        </Button>
        {!user && (
          <Button variant="ghost" size="lg" onClick={handleLogin}>
            Login com Google
          </Button>
        )}
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
          <h2 className="text-xl font-serif text-text mb-4">Suas Histórias</h2>
          <div className="grid gap-3">
            {activeStories.map(story => (
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
                      <span>
                        Editada em {new Date(story.updated_at).toLocaleDateString('pt-BR')}
                      </span>
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
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg mb-2">Nenhuma história ainda.</p>
          <p className="text-text-muted text-sm">
            Comece com o Wizard para ser guiado pelos fundamentos narrativos,
            ou vá direto ao Canvas para construir livremente.
          </p>
        </div>
      )}
    </div>
  )
}
