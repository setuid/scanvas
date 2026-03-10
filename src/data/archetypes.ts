import type { Archetype } from '@/types'

export const archetypes: Archetype[] = [
  {
    id: 'hero',
    name: 'Herói',
    function: 'Protagonista que cresce e se transforma',
    guidingQuestion: 'O que ele quer? O que ele precisa? São coisas diferentes?',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    function: 'Guia, treina, presenteia',
    guidingQuestion: 'Que sabedoria ou ferramenta ele oferece? O mentor tem suas próprias limitações?',
  },
  {
    id: 'threshold-guardian',
    name: 'Guardião do Limiar',
    function: 'Testa a determinação do herói',
    guidingQuestion: 'Que obstáculo inicial prova que o herói é digno de continuar?',
  },
  {
    id: 'herald',
    name: 'Arauto',
    function: 'Anuncia a mudança, traz o chamado',
    guidingQuestion: 'Quem ou o quê traz a notícia que muda tudo?',
  },
  {
    id: 'shapeshifter',
    name: 'Camaleão',
    function: 'Mutável, ambíguo, gera dúvida',
    guidingQuestion: 'Esse personagem é confiável? O leitor sabe, ou é surpreendido?',
  },
  {
    id: 'shadow',
    name: 'Sombra',
    function: 'Antagonista, espelho escuro do herói',
    guidingQuestion: 'O que o antagonista quer? Em que ele é parecido com o herói?',
  },
  {
    id: 'trickster',
    name: 'Trapaceiro (Pícaro)',
    function: 'Alívio cômico, questiona o status quo',
    guidingQuestion: 'Que personagem desafia as regras e traz leveza ou caos?',
  },
]

export function getArchetype(id: string): Archetype | undefined {
  return archetypes.find(a => a.id === id)
}
