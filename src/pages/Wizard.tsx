import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStoryStore } from '@/store/useStoryStore'
import { useAuthStore } from '@/store/useAuthStore'
import { saveStoryDataToLocal, saveStoriesToLocal, loadStoryDataFromLocal } from '@/lib/localStorage'
import { saveStoryToSupabase, loadStoryFromSupabase } from '@/lib/supabaseSync'
import { frameworks, getFramework } from '@/data/frameworks'
import { genres } from '@/data/genres'
import { archetypes } from '@/data/archetypes'
import type { Character, Scene, StoryAct } from '@/types'
import Button from '@/components/ui/Button'
import GuidingQuestion from '@/components/ui/GuidingQuestion'

const STEPS = [
  { label: 'Essência', number: 1 },
  { label: 'Tom & Gênero', number: 2 },
  { label: 'Tema', number: 3 },
  { label: 'Estrutura', number: 4 },
  { label: 'Personagens', number: 5 },
  { label: 'Cenas', number: 6 },
]

export default function Wizard() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()
  const current = useStoryStore(s => s.current)
  const loadStory = useStoryStore(s => s.loadStory)
  const updateStory = useStoryStore(s => s.updateStory)
  const setActs = useStoryStore(s => s.setActs)
  const addCharacter = useStoryStore(s => s.addCharacter)
  const updateCharacter = useStoryStore(s => s.updateCharacter)
  const removeCharacter = useStoryStore(s => s.removeCharacter)
  const addScene = useStoryStore(s => s.addScene)
  const updateScene = useStoryStore(s => s.updateScene)
  const removeScene = useStoryStore(s => s.removeScene)
  const [step, setStep] = useState(0)

  // Load story data if not already loaded
  useEffect(() => {
    if (!current && storyId) {
      const data = loadStoryDataFromLocal(storyId)
      if (data) {
        loadStory(data)
      } else if (useAuthStore.getState().user) {
        // Try loading from Supabase if local not found
        loadStoryFromSupabase(storyId).then(remoteData => {
          if (remoteData) loadStory(remoteData)
        })
      }
    }
  }, [storyId])

  // Auto-save on changes (localStorage + Supabase)
  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => {
      // Always save locally
      saveStoryDataToLocal(current.story.id, current)
      const stories = useStoryStore.getState().stories.map(s =>
        s.id === current.story.id ? current.story : s
      )
      saveStoriesToLocal(stories)

      // Also save to Supabase if authenticated
      if (useAuthStore.getState().user) {
        saveStoryToSupabase(current)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [current])

  if (!current) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>
  }

  const story = current.story

  const goToCanvas = () => navigate(`/canvas/${story.id}`)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
              i === step
                ? 'bg-gold/20 text-gold border border-gold/30'
                : i < step
                  ? 'bg-bg-tertiary text-text-secondary'
                  : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === step ? 'bg-gold text-bg' : i < step ? 'bg-border text-text' : 'bg-bg-tertiary text-text-muted'
            }`}>
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
        <div className="ml-auto shrink-0">
          <Button variant="ghost" size="sm" onClick={goToCanvas}>
            Ir ao Canvas &rarr;
          </Button>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[60vh]">
        {step === 0 && <StepEssence story={story} updateStory={updateStory} />}
        {step === 1 && <StepGenre story={story} updateStory={updateStory} />}
        {step === 2 && <StepTheme story={story} updateStory={updateStory} />}
        {step === 3 && <StepStructure story={story} updateStory={updateStory} acts={current.acts} setActs={setActs} />}
        {step === 4 && (
          <StepCharacters
            characters={current.characters}
            storyId={story.id}
            addCharacter={addCharacter}
            updateCharacter={updateCharacter}
            removeCharacter={removeCharacter}
          />
        )}
        {step === 5 && (
          <StepScenes
            scenes={current.scenes}
            characters={current.characters}
            acts={current.acts}
            storyId={story.id}
            framework={story.framework}
            addScene={addScene}
            updateScene={updateScene}
            removeScene={removeScene}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          &larr; Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Próximo &rarr;
          </Button>
        ) : (
          <Button onClick={goToCanvas}>
            Abrir Canvas &rarr;
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================
// Step 1 — Essência
// ============================
function StepEssence({ story, updateStory }: { story: any; updateStory: (f: any) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-6">Essência da História</h2>

      <Field label="Título de trabalho">
        <input
          value={story.title}
          onChange={e => updateStory({ title: e.target.value })}
          placeholder="O título pode mudar — comece com algo que capture a essência"
          className="input-field"
        />
      </Field>

      <Field label="Logline" hint="A história em uma frase: [Protagonista] + [Conflito/Desejo] + [Obstáculo/Consequência]">
        <textarea
          value={story.logline}
          onChange={e => updateStory({ logline: e.target.value })}
          placeholder="Ex: Um músico cego descobre que pode ver o futuro através da música, mas cada visão encurta sua vida."
          rows={2}
          className="input-field"
        />
      </Field>

      <Field label="Premissa Dramática (opcional)" hint='"E se...?" — a pergunta que origina a história'>
        <textarea
          value={story.premise}
          onChange={e => updateStory({ premise: e.target.value })}
          placeholder="Ex: E se ver o futuro custasse o presente?"
          rows={2}
          className="input-field"
        />
      </Field>

      <GuidingQuestion
        question="O evento que desequilibra tudo. Sem ele, não há história. O que acontece que torna impossível para o protagonista continuar vivendo como antes?"
        author="Robert McKee — Incidente Incitante"
      />
      <Field label="Incidente Incitante">
        <textarea
          value={story.inciting_incident}
          onChange={e => updateStory({ inciting_incident: e.target.value })}
          placeholder="Descreva o evento que dispara a história..."
          rows={3}
          className="input-field"
        />
      </Field>
    </div>
  )
}

// ============================
// Step 2 — Tom & Gênero
// ============================
function StepGenre({ story, updateStory }: { story: any; updateStory: (f: any) => void }) {
  const selectedGenres: string[] = story.genre || []

  const toggleGenre = (id: string) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter(g => g !== id)
      : [...selectedGenres, id]
    updateStory({ genre: next })
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-2">Tom & Gênero</h2>
      <p className="text-text-secondary mb-6">Selecione um ou mais gêneros. Cada escolha influencia as sugestões estruturais.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {genres.map(g => {
          const selected = selectedGenres.includes(g.id)
          return (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                selected
                  ? 'border-gold bg-gold/10'
                  : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{g.icon}</span>
                <span className={`font-semibold ${selected ? 'text-gold' : 'text-text'}`}>{g.name}</span>
              </div>
              <p className="text-text-secondary text-sm mb-2">{g.description}</p>
              {selected && (
                <p className="text-xs text-gold-dim italic">{g.structuralImplication}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================
// Step 3 — Tema
// ============================
function StepTheme({ story, updateStory }: { story: any; updateStory: (f: any) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-6">Tema & Significado</h2>

      <Field label="Tema Central" hint="Uma ou duas palavras que resumem o coração da história">
        <input
          value={story.theme_central}
          onChange={e => updateStory({ theme_central: e.target.value })}
          placeholder="Ex: redenção, identidade, poder, perda..."
          className="input-field"
        />
      </Field>

      <Field label="Pergunta Temática" hint="Que pergunta a história faz ao leitor?">
        <textarea
          value={story.theme_question}
          onChange={e => updateStory({ theme_question: e.target.value })}
          placeholder='Ex: "É possível amar alguém sem perder a si mesmo?"'
          rows={2}
          className="input-field"
        />
      </Field>

      <GuidingQuestion
        question="Qual é o eixo moral da história? Amor vs. Ódio? Verdade vs. Mentira? Liberdade vs. Segurança? Toda grande história gira em torno de um valor que oscila entre positivo e negativo."
        author="Robert McKee — Valor em Jogo"
      />
      <Field label="Valor Central em Jogo">
        <input
          value={story.theme_value}
          onChange={e => updateStory({ theme_value: e.target.value })}
          placeholder="Ex: Verdade vs. Mentira"
          className="input-field"
        />
      </Field>

      <GuidingQuestion
        question="Que frase, dita por um personagem secundário no início, resume o tema sem que o protagonista perceba? É como plantar uma semente — o protagonista só entenderá no final."
        author="Blake Snyder — Declaração do Tema"
      />
      <Field label="Declaração do Tema">
        <textarea
          value={story.theme_declaration}
          onChange={e => updateStory({ theme_declaration: e.target.value })}
          placeholder="A frase que resume o tema, dita por alguém que não é o protagonista..."
          rows={2}
          className="input-field"
        />
      </Field>

      <Field label="Tese / Mensagem (opcional)" hint="Se a história chegasse a uma conclusão, qual seria?">
        <textarea
          value={story.theme_message}
          onChange={e => updateStory({ theme_message: e.target.value })}
          placeholder="Ex: A verdadeira liberdade é aceitar o que não podemos mudar."
          rows={2}
          className="input-field"
        />
      </Field>
    </div>
  )
}

// ============================
// Step 4 — Estrutura
// ============================
function StepStructure({
  story, updateStory, acts, setActs,
}: {
  story: any; updateStory: (f: any) => void; acts: StoryAct[]; setActs: (a: StoryAct[]) => void
}) {
  const selectedFramework = getFramework(story.framework)

  const selectFramework = (id: string) => {
    updateStory({ framework: id })
    const fw = getFramework(id)
    if (!fw) return
    // Create act entries for each stage
    const newActs: StoryAct[] = fw.stages.map(stage => {
      const existing = acts.find(a => a.act_index === stage.index && a.framework === id)
      return existing || {
        id: crypto.randomUUID(),
        story_id: story.id,
        framework: id,
        act_index: stage.index,
        act_name: stage.name,
        description: '',
      }
    })
    setActs(newActs)
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-2">Estrutura do Enredo</h2>
      <p className="text-text-secondary mb-6">Escolha o framework narrativo que guiará sua história.</p>

      {/* Framework selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {frameworks.map(fw => (
          <button
            key={fw.id}
            onClick={() => selectFramework(fw.id)}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              story.framework === fw.id
                ? 'border-gold bg-gold/10'
                : 'border-border bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className="font-semibold text-text mb-1">{fw.name}</div>
            <div className="text-xs text-text-muted mb-1">{fw.author} — {fw.stageCount} estágios</div>
            <p className="text-text-secondary text-sm">{fw.description}</p>
          </button>
        ))}
      </div>

      {/* Stages */}
      {selectedFramework && (
        <div>
          <h3 className="text-lg font-serif text-text mb-4">Estágios: {selectedFramework.name}</h3>
          <div className="space-y-4">
            {selectedFramework.stages.map((stage) => {
              const act = acts.find(a => a.act_index === stage.index)
              return (
                <div key={stage.index} className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                      {stage.index + 1}
                    </span>
                    <h4 className="font-semibold text-text">{stage.name}</h4>
                  </div>
                  <GuidingQuestion question={stage.guidingQuestion} />
                  <textarea
                    value={act?.description || ''}
                    onChange={e => {
                      if (act) {
                        const updated = acts.map(a =>
                          a.id === act.id ? { ...a, description: e.target.value } : a
                        )
                        setActs(updated)
                      }
                    }}
                    placeholder="Descreva o que acontece neste estágio..."
                    rows={3}
                    className="input-field"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================
// Step 5 — Personagens
// ============================
function StepCharacters({
  characters, storyId, addCharacter, updateCharacter, removeCharacter,
}: {
  characters: Character[]; storyId: string;
  addCharacter: (c: Character) => void; updateCharacter: (id: string, f: Partial<Character>) => void;
  removeCharacter: (id: string) => void
}) {
  const handleAdd = () => {
    addCharacter({
      id: crypto.randomUUID(),
      story_id: storyId,
      name: '',
      role: '',
      archetypes: [],
      desire: '',
      need: '',
      fear: '',
      flaw: '',
      save_the_cat: '',
      arc: '',
      backstory: '',
      notes: '',
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-2">Personagens</h2>
      <div className="mb-4 space-y-2">
        <GuidingQuestion question="O que ele quer? O que ele precisa? São coisas diferentes? Se sim, o conflito interno é forte." author="McKee + Vogler" />
        <GuidingQuestion question="Esse personagem existe no mundo comum ou no mundo especial? Ou transita entre os dois?" author="Joseph Campbell" />
      </div>

      <div className="space-y-4">
        {characters.map((char) => (
          <div key={char.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                value={char.name}
                onChange={e => updateCharacter(char.id, { name: e.target.value })}
                placeholder="Nome do personagem"
                className="input-field flex-1 font-semibold"
              />
              <select
                value={char.role}
                onChange={e => updateCharacter(char.id, { role: e.target.value })}
                className="input-field w-40"
              >
                <option value="">Papel...</option>
                <option value="protagonista">Protagonista</option>
                <option value="antagonista">Antagonista</option>
                <option value="mentor">Mentor</option>
                <option value="aliado">Aliado</option>
                <option value="interesse-romantico">Interesse Romântico</option>
                <option value="secundario">Secundário</option>
              </select>
              <button
                onClick={() => removeCharacter(char.id)}
                className="text-text-muted hover:text-negative transition-colors cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Archetypes */}
            <div className="mb-3">
              <label className="text-xs text-text-muted mb-1 block">Arquétipos (Vogler)</label>
              <div className="flex flex-wrap gap-2">
                {archetypes.map(a => {
                  const active = char.archetypes.some(ca => ca.archetype === a.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        const next = active
                          ? char.archetypes.filter(ca => ca.archetype !== a.id)
                          : [...char.archetypes, { archetype: a.id, phase: 'toda a história' }]
                        updateCharacter(char.id, { archetypes: next })
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        active ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-bg-tertiary text-text-muted hover:text-text border border-transparent'
                      }`}
                      title={a.guidingQuestion}
                    >
                      {a.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Desejo consciente / Spine (McKee)" compact>
                <textarea
                  value={char.desire}
                  onChange={e => updateCharacter(char.id, { desire: e.target.value })}
                  placeholder="O que busca externamente..."
                  rows={2}
                  className="input-field text-sm"
                />
              </Field>
              <Field label="Necessidade inconsciente" compact>
                <textarea
                  value={char.need}
                  onChange={e => updateCharacter(char.id, { need: e.target.value })}
                  placeholder="O que realmente precisa..."
                  rows={2}
                  className="input-field text-sm"
                />
              </Field>
              <Field label="Medo central" compact>
                <input
                  value={char.fear}
                  onChange={e => updateCharacter(char.id, { fear: e.target.value })}
                  placeholder="Seu maior medo..."
                  className="input-field text-sm"
                />
              </Field>
              <Field label="Falha / Fraqueza (hamartia)" compact>
                <input
                  value={char.flaw}
                  onChange={e => updateCharacter(char.id, { flaw: e.target.value })}
                  placeholder="A falha que pode destruí-lo..."
                  className="input-field text-sm"
                />
              </Field>
            </div>

            <Field label='Save the Cat moment (Snyder)' compact>
              <textarea
                value={char.save_the_cat}
                onChange={e => updateCharacter(char.id, { save_the_cat: e.target.value })}
                placeholder="O que esse personagem faz logo cedo que o torna simpático ao leitor?"
                rows={2}
                className="input-field text-sm"
              />
            </Field>

            <Field label="Arco do personagem" compact>
              <textarea
                value={char.arc}
                onChange={e => updateCharacter(char.id, { arc: e.target.value })}
                placeholder="Como muda do início ao fim..."
                rows={2}
                className="input-field text-sm"
              />
            </Field>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={handleAdd} className="mt-4 w-full">
        + Adicionar Personagem
      </Button>
    </div>
  )
}

