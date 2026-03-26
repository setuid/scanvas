import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoryStore } from '@/store/useStoryStore'
import { useAuthStore } from '@/store/useAuthStore'
import { saveStoryDataToLocal, saveStoriesToLocal, loadStoryDataFromLocal } from '@/lib/localStorage'
import { saveStoryToSupabase, loadStoryFromSupabase } from '@/lib/supabaseSync'
import { downloadStoryMarkdown, downloadStoryPdf } from '@/lib/markdownExport'
import { downloadStoryJson } from '@/lib/jsonExport'
import { createShareLink, getShareUrl, type ShareResult } from '@/lib/share'
import DashboardTab from '@/components/canvas/DashboardTab'
import StructureTab from '@/components/canvas/StructureTab'
import CharactersTab from '@/components/canvas/CharactersTab'
import ScenesTab from '@/components/canvas/ScenesTab'
import FluxoTab from '@/components/canvas/FluxoTab'
import GuideTab from '@/components/canvas/GuideTab'
import Modal from '@/components/ui/Modal'

const TABS = [
  { id: 'dashboard', label: 'Visão Geral' },
  { id: 'structure', label: 'Estrutura' },
  { id: 'characters', label: 'Personagens' },
  { id: 'scenes', label: 'Cenas' },
  { id: 'fluxo', label: 'Fluxo' },
  { id: 'guide', label: 'Guia' },
]

