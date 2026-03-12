import { useState } from 'react'
import { useStoryStore } from '@/store/useStoryStore'
import { getFramework } from '@/data/frameworks'
import { genres as genreList } from '@/data/genres'
import { archetypes as archetypeList } from '@/data/archetypes'
import Card from '@/components/ui/Card'
import InlineEdit from '@/components/ui/InlineEdit'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface DashboardTabProps {
  setActiveTab: (tab: string) => void
}

export default function DashboardTab({ setActiveTab }: DashboardTabProps) {
  const current = useStoryStore(s => s.current)!
  const updateStory = useStoryStore(s => s.updateStory)
  const story = current.story
  const [genreOpen, setGenreOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const fw = getFramework(story.framework)

  const staticScenes = current.scenes.filter(s => s.charge_start === s.charge_end && s.title)
  const openPromises = current.promises.filter(p => p.status === 'open')
  const filledActs = current.acts.filter(a => a.description.trim().length > 0)
  const totalStages = fw?.stages.length || 0
  const coverage = totalStages > 0 ? Math.round((filledActs.length / totalStages) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Identity Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Identidade</h3>
          <InlineEdit
            value={story.title}
            onChange={v => updateStory({ title: v })}
            placeholder="Título da história..."
            className="text-2xl font-serif text-gold mb-2"
          />
          <InlineEdit
            value={story.logline}
            onChange={v => updateStory({ logline: v })}
            placeholder="Logline — a história em uma frase..."
            className="text-text-secondary"
            as="textarea"
          />
          {story.premise && (
            <div className="mt-2 text-sm text-text-muted italic">{story.premise}</div>
          )}
          {story.inciting_incident && (
            <div className="mt-2">
              <span className="text-xs text-gold-dim font-medium">Incidente Incitante:</span>
              <p className="text-sm text-text-secondary mt-0.5">{story.inciting_incident}</p>
            </div>
          )}
        </Card>

        {/* Narrative Health Card */}
        <Card>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Saúde Narrativa</h3>
          <div className="space-y-3">
            <HealthItem
              label="Cobertura do framework"
              value={fw ? `${filledActs.length}/${totalStages} (${coverage}%)` : 'Nenhum framework'}
              status={coverage >= 75 ? 'good' : coverage >= 40 ? 'warning' : 'neutral'}
            />
            <HealthItem
              label="Cenas estáticas"
              value={staticScenes.length > 0 ? `${staticScenes.length} cena(s) sem mudança` : 'Nenhuma'}
              status={staticScenes.length > 0 ? 'warning' : 'good'}
            />
            <HealthItem
              label="Promessas abertas"
              value={openPromises.length > 0 ? `${openPromises.length} sem payoff` : 'Nenhuma'}
              status={openPromises.length > 3 ? 'warning' : 'neutral'}
            />
            <HealthItem
              label="Personagens"
              value={`${current.characters.length}`}
              status="neutral"
            />
            <HealthItem
              label="Cenas"
              value={`${current.scenes.length}`}
              status="neutral"
            />
          </div>
        </Card>

        {/* Genre Card */}
        <Card clickable onClick={() => setGenreOpen(true)}>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Gênero & Tom</h3>
          {story.genre?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {story.genre.map((gId: string) => {
                const g = genreList.find(gl => gl.id === gId)
                return g ? (
                  <Badge key={gId} color={g.color}>
                    {g.icon} {g.name}
                  </Badge>
                ) : null
              })}
            </div>
          ) : (
            <p className="text-text-muted text-sm italic">Nenhum gênero selecionado</p>
          )}
        </Card>

        {/* Theme Card */}
        <Card clickable onClick={() => setThemeOpen(true)}>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Tema</h3>
          {story.theme_central ? (
            <>
              <div className="text-gold font-serif text-lg mb-1">{story.theme_central}</div>
              {story.theme_question && (
                <p className="text-text-secondary text-sm italic">"{story.theme_question}"</p>
              )}
              {story.theme_value && (
                <p className="text-xs text-text-muted mt-2">Valor em jogo: {story.theme_value}</p>
              )}
            </>
          ) : (
            <p className="text-text-muted text-sm italic">Nenhum tema definido</p>
          )}
        </Card>

        {/* Structure Card */}
        <Card clickable onClick={() => setActiveTab('structure')}>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Estrutura</h3>
          {fw ? (
            <>
              <div className="font-semibold text-text mb-1">{fw.name}</div>
              <div className="text-xs text-text-muted mb-2">{fw.author}</div>
              <div className="flex gap-1 flex-wrap">
                {fw.stages.map(s => {
                  const filled = current.acts.some(a => a.act_index === s.index && a.description.trim())
                  return (
                    <div
                      key={s.index}
                      className={`w-6 h-2 rounded-full ${filled ? 'bg-gold' : 'bg-border'}`}
                      title={`${s.name}${filled ? ' (preenchido)' : ''}`}
                    />
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-text-muted text-sm italic">Nenhum framework escolhido</p>
          )}
        </Card>

        {/* Characters Card */}
        <Card clickable onClick={() => setActiveTab('characters')}>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Personagens</h3>
          {current.characters.length > 0 ? (
            <div className="space-y-2">
              {current.characters.slice(0, 5).map(ch => (
                <div key={ch.id} className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">
                    {(ch.name || '?')[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-text truncate">{ch.name || 'Sem nome'}</div>
                    <div className="text-xs text-text-muted">{ch.role || 'sem papel'}</div>
                  </div>
                </div>
              ))}
              {current.characters.length > 5 && (
                <p className="text-xs text-text-muted">+{current.characters.length - 5} mais</p>
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm italic">Nenhum personagem</p>
          )}
        </Card>

        {/* Scenes Card */}
        <Card clickable onClick={() => setActiveTab('scenes')}>
          <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Cenas</h3>
          {current.scenes.length > 0 ? (
            <div className="space-y-1">
              {current.scenes.slice(0, 6).map((sc, i) => (
                <div key={sc.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    sc.charge_start !== sc.charge_end ? 'bg-positive' : 'bg-warning'
                  }`} />
                  <span className="text-text truncate">{sc.title || `Cena ${i + 1}`}</span>
                  <span className="text-text-muted text-xs ml-auto shrink-0">
                    {sc.charge_start}→{sc.charge_end}
                  </span>
                </div>
              ))}
              {current.scenes.length > 6 && (
                <p className="text-xs text-text-muted">+{current.scenes.length - 6} mais</p>
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm italic">Nenhuma cena</p>
          )}
        </Card>
      </div>

      {/* Genre Modal */}
      <Modal open={genreOpen} onClose={() => setGenreOpen(false)} title="Gênero & Tom">
        <div className="space-y-2">
          {genreList.map(g => {
            const selected = story.genre?.includes(g.id)
            return (
              <button
                key={g.id}
                onClick={() => {
                  const current = story.genre || []
                  const next = selected
                    ? current.filter((id: string) => id !== g.id)
                    : [...current, g.id]
                  updateStory({ genre: next })
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                  selected
                    ? 'border-gold bg-gold/10'
                    : 'border-border hover:border-text-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{g.icon}</span>
                  <span className={`font-medium ${selected ? 'text-gold' : 'text-text'}`}>{g.name}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{g.description}</p>
              </button>
            )
          })}
        </div>
      </Modal>

      {/* Theme Modal */}
      <Modal open={themeOpen} onClose={() => setThemeOpen(false)} title="Tema">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Tema Central</label>
            <input
              type="text"
              value={story.theme_central || ''}
              onChange={e => updateStory({ theme_central: e.target.value })}
              placeholder="Uma ou duas palavras (ex: Redenção, Identidade)"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Pergunta Temática</label>
            <input
              type="text"
              value={story.theme_question || ''}
              onChange={e => updateStory({ theme_question: e.target.value })}
              placeholder="A pergunta que a história tenta responder..."
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Valor em Jogo</label>
            <input
              type="text"
              value={story.theme_value || ''}
              onChange={e => updateStory({ theme_value: e.target.value })}
              placeholder="O que pode ser ganho ou perdido (ex: Liberdade vs Segurança)"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Declaração Temática</label>
            <textarea
              value={story.theme_declaration || ''}
              onChange={e => updateStory({ theme_declaration: e.target.value })}
              placeholder="Fala de um personagem secundário que expressa o tema..."
              className="input-field w-full"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Mensagem (opcional)</label>
            <textarea
              value={story.theme_message || ''}
              onChange={e => updateStory({ theme_message: e.target.value })}
              placeholder="A tese que o autor defende através da narrativa..."
              className="input-field w-full"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function HealthItem({ label, value, status }: { label: string; value: string; status: 'good' | 'warning' | 'neutral' }) {
  const colors = {
    good: 'text-positive',
    warning: 'text-warning',
    neutral: 'text-text-secondary',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm font-medium ${colors[status]}`}>{value}</span>
    </div>
  )
}