// ============================
// Step 6 — Cenas
// ============================
function StepScenes({
  scenes, characters, acts, storyId, framework,
  addScene, updateScene, removeScene,
}: {
  scenes: Scene[]; characters: Character[]; acts: StoryAct[];
  storyId: string; framework: string;
  addScene: (s: Scene) => void; updateScene: (id: string, f: Partial<Scene>) => void;
  removeScene: (id: string) => void
}) {
  const fw = getFramework(framework)

  const handleAdd = () => {
    addScene({
      id: crypto.randomUUID(),
      story_id: storyId,
      title: '',
      act_index: null,
      subplot_id: null,
      characters: [],
      value_at_stake: '',
      charge_start: '+',
      charge_end: '-',
      conflict: '',
      change: '',
      gap_expected: '',
      gap_actual: '',
      weight: 'medium',
      position_x: 0,
      position_y: 0,
      sort_order: scenes.length,
      notes: '',
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-gold mb-2">Cenas-Chave</h2>
      <GuidingQuestion
        question="Toda cena gira em torno de um valor que muda. Se começa positiva e termina positiva, é estática — e pode ser cortada. O que muda nesta cena?"
        author="Robert McKee"
      />

      <div className="space-y-4 mt-4">
        {scenes.map((scene) => {
          const isStatic = scene.charge_start === scene.charge_end
          return (
            <div key={scene.id} className={`bg-surface border rounded-lg p-4 ${isStatic ? 'border-warning/50' : 'border-border'}`}>
              {isStatic && scene.title && (
                <div className="text-warning text-xs mb-2 flex items-center gap-1">
                  ⚠ McKee diz: se nada muda, a cena pode ser cortada. Tem certeza?
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <input
                  value={scene.title}
                  onChange={e => updateScene(scene.id, { title: e.target.value })}
                  placeholder="Título da cena"
                  className="input-field flex-1 font-semibold"
                />
                <button
                  onClick={() => removeScene(scene.id)}
                  className="text-text-muted hover:text-negative transition-colors cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {fw && (
                  <Field label="Estágio" compact>
                    <select
                      value={scene.act_index ?? ''}
                      onChange={e => updateScene(scene.id, { act_index: e.target.value === '' ? null : Number(e.target.value) })}
                      className="input-field text-sm"
                    >
                      <option value="">Nenhum</option>
                      {fw.stages.map(s => (
                        <option key={s.index} value={s.index}>{s.name}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label="Valor em jogo (McKee)" compact>
                  <input
                    value={scene.value_at_stake}
                    onChange={e => updateScene(scene.id, { value_at_stake: e.target.value })}
                    placeholder="amor, verdade, poder..."
                    className="input-field text-sm"
                  />
                </Field>

                <Field label="Peso/Duração" compact>
                  <select
                    value={scene.weight}
                    onChange={e => updateScene(scene.id, { weight: e.target.value as any })}
                    className="input-field text-sm"
                  >
                    <option value="light">Leve (rápida)</option>
                    <option value="medium">Média</option>
                    <option value="heavy">Pesada (longa)</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Carga início" compact>
                  <div className="flex gap-2">
                    {(['+', '-'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => updateScene(scene.id, { charge_start: c })}
                        className={`flex-1 py-1 rounded text-center cursor-pointer transition-colors ${
                          scene.charge_start === c
                            ? c === '+' ? 'bg-positive/20 text-positive border border-positive/30' : 'bg-negative/20 text-negative border border-negative/30'
                            : 'bg-bg-tertiary text-text-muted border border-transparent'
                        }`}
                      >
                        {c === '+' ? '+ Positiva' : '- Negativa'}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Carga fim" compact>
                  <div className="flex gap-2">
                    {(['+', '-'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => updateScene(scene.id, { charge_end: c })}
                        className={`flex-1 py-1 rounded text-center cursor-pointer transition-colors ${
                          scene.charge_end === c
                            ? c === '+' ? 'bg-positive/20 text-positive border border-positive/30' : 'bg-negative/20 text-negative border border-negative/30'
                            : 'bg-bg-tertiary text-text-muted border border-transparent'
                        }`}
                      >
                        {c === '+' ? '+ Positiva' : '- Negativa'}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Personagens nesta cena" compact>
                <div className="flex flex-wrap gap-2">
                  {characters.map(ch => {
                    const active = scene.characters.includes(ch.id)
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          const next = active
                            ? scene.characters.filter(id => id !== ch.id)
                            : [...scene.characters, ch.id]
                          updateScene(scene.id, { characters: next })
                        }}
                        className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          active ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-bg-tertiary text-text-muted border border-transparent'
                        }`}
                      >
                        {ch.name || 'Sem nome'}
                      </button>
                    )
                  })}
                  {characters.length === 0 && (
                    <span className="text-text-muted text-xs italic">Adicione personagens no passo anterior</span>
                  )}
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Conflito" compact>
                  <textarea
                    value={scene.conflict}
                    onChange={e => updateScene(scene.id, { conflict: e.target.value })}
                    placeholder="O que está em jogo?"
                    rows={2}
                    className="input-field text-sm"
                  />
                </Field>
                <Field label="O que muda" compact>
                  <textarea
                    value={scene.change}
                    onChange={e => updateScene(scene.id, { change: e.target.value })}
                    placeholder="Que informação, relação ou estado se transforma?"
                    rows={2}
                    className="input-field text-sm"
                  />
                </Field>
              </div>

              <GuidingQuestion question="O que o personagem esperava que acontecesse? E o que realmente aconteceu? Quanto maior a distância entre os dois, mais poderosa a cena." author="McKee — Gap" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Esperava..." compact>
                  <textarea
                    value={scene.gap_expected}
                    onChange={e => updateScene(scene.id, { gap_expected: e.target.value })}
                    rows={2}
                    className="input-field text-sm"
                  />
                </Field>
                <Field label="Aconteceu..." compact>
                  <textarea
                    value={scene.gap_actual}
                    onChange={e => updateScene(scene.id, { gap_actual: e.target.value })}
                    rows={2}
                    className="input-field text-sm"
                  />
                </Field>
              </div>
            </div>
          )
        })}
      </div>

      <Button variant="secondary" onClick={handleAdd} className="mt-4 w-full">
        + Adicionar Cena
      </Button>
    </div>
  )
}

// ============================
// Shared — Field wrapper
// ============================
function Field({
  label, hint, compact, children,
}: {
  label: string; hint?: string; compact?: boolean; children: React.ReactNode
}) {
  return (
    <div className={compact ? 'mb-2' : 'mb-5'}>
      <label className={`block font-medium mb-1 ${compact ? 'text-xs text-text-muted' : 'text-sm text-text-secondary'}`}>
        {label}
      </label>
      {hint && <p className="text-xs text-text-muted mb-1">{hint}</p>}
      {children}
    </div>
  )
}
