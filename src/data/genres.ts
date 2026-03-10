import type { Genre } from '@/types'

export const genres: Genre[] = [
  {
    id: 'tragedy',
    name: 'Tragédia',
    icon: '🎭',
    description: 'Queda do protagonista por falha fatal (hamartia)',
    structuralImplication: 'Arco descendente. O herói causa sua própria destruição. A falha interna é mais importante que o inimigo externo.',
    color: 'var(--color-tragedy)',
  },
  {
    id: 'comedy',
    name: 'Comédia',
    icon: '😄',
    description: 'Conflitos resolvidos, final feliz ou reconciliatório',
    structuralImplication: 'Arco ascendente. Obstáculos superados por engenho, sorte ou mudança de perspectiva.',
    color: 'var(--color-comedy)',
  },
  {
    id: 'epic',
    name: 'Épico / Heroico',
    icon: '⚔️',
    description: 'Superação e transformação grandiosa',
    structuralImplication: 'Jornada do Herói clássica. Provação e recompensa. O herói retorna transformado.',
    color: 'var(--color-epic)',
  },
  {
    id: 'drama',
    name: 'Drama',
    icon: '💔',
    description: 'Conflitos humanos e emocionais profundos',
    structuralImplication: 'Foco em relações e mudanças internas. O conflito é entre pessoas, não entre forças abstratas.',
    color: 'var(--color-drama)',
  },
  {
    id: 'mystery',
    name: 'Mistério / Suspense',
    icon: '🔍',
    description: 'Revelação progressiva de verdades ocultas',
    structuralImplication: 'Informação dosada. Controle de revelação é essencial. Reviravoltas. Pistas plantadas (use o Setup/Payoff tracker).',
    color: 'var(--color-mystery)',
  },
  {
    id: 'absurd',
    name: 'Absurdo / Satírico',
    icon: '🃏',
    description: 'Subversão da lógica e crítica social',
    structuralImplication: 'A estrutura pode quebrar convenções deliberadamente. O Kishōtenketsu pode ser mais adequado que os 3 atos.',
    color: 'var(--color-absurd)',
  },
  {
    id: 'fable',
    name: 'Fábula / Alegoria',
    icon: '📖',
    description: 'Narrativa simbólica com moral',
    structuralImplication: 'Personagens representam conceitos. O tema é explícito. Final com lição clara.',
    color: 'var(--color-fable)',
  },
  {
    id: 'horror',
    name: 'Horror / Terror',
    icon: '👁️',
    description: 'Medo, tensão e o desconhecido',
    structuralImplication: 'Escalada de ameaça. Isolamento progressivo. O monstro (literal ou metafórico) se revela gradualmente.',
    color: 'var(--color-horror)',
  },
]

export function getGenre(id: string): Genre | undefined {
  return genres.find(g => g.id === id)
}
