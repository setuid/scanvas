import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import { genres as genreList } from '@/data/genres'
import { archetypes as archetypeList } from '@/data/archetypes'

export function exportStoryToMarkdown(): string {
  const { current } = useStoryStore.getState()
  if (!current) throw new Error('No story loaded')

  const { story, acts, characters, scenes, relations, subplots, promises, worldNotes, sceneConnections } = current
  const fw = getFramework(story.framework)
  const sortedScenes = [...scenes].sort((a, b) => a.sort_order - b.sort_order)
  const lines: string[] = []

  const add = (text: string) => lines.push(text)
  const blank = () => lines.push('')

  // Title
  add(`# ${story.title || 'Sem título'}`)
  blank()

  // Logline & Premise
  if (story.logline) {
    add(`> ${story.logline}`)
    blank()
  }
  if (story.premise) {
    add(`**Premissa:** ${story.premise}`)
    blank()
  }
  if (story.inciting_incident) {
    add(`**Incidente Incitante:** ${story.inciting_incident}`)
    blank()
  }

  // Genre
  if (story.genre?.length > 0) {
    const names = story.genre
      .map(id => genreList.find(g => g.id === id))
      .filter(Boolean)
      .map(g => `${g!.icon} ${g!.name}`)
      .join(', ')
    add(`**Gênero:** ${names}`)
    blank()
  }

  // Theme
  if (story.theme_central || story.theme_question) {
    add('---')
    blank()
    add('## Tema')
    blank()
    if (story.theme_central) add(`**Tema Central:** ${story.theme_central}`)
    if (story.theme_question) add(`**Pergunta Temática:** ${story.theme_question}`)
    if (story.theme_value) add(`**Valor em Jogo:** ${story.theme_value}`)
    if (story.theme_declaration) {
      blank()
      add(`> "${story.theme_declaration}"`)
    }
    if (story.theme_message) add(`**Mensagem:** ${story.theme_message}`)
    blank()
  }

  // Structure / Acts
  if (fw && acts.length > 0) {
    add('---')
    blank()
    add(`## Estrutura — ${fw.name}`)
    blank()
    for (const stage of fw.stages) {
      const act = acts.find(a => a.act_index === stage.index)
      const scenesInAct = sortedScenes.filter(s => s.act_index === stage.index)
      add(`### ${stage.index + 1}. ${stage.name}`)
      blank()
      if (act?.description) {
        add(act.description)
        blank()
      }
      if (scenesInAct.length > 0) {
        add(`*Cenas neste estágio:*`)
        for (const sc of scenesInAct) {
          const charge = `[${sc.charge_start}→${sc.charge_end}]`
          add(`- ${sc.title || 'Sem título'} ${charge}`)
        }
        blank()
      }
    }
  }

  // Characters
  if (characters.length > 0) {
    add('---')
    blank()
    add('## Personagens')
    blank()
    for (const ch of characters) {
      add(`### ${ch.name || 'Sem nome'}`)
      if (ch.role) add(`**Papel:** ${ch.role}`)
      blank()
      if (ch.archetypes?.length > 0) {
        const archNames = ch.archetypes
          .map(a => archetypeList.find(ar => ar.id === a.archetype)?.name)
          .filter(Boolean)
          .join(', ')
        if (archNames) add(`**Arquétipos:** ${archNames}`)
      }
      if (ch.desire) add(`**Desejo:** ${ch.desire}`)
      if (ch.need) add(`**Necessidade:** ${ch.need}`)
      if (ch.fear) add(`**Medo:** ${ch.fear}`)
      if (ch.flaw) add(`**Falha:** ${ch.flaw}`)
      if (ch.arc) add(`**Arco:** ${ch.arc}`)
      if (ch.backstory) {
        blank()
        add(`**Backstory:** ${ch.backstory}`)
      }
      blank()
    }
  }

  // Character Relations
  if (relations.length > 0) {
    add('### Relações entre Personagens')
    blank()
    for (const rel of relations) {
      const a = characters.find(c => c.id === rel.character_a_id)
      const b = characters.find(c => c.id === rel.character_b_id)
      if (a && b) {
        const nature = rel.nature === 'positive' ? '+' : rel.nature === 'negative' ? '−' : '~'
        add(`- **${a.name}** ↔ **${b.name}** (${nature}) — ${rel.label}`)
      }
    }
    blank()
  }

  // Scenes
  if (sortedScenes.length > 0) {
    add('---')
    blank()
    add('## Cenas')
    blank()
    for (let i = 0; i < sortedScenes.length; i++) {
      const sc = sortedScenes[i]
      const charNames = sc.characters
        .map(id => characters.find(c => c.id === id)?.name)
        .filter(Boolean)
        .join(', ')
      const charge = `[${sc.charge_start}→${sc.charge_end}]`

      add(`### Cena ${i + 1}: ${sc.title || 'Sem título'} ${charge}`)
      blank()
      if (charNames) add(`**Personagens:** ${charNames}`)
      if (sc.value_at_stake) add(`**Valor em jogo:** ${sc.value_at_stake}`)
      if (sc.conflict) add(`**Conflito:** ${sc.conflict}`)
      if (sc.change) add(`**O que muda:** ${sc.change}`)
      if (sc.gap_expected || sc.gap_actual) {
        blank()
        if (sc.gap_expected) add(`**Esperava:** ${sc.gap_expected}`)
        if (sc.gap_actual) add(`**Aconteceu:** ${sc.gap_actual}`)
      }
      if (sc.notes) {
        blank()
        add(`*Notas:* ${sc.notes}`)
      }
      blank()
    }
  }

  // Scene Flow (connections)
  if (sceneConnections.length > 0) {
    add('---')
    blank()
    add('## Fluxo de Cenas')
    blank()
    for (const conn of sceneConnections) {
      const from = scenes.find(s => s.id === conn.scene_from_id)
      const to = scenes.find(s => s.id === conn.scene_to_id)
      if (from && to) {
        const label = conn.label ? ` — ${conn.label}` : ''
        add(`- **${from.title || 'Sem título'}** → **${to.title || 'Sem título'}**${label}`)
      }
    }
    blank()
  }

  // Subplots
  if (subplots.length > 0) {
    add('---')
    blank()
    add('## Subplots')
    blank()
    for (const sp of subplots) {
      add(`### ${sp.name}`)
      if (sp.type) add(`**Tipo:** ${sp.type}`)
      if (sp.theme_connection) add(`**Conexão temática:** ${sp.theme_connection}`)
      if (sp.arc_start) add(`**Início:** ${sp.arc_start}`)
      if (sp.arc_development) add(`**Desenvolvimento:** ${sp.arc_development}`)
      if (sp.arc_resolution) add(`**Resolução:** ${sp.arc_resolution}`)
      blank()
    }
  }

  // Narrative Promises
  if (promises.length > 0) {
    add('---')
    blank()
    add('## Promessas Narrativas')
    blank()
    const statusEmoji = { open: '🔵', resolved: '✅', abandoned: '❌' }
    for (const p of promises) {
      const emoji = statusEmoji[p.status] || '🔵'
      add(`- ${emoji} **${p.name}** (${p.status})${p.notes ? ` — ${p.notes}` : ''}`)
    }
    blank()
  }

  // World Notes
  if (worldNotes.length > 0) {
    add('---')
    blank()
    add('## Notas de Mundo')
    blank()
    for (const note of worldNotes) {
      add(`### ${note.title}`)
      if (note.category) add(`*${note.category}*`)
      blank()
      add(note.content)
      blank()
    }
  }

  // Footer
  add('---')
  blank()
  add(`*Exportado do Story Canvas em ${new Date().toLocaleDateString('pt-BR')}*`)

  return lines.join('\n')
}

