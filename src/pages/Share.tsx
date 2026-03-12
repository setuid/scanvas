import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { loadShareData, type ShareData } from '@/lib/share'

export default function Share() {
  const { shareId } = useParams<{ shareId: string }>()
  const [data, setData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!shareId) return
    loadShareData(shareId).then(result => {
      if (result) {
        setData(result)
      } else {
        setError(true)
      }
      setLoading(false)
    })
  }, [shareId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">
        Carregando...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-text-muted mb-2">Link não encontrado</p>
        <p className="text-sm text-text-muted">
          Este link de compartilhamento pode ter expirado ou não existe.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 pb-4 border-b border-border">
        <p className="text-xs text-text-muted mb-1">
          Compartilhado em {new Date(data.sharedAt).toLocaleDateString('pt-BR')} — somente leitura
        </p>
        <h1 className="text-3xl font-serif text-gold">
          {data.story.title || 'Sem título'}
        </h1>
        {data.story.logline && (
          <p className="text-text-secondary mt-2 italic">{data.story.logline}</p>
        )}
      </div>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(data.markdown) }}
      />
    </div>
  )
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-serif text-text mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-serif text-gold mt-8 mb-3 pb-2 border-b border-border">$1</h2>')
    .replace(/^# (.+)$/gm, '')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-gold pl-4 text-text-secondary italic my-4">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-border my-6">')
    .replace(/^\- (.+)$/gm, '<li class="text-text-secondary text-sm my-1">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="pl-5 my-2">${match}</ul>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-text-muted">$1</em>')
    .replace(/\n\n/g, '<br><br>')
}