export default function Canvas() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()
  const current = useStoryStore(s => s.current)
  const loadStory = useStoryStore(s => s.loadStory)
  const [activeTab, setActiveTab] = useState('dashboard')
  const isDirty = useStoryStore(s => s.isDirty)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle')
  const [exportOpen, setExportOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [saveRetry, setSaveRetry] = useState(0)
  // Show "Salvando..." immediately when user makes a change
  useEffect(() => {
    if (isDirty) setSaveStatus('saving')
  }, [isDirty])

  useEffect(() => {
    if (!current && storyId) {
      const user = useAuthStore.getState().user
      if (user) {
        // Authenticated: Supabase is the source of truth
        loadStoryFromSupabase(storyId).then(remoteData => {
          if (remoteData) {
            loadStory(remoteData)
            // Update local cache
            saveStoryDataToLocal(storyId, remoteData)
          } else {
            // Fallback to local if Supabase fails
            const localData = loadStoryDataFromLocal(storyId)
            if (localData) {
              loadStory(localData)
            } else {
              navigate('/')
            }
          }
        })
      } else {
        // Not authenticated: use localStorage only
        const data = loadStoryDataFromLocal(storyId)
        if (data) {
          loadStory(data)
        } else {
          navigate('/')
        }
      }
    }
  }, [storyId])

  // Auto-save with debounce (localStorage + Supabase)
  // Reads latest state from the store at save time (not from the closure)
  // to ensure we always save the most recent data.
  useEffect(() => {
    if (!current) return
    const isDirtyNow = useStoryStore.getState().isDirty
    if (!isDirtyNow) return

    const storyId = current.story.id

    const t = setTimeout(async () => {
      // Read the LATEST state from the store at save time
      const latest = useStoryStore.getState().current
      if (!latest || latest.story.id !== storyId) return

      // Always save locally first
      saveStoryDataToLocal(storyId, latest)
      const stories = useStoryStore.getState().stories.map(s =>
        s.id === storyId ? latest.story : s
      )
      saveStoriesToLocal(stories)

      // Save to Supabase if authenticated — only markClean after success
      if (useAuthStore.getState().user) {
        const ok = await saveStoryToSupabase(latest)
        if (ok) {
          useStoryStore.getState().markClean()
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } else {
          setSaveStatus('error')
          console.warn('Failed to sync to Supabase, will retry in 5s')
          setTimeout(() => setSaveRetry(n => n + 1), 5000)
        }
      } else {
        useStoryStore.getState().markClean()
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [current, saveRetry])

  const handleShare = async () => {
    setSharing(true)
    setShareError(null)
    const result = await createShareLink()
    if (result.ok) {
      setShareUrl(getShareUrl(result.shareId))
    } else {
      const messages: Record<ShareResult & { ok: false } extends { reason: infer R } ? R & string : never, string> = {
        'no-supabase': 'Compartilhamento não disponível — configuração do servidor ausente. Use "Exportar" para salvar sua história.',
        'no-story': 'Nenhuma história carregada para compartilhar.',
        'upload-failed': 'Falha ao gerar o link. Verifique sua conexão e tente novamente.',
      }
      setShareError(messages[result.reason])
    }
    setSharing(false)
  }

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
          <div className="ml-auto flex items-center gap-2 px-3 text-xs shrink-0">
            {saveStatus === 'saving' && (
              <span className="text-warning animate-pulse">Salvando...</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400 animate-pulse">Erro ao salvar — tentando novamente…</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-positive">Salvo</span>
            )}
            <button
              onClick={() => setExportOpen(true)}
              className="text-text-muted hover:text-text transition-colors cursor-pointer px-2 py-1"
              title="Exportar"
            >
              Exportar
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="text-text-muted hover:text-gold transition-colors cursor-pointer px-2 py-1"
              title="Compartilhar"
            >
              {sharing ? 'Gerando...' : 'Compartilhar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
        {activeTab === 'structure' && <StructureTab />}
        {activeTab === 'characters' && <CharactersTab />}
        {activeTab === 'scenes' && <ScenesTab />}
        {activeTab === 'fluxo' && <FluxoTab />}
        {activeTab === 'guide' && <GuideTab onNavigate={setActiveTab} />}
      </div>

      {/* Export Modal */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Exportar História">
        <div className="space-y-2">
          <button
            onClick={() => { downloadStoryMarkdown(); setExportOpen(false) }}
            className="w-full text-left p-3 rounded-lg border border-border hover:border-gold/50 transition-colors cursor-pointer"
          >
            <div className="font-medium text-text">Markdown (.md)</div>
            <p className="text-xs text-text-muted mt-0.5">Texto formatado — ideal para revisar e editar</p>
          </button>
          <button
            onClick={() => { downloadStoryPdf(); setExportOpen(false) }}
            className="w-full text-left p-3 rounded-lg border border-border hover:border-gold/50 transition-colors cursor-pointer"
          >
            <div className="font-medium text-text">PDF</div>
            <p className="text-xs text-text-muted mt-0.5">Documento formatado para impressão ou envio</p>
          </button>
          <button
            onClick={() => { downloadStoryJson(); setExportOpen(false) }}
            className="w-full text-left p-3 rounded-lg border border-border hover:border-gold/50 transition-colors cursor-pointer"
          >
            <div className="font-medium text-text">Story Canvas (.json)</div>
            <p className="text-xs text-text-muted mt-0.5">Formato completo — pode ser reimportado no app</p>
          </button>
        </div>
      </Modal>

      {/* Share Error Modal */}
      <Modal open={!!shareError} onClose={() => setShareError(null)} title="Erro ao Compartilhar">
        <p className="text-sm text-text-secondary">{shareError}</p>
      </Modal>

      {/* Share URL Modal */}
      <Modal open={!!shareUrl} onClose={() => setShareUrl(null)} title="Link de Compartilhamento">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Qualquer pessoa com este link pode ver uma versão somente-leitura do outline da sua história.
          </p>
          <div className="flex gap-2">
            <input
              value={shareUrl || ''}
              readOnly
              className="input-field flex-1 text-sm"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => {
                if (shareUrl) {
                  navigator.clipboard.writeText(shareUrl)
                }
              }}
              className="px-3 py-2 bg-gold text-bg rounded-lg text-sm font-medium hover:bg-gold-hover transition-colors cursor-pointer shrink-0"
            >
              Copiar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