export function downloadStoryMarkdown() {
  const md = exportStoryToMarkdown()
  const { current } = useStoryStore.getState()
  const title = current?.story.title || 'story-canvas'
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadStoryPdf() {
  const md = exportStoryToMarkdown()
  const html = markdownToHtml(md)

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Story Canvas — Outline</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { font-size: 2em; margin-bottom: 0.3em; color: #2c2c2c; }
    h2 { font-size: 1.4em; margin-top: 2em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; color: #333; }
    h3 { font-size: 1.1em; margin-top: 1.5em; color: #444; }
    blockquote { border-left: 3px solid #c9a227; padding-left: 1em; color: #555; font-style: italic; margin: 1em 0; }
    strong { color: #333; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    ul { padding-left: 1.5em; }
    li { margin: 0.3em 0; }
    em { color: #666; }
    @media print {
      body { margin: 20px; }
      h2 { break-after: avoid; }
      h3 { break-after: avoid; }
    }
  </style>
</head>
<body>${html}</body>
</html>`)
  printWindow.document.close()
  setTimeout(() => printWindow.print(), 300)
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbulp])/gm, (line) => line ? `<p>${line}</p>` : '')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hbulp])/g, '$1')
    .replace(/(<\/[hbulp][^>]*>)<\/p>/g, '$1')
}
