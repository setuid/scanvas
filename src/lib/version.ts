export const APP_VERSION = '0.3.0'

export const changelog: ChangelogEntry[] = [
  {
    version: '0.3.0',
    date: '2026-03-14',
    items: [
      'Nova aba "Guia" com Diagnostico Narrativo e Guia Socratico por framework',
      'Diagnostico automatico detecta lacunas na estrutura, personagens ausentes, tensao estagnada e promessas abertas',
      'Guia Socratico com navegacao entre estagios, perguntas reflexivas e campo de resposta persistente',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-03-13',
    items: [
      'Exportacao em Markdown, PDF e JSON',
      'Compartilhamento de historias via link publico (somente leitura)',
      'Fluxo de cenas incluido no compartilhamento',
      'Aba "Fluxo" com visualizacao de sequencia de cenas, curva de tensao e swim lanes de personagens',
      'Conexoes customizadas entre cenas no fluxo',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-03-12',
    items: [
      'MVP do Story Canvas — criacao e edicao de historias',
      'Frameworks narrativos: Jornada do Heroi, Save the Cat, Piramide de Freytag e mais',
      'Gerenciamento de personagens com arquetipos e relacoes',
      'Editor de cenas com carga dramatica, conflito e mudanca',
      'Subplots, promessas narrativas e notas de mundo',
      'Integracao com Supabase para sincronizacao na nuvem',
      'Autenticacao por email/senha e Google OAuth',
      'Dashboard com saude narrativa e visao geral',
    ],
  },
]

export interface ChangelogEntry {
  version: string
  date: string
  items: string[]
}
