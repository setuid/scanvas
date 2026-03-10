# Story Canvas — Especificação Funcional v2.0

## 1. Visão do Produto

Story Canvas é o cockpit do escritor. Uma aplicação web para arquitetar, visualizar e iterar sobre a estrutura de uma história antes de escrevê-la. Não é um editor de texto — é a ferramenta onde o autor pensa, conecta e enxerga a anatomia completa da narrativa.

**Metáfora central:** Assim como um piloto não voa olhando pela janela mas sim pelo painel de instrumentos, o escritor usa o Story Canvas para enxergar toda a história de uma vez — arcos, relações, tensões, temas — e tomar decisões narrativas com clareza.

**O que torna o Story Canvas único:** Diferente de ferramentas como Plottr (organizador visual), Campfire (worldbuilding profundo) ou Scrivener (editor com organização), o Story Canvas é fundamentado em teoria narrativa. Cada campo, cada pergunta, cada visualização incorpora os ensinamentos de Joseph Campbell, Robert McKee, Blake Snyder, Christopher Vogler e outros mestres. A aplicação não apenas organiza — ela ensina, questiona e revela a anatomia da história ao autor.

### 1.1 — Posicionamento frente ao mercado

| Ferramenta | Força | Fraqueza que Story Canvas resolve |
|---|---|---|
| Plottr | Timeline visual com plotlines paralelas, simplicidade, 40+ templates | Sem fundamentação teórica, sem análise de tensão, sem grafo de relações, sem tracking de promessas |
| Campfire Writing | 17 módulos, worldbuilding profundíssimo, grafo de relações | Genérico nos campos narrativos, sem mentoria teórica, caro se modular, sem curva dramática |
| Scrivener | Veterano, pesquisa integrada, corkboard | Design datado, curva de aprendizado alta, sem visualizações narrativas |
| Obsidian/Anytype | Flexibilidade total, grafos de notas | Não é específico para narrativa, requer configuração manual total |

**Diferenciação central do Story Canvas:**

1. Mentoria narrativa embutida (a voz dos mestres em cada decisão)
2. Curva de tensão automática (feedback visual do ritmo)
3. Sistema de promessas narrativas — Setup/Payoff tracker
4. Modo "E se?" para bifurcações e experimentação
5. Subplots como entidades de primeira classe
6. Controle de informação e revelação (quem sabe o quê e quando)

## 2. Restrições Técnicas

- **Deploy:** GitHub Pages (aplicação estática, SPA)
- **Backend/Persistência:** Supabase
  - **Autenticação:** Supabase Auth com Google OAuth (natural para quem já usa Google Docs)
  - **Banco de dados:** Supabase PostgreSQL para todas as histórias e dados do usuário
  - **Fallback:** Export/Import JSON como backup adicional (o autor nunca perde trabalho)
- **Responsividade:** Desktop-first, mas funcional em mobile (telas de edição adaptam layout, board de cenas simplifica para lista em telas pequenas)
- **Export:** PDF com todos os artefatos do canvas
- **Stack:** Livre (sugestão: React + Vite para SPA estática, Supabase JS client para backend)
- **Sem IA integrada:** Todo conteúdo é preenchido pelo autor. A aplicação fornece estrutura, frameworks, perguntas-guia e análises visuais — não gera texto.
- **Offline:** A aplicação deve funcionar offline após o primeiro carregamento, sincronizando com Supabase quando a conexão voltar (cache local + sync)

## 3. Fundamentos Narrativos

A aplicação incorpora deliberadamente conhecimento dos seguintes autores e frameworks. Cada um deve estar presente como opção de estrutura, e seus conceitos devem permear os campos, dicas e perguntas-guia da interface.

> **IMPORTANTE PARA O DESENVOLVEDOR:** As perguntas-guia são tão importantes quanto os campos. Elas incorporam a sabedoria dos autores referenciados e são o principal diferencial da ferramenta. Tratá-las como conteúdo editorial de alto valor, não como placeholder genérico. Cada pergunta deve ser contextual ao estágio narrativo em que o autor se encontra.

### 3.1 — Joseph Campbell — "O Herói de Mil Faces"

A Jornada do Herói (Monomito) em 12 estágios:

1. **Mundo Comum** — Pergunta-guia: "Como é a vida do herói antes de tudo mudar? O que é 'normal' para ele — e o que já incomoda, mesmo que ele não saiba?"
2. **Chamado à Aventura** — "O que arranca o herói do mundo comum? Que evento torna impossível continuar como antes?"
3. **Recusa do Chamado** — "Por que o herói hesita? O que ele tem a perder? Que medo ou obrigação o prende?"
4. **Encontro com o Mentor** — "Quem ou o quê dá ao herói a coragem ou ferramenta para seguir? O mentor pode ser uma pessoa, um objeto, uma memória."
5. **Travessia do Primeiro Limiar** — "Qual é o ponto sem retorno? O momento em que o herói deixa o mundo conhecido e não pode mais voltar atrás?"
6. **Provas, Aliados e Inimigos** — "Quem o herói encontra no mundo especial? Quem se torna aliado, quem se revela inimigo? Que regras desse novo mundo ele precisa aprender?"
7. **Aproximação da Caverna Oculta** — "O herói se prepara para o maior desafio. O que está em jogo? O que ele descobre sobre si mesmo enquanto se aproxima?"
8. **Provação Suprema** — "Este é o momento de morte simbólica. O que o herói enfrenta que pode destruí-lo? O que ele precisa sacrificar?"
9. **Recompensa (Apanhando a Espada)** — "O que o herói ganha após sobreviver à provação? Pode ser um objeto, conhecimento, poder ou transformação interna."
10. **Caminho de Volta** — "O herói começa a retornar, mas a jornada não acabou. Que consequências da provação o perseguem?"
11. **Ressurreição** — "O teste final. O herói usa tudo que aprendeu. Como a pessoa que ele se tornou difere da pessoa que partiu?"
12. **Retorno com o Elixir** — "O que o herói traz de volta para o mundo comum? Como isso transforma não só ele, mas o mundo ao seu redor?"

**Conceitos-chave a incorporar na interface:**

- O herói é transformado pela jornada — o arco é interno, não só externo
- Mundo comum vs. mundo especial — a geografia emocional da história
- A morte simbólica e o renascimento — toda grande história tem um momento de "morte"
- O elixir — o que o herói traz de volta para o mundo

### 3.2 — Christopher Vogler — "A Jornada do Escritor"

Adaptação prática de Campbell para roteiro e ficção. Mesmos 12 estágios, mas com foco nos 7 arquétipos funcionais:

| Arquétipo | Função na história | Pergunta-guia |
|---|---|---|
| Herói | Protagonista que cresce e se transforma | "O que ele quer? O que ele precisa? São coisas diferentes?" |
| Mentor | Guia, treina, presenteia | "Que sabedoria ou ferramenta ele oferece? O mentor tem suas próprias limitações?" |
| Guardião do Limiar | Testa a determinação do herói | "Que obstáculo inicial prova que o herói é digno de continuar?" |
| Arauto | Anuncia a mudança, traz o chamado | "Quem ou o quê traz a notícia que muda tudo?" |
| Camaleão | Mutável, ambíguo, gera dúvida | "Esse personagem é confiável? O leitor sabe, ou é surpreendido?" |
| Sombra | Antagonista, espelho escuro do herói | "O que o antagonista quer? Em que ele é parecido com o herói?" |
| Trapaceiro (Pícaro) | Alívio cômico, questiona o status quo | "Que personagem desafia as regras e traz leveza ou caos?" |

**Conceito-chave:** Cada personagem pode cumprir múltiplos arquétipos, e arquétipos podem migrar entre personagens ao longo da história. A interface deve permitir associar múltiplos arquétipos a um personagem e indicar em que fase da história cada arquétipo é ativo.

### 3.3 — Blake Snyder — "Save the Cat!"

Estrutura em 15 beats (batidas narrativas):

1. **Imagem de Abertura** — "Qual é o 'retrato' do mundo antes da história? Este momento deve espelhar a Imagem Final."
2. **Declaração do Tema** — "Alguém (não o protagonista) diz algo que resume o tema da história, geralmente nos primeiros 5 minutos. O protagonista ainda não entende."
3. **Setup (Apresentação)** — "Mostre o mundo como ele é. Plante tudo que será colhido depois. Cada elemento aqui é uma promessa ao leitor."
4. **Catalisador** — "O evento que muda tudo. Sem ele, a história não existiria. O que acontece que torna o status quo insustentável?"
5. **Debate** — "O protagonista hesita. Deveria aceitar? O que está em risco? Este é o momento de dúvida humana."
6. **Virada para o Ato II (Break into Two)** — "O protagonista escolhe agir. Este é um ponto sem retorno — deve ser uma decisão ativa, não passiva."
7. **Trama B** — "A história secundária começa — geralmente uma relação (romântica, amizade, mentoria) que carrega o tema."
8. **Diversão e Jogos (Fun and Games)** — "A 'promessa da premissa' se cumpre aqui. É o que apareceria no trailer. O que faz essa história ser divertida/interessante de acompanhar?"
9. **Ponto Médio (Midpoint)** — "Falsa vitória ou falsa derrota. As apostas sobem. O protagonista descobre algo que muda o jogo."
10. **Os Vilões se Aproximam (Bad Guys Close In)** — "Pressão externa e interna aumentam. Aliados traem, planos falham, a equipe se desintegra."
11. **Tudo Está Perdido (All Is Lost)** — "O momento mais baixo. Blake Snyder diz que aqui deve haver um 'whiff of death' — algo precisa morrer, literal ou simbolicamente. O que morre? Uma relação? Uma crença? Uma esperança?"
12. **Noite Escura da Alma (Dark Night of the Soul)** — "O protagonista sozinho com seu fracasso. Este é o momento de reflexão mais profunda antes da virada final."
13. **Virada para o Ato III (Break into Three)** — "A solução vem da Trama B. O que o protagonista aprendeu na relação secundária que agora ilumina a solução?"
14. **Finale** — "O protagonista aplica tudo que aprendeu. O mundo antigo é destruído e o novo é construído."
15. **Imagem Final** — "O espelho da Imagem de Abertura. O que mudou? Se a abertura era triste, o final é esperançoso (ou vice-versa na tragédia)."

**Conceitos-chave a incorporar:**

- O "Save the Cat moment" — o protagonista precisa fazer algo que o torne simpático logo no início. Campo específico na ficha do protagonista.
- Imagem de Abertura ↔ Imagem Final como espelho — a interface deve permitir visualizar os dois lado a lado.
- O ponto médio divide a história em "diversão" e "consequência".
- O "whiff of death" no All Is Lost — pergunta-guia enfática nesse beat.

### 3.4 — Robert McKee — "Story"

McKee não propõe uma estrutura fixa, mas princípios fundamentais que devem ser incorporados transversalmente em toda a aplicação, especialmente nos campos de cena:

**Valores em jogo:**

- Toda cena gira em torno de um valor (amor/ódio, verdade/mentira, liberdade/opressão, vida/morte, justiça/injustiça) que se move de positivo para negativo ou vice-versa.
- Campo na cena: "Qual é o valor em jogo?" + "Carga no início da cena" (+/-) + "Carga no fim da cena" (+/-).
- Se a carga não muda, a cena é estática e pode ser cortada. A interface deve sinalizar visualmente cenas onde o autor marcou a mesma carga no início e no fim.

**Gap (Lacuna):**

- A distância entre o que o personagem espera que aconteça e o que realmente acontece. Histórias vivem nos gaps.
- Campo na cena: "O que o personagem esperava?" + "O que realmente aconteceu?"
- Quanto maior o gap, mais poderosa a cena.

**Hierarquia narrativa:**

- Beat → Cena → Sequência → Ato → História
- A aplicação deve suportar pelo menos Cenas dentro de Atos. Sequências podem ser uma feature futura.

**Inciting Incident (Incidente Incitante):**

- O evento que desequilibra a vida do protagonista e dispara a história.
- Deve haver um campo específico marcado como "incidente incitante" no nível da história, além de estar na timeline.

**Spine (Espinha):**

- O desejo consciente do protagonista que unifica toda a narrativa.
- Campo na ficha do protagonista: "Spine — o desejo que puxa a história do começo ao fim."

**Mudança de valor por cena:**

- A regra mais importante de McKee: toda cena deve mudar algo. Se começa positiva e termina positiva, é estática.
- A curva de tensão automática é derivada diretamente desse conceito.

### 3.5 — Gustav Freytag — Pirâmide de Freytag

Estrutura dramática em 5 partes:

1. **Exposição** — "Quem são os personagens? Onde estamos? O que é o status quo?"
2. **Ação Ascendente (Rising Action)** — "Que eventos criam tensão crescente? Cada obstáculo é maior que o anterior?"
3. **Clímax** — "O ponto de maior tensão. Qual decisão irreversível o protagonista toma?"
4. **Ação Descendente (Falling Action)** — "Quais são as consequências do clímax? O mundo reage."
5. **Desfecho (Dénouement)** — "Como o novo equilíbrio se estabelece? O que mudou permanentemente?"

**Conceito-chave:** A tensão narrativa sobe até o clímax e desce até a resolução. Útil especialmente para tragédias clássicas. A curva de tensão da aplicação deve refletir visualmente essa pirâmide.

### 3.6 — Kishōtenketsu — Estrutura em 4 atos (tradição oriental)

1. **Ki (起) — Introdução:** "Apresente os elementos sem conflito. O leitor conhece o mundo e os personagens em estado neutro."
2. **Shō (承) — Desenvolvimento:** "Aprofunde o que foi apresentado. Construa familiaridade. Ainda não há conflito."
3. **Ten (転) — Reviravolta:** "Introduza algo inesperado que muda a perspectiva sobre tudo que veio antes. Pode ser uma revelação, uma justaposição, ou um novo elemento."
4. **Ketsu (結) — Conclusão:** "Reconcilie o mundo da introdução com a revelação da reviravolta. O leitor vê tudo sob uma nova luz."

**Conceito-chave:** Diferente das estruturas ocidentais, não exige conflito como motor. A reviravolta no terceiro ato pode ser uma mudança de perspectiva, uma revelação ou uma justaposição inesperada. Ideal para contos contemplativos, narrativas orientais e histórias que subvertem a expectativa de conflito.

### 3.7 — Estrutura Clássica de Três Atos

1. **Ato I — Setup:** "Apresente o mundo, o protagonista e o conflito central. Termine com o ponto sem retorno."
2. **Ato II — Confrontação:** "Obstáculos crescentes, subplots se entrelaçam, aliados e inimigos se revelam. Termine com o 'tudo está perdido'."
3. **Ato III — Resolução:** "O clímax e suas consequências. O novo mundo se estabelece."

### 3.8 — Cinco Atos (Shakespeare / Drama Elisabetano)

1. **Exposição** — "Apresente o mundo e os personagens com um evento incitante."
2. **Ação Ascendente** — "Complicações crescem, o protagonista se compromete com um caminho."
3. **Clímax (Ato III)** — "O ponto de virada central. Decisão irreversível."
4. **Ação Descendente** — "As consequências se acumulam. O destino se torna inevitável."
5. **Catástrofe / Resolução** — "Na tragédia, a queda final. Na comédia, a reconciliação."

## 4. Gêneros e Tons Narrativos

A aplicação deve oferecer estas opções de gênero/ton. A seleção é múltipla (uma história pode ser drama + mistério). Ao selecionar um gênero, a interface mostra a implicação estrutural correspondente.

| Gênero | Ícone | Descrição | Implicação Estrutural |
|---|---|---|---|
| Tragédia | 🎭 | Queda do protagonista por falha fatal (hamartia) | Arco descendente. O herói causa sua própria destruição. A falha interna é mais importante que o inimigo externo. |
| Comédia | 😄 | Conflitos resolvidos, final feliz ou reconciliatório | Arco ascendente. Obstáculos superados por engenho, sorte ou mudança de perspectiva. |
| Épico / Heroico | ⚔️ | Superação e transformação grandiosa | Jornada do Herói clássica. Provação e recompensa. O herói retorna transformado. |
| Drama | 💔 | Conflitos humanos e emocionais profundos | Foco em relações e mudanças internas. O conflito é entre pessoas, não entre forças abstratas. |
| Mistério / Suspense | 🔍 | Revelação progressiva de verdades ocultas | Informação dosada. Controle de revelação é essencial. Reviravoltas. Pistas plantadas (use o Setup/Payoff tracker). |
| Absurdo / Satírico | 🃏 | Subversão da lógica e crítica social | A estrutura pode quebrar convenções deliberadamente. O Kishōtenketsu pode ser mais adequado que os 3 atos. |
| Fábula / Alegoria | 📖 | Narrativa simbólica com moral | Personagens representam conceitos. O tema é explícito. Final com lição clara. |
| Horror / Terror | 👁️ | Medo, tensão e o desconhecido | Escalada de ameaça. Isolamento progressivo. O monstro (literal ou metafórico) se revela gradualmente. |

## 5. Funcionalidades da Aplicação

### 5.1 — Tela Inicial (Home)

- Título "Story Canvas" com breve descrição do propósito
- Botão "Começar com o Wizard" → inicia o fluxo guiado para nova história
- Botão "Ir direto ao Canvas" → abre canvas vazio para nova história
- Lista de histórias salvas (do Supabase) com:
  - Título, gênero, data de última edição
  - Opções: Abrir, Duplicar, Excluir (com confirmação)
  - Opção de criar uma bifurcação ("E se?") a partir de uma história existente
- Botão de importar história (arquivo JSON)
- Botão de exportar história (arquivo JSON para backup)
- Indicador de status de sincronização (online/offline)

### 5.2 — Wizard (Fluxo Guiado)

Fluxo passo-a-passo que guia o autor pela construção da arquitetura da história. Cada passo inclui perguntas-guia (prompts reflexivos) baseadas nos frameworks narrativos da Seção 3. O wizard não é obrigatório — serve como scaffolding para quem quer ser conduzido.

O autor pode sair do wizard a qualquer momento e ir direto ao canvas. Pode também voltar ao wizard depois para preencher o que faltou.

#### Passo 1 — Essência

- Título de trabalho
- Logline (a história em uma frase)
  - Dica: [Protagonista] + [Conflito/Desejo] + [Obstáculo/Consequência]
  - Exemplo: "Um músico cego descobre que pode ver o futuro através da música, mas cada visão encurta sua vida."
- Premissa dramática (opcional)
  - Dica: "E se...?" — a pergunta que origina a história
  - Exemplo: "E se ver o futuro custasse o presente?"
- Incidente Incitante (McKee): "O evento que desequilibra tudo. Sem ele, não há história."

#### Passo 2 — Tom & Gênero

- Seleção do gênero/ton (cards visuais com ícone, nome e descrição)
- Seleção múltipla permitida
- Ao selecionar, mostrar as implicações estruturais e uma sugestão de framework

#### Passo 3 — Tema & Significado

- Tema central (uma ou duas palavras: redenção, identidade, poder...)
- Pergunta temática ("Que pergunta a história faz ao leitor?")
  - Exemplo: "É possível amar alguém sem perder a si mesmo?"
- Tese / Mensagem (opcional: "Se a história chegasse a uma conclusão, qual seria?")
- Valor central em jogo (McKee): "Qual é o eixo moral da história? Amor vs. Ódio? Verdade vs. Mentira? Liberdade vs. Segurança?"
- Declaração do Tema (Snyder): "Que frase, dita por um personagem secundário no início, resume o tema sem que o protagonista perceba?"

#### Passo 4 — Estrutura do Enredo

- Escolha do framework narrativo (cards com nome, autor de referência, número de estágios e breve descrição)
  - Jornada do Herói (Campbell/Vogler) — 12 estágios
  - Save the Cat! (Blake Snyder) — 15 beats
  - Pirâmide de Freytag — 5 partes
  - Kishōtenketsu — 4 atos
  - Três Atos (clássico) — 3 atos
  - Cinco Atos (Shakespeare) — 5 atos
- Para cada estágio/beat do framework escolhido:
  - Campo de texto para descrever o que acontece
  - Pergunta-guia contextual (as perguntas da Seção 3, específicas por estágio)
- O autor pode criar subplots (ver seção 5.3.6) já nesta fase

#### Passo 5 — Personagens

- Adicionar múltiplos personagens, cada um com:
  - Nome
  - Papel na história (protagonista, antagonista, mentor, aliado, etc.)
  - Arquétipo(s) — multi-select com os 7 de Vogler + outros comuns (ver lista na Seção 3.2)
    - Pode associar arquétipos diferentes a fases diferentes da história (ex: "Mentor no Ato I, Sombra no Ato III")
  - Desejo consciente / Spine (McKee): "O que busca externamente — o desejo que puxa a história"
  - Necessidade inconsciente: "O que realmente precisa — pode ser oposto ao desejo"
  - Medo central
  - Falha / Fraqueza (hamartia em tragédias)
  - Save the Cat moment (Snyder): "O que esse personagem faz logo cedo que o torna simpático ao leitor?"
  - Arco do personagem (descrição livre de como muda do início ao fim)
  - Backstory / Notas livres
- Perguntas-guia:
  - Vogler: "Que arquétipo esse personagem cumpre? Ele muda de arquétipo ao longo da história?"
  - McKee: "O desejo consciente e a necessidade inconsciente são opostos? Se sim, o conflito interno é forte."
  - Campbell: "Esse personagem existe no mundo comum ou no mundo especial? Ou transita entre os dois?"

#### Passo 6 — Cenas-Chave & Storyboard

- Adicionar cenas, cada uma com:
  - Título da cena
  - Associação a um estágio/beat do framework escolhido
  - Associação a um subplot (se houver)
  - Personagens envolvidos (multi-select dos personagens criados)
  - Valor em jogo (McKee): dropdown ou texto livre (amor, verdade, poder, etc.)
  - Carga no início da cena (+/-) e Carga no fim da cena (+/-)
  - Conflito da cena ("O que está em jogo?")
  - O que muda ("Que informação, relação ou estado se transforma?")
  - Gap (McKee): "O que o personagem esperava que acontecesse vs. o que realmente aconteceu?"
  - Peso/Duração (leve/médio/pesado): indica se é uma cena rápida ou longa, para análise de ritmo
  - Notas livres
- Alerta visual: Se o autor marca a mesma carga no início e no fim (+/+ ou -/-), a interface mostra um aviso sutil: "McKee diz: se nada muda, a cena pode ser cortada. Tem certeza?"
- Ao final do wizard, botão "Abrir Canvas" que leva à visão completa

### 5.3 — Canvas Visual

O canvas é o coração da aplicação. Tem múltiplas visões acessíveis por abas/tabs. Todas as visões compartilham os mesmos dados — editar em uma visão reflete em todas.

#### 5.3.1 — Visão Geral (Dashboard)

Resumo visual da história em cards editáveis:

- Card de identidade (título, logline, premissa, incidente incitante)
- Card de gênero/ton (gêneros selecionados com ícones e implicações)
- Card de tema (tema central, pergunta temática, valor em jogo, tese)
- Card de estrutura (framework escolhido + resumo visual dos atos/beats preenchidos vs. vazios)
- Card de personagens (lista com nomes, papéis e arquétipos)
- Card de cenas (contagem + lista resumida)
- Card de saúde narrativa (novo): indicadores visuais rápidos:
  - Quantas cenas têm carga estática (alerta McKee)
  - Quantas promessas narrativas estão abertas (setups sem payoff)
  - Cobertura do framework (quantos beats/estágios estão preenchidos vs. vazios)

Todos os cards são clicáveis → levam à aba correspondente para edição. Layout em grid responsivo.

#### 5.3.2 — Estrutura do Enredo

- Visualização do framework escolhido como timeline vertical
- Cada estágio/beat é um bloco editável com a pergunta-guia contextual
- As cenas associadas a cada estágio aparecem aninhadas dentro dele
- Subplots aparecem como linhas paralelas à trama principal (inspiração Plottr), com cor diferente
- Possibilidade de trocar de framework a qualquer momento (os dados dos atos anteriores são preservados como histórico)
- Curva de tensão automática (ver seção 5.3.7)
- Indicador de ritmo: visualização da duração/peso das cenas ao longo da timeline (cenas rápidas vs. longas, para ver se há "respiração" narrativa)

#### 5.3.3 — Mapa de Relações (Grafo de Personagens)

- Visualização em grafo onde cada personagem é um nó
- Tamanho do nó proporcional à importância (número de cenas em que aparece)
- O autor cria conexões entre personagens com:
  - Rótulo da relação (mentor, rival, amante, traiu, protege, etc.)
  - Tipo/natureza (positiva, negativa, ambígua) — representado por cor da aresta (verde, vermelho, amarelo)
  - Temporal: a relação pode mudar ao longo da história. O autor pode indicar "aliados no Ato I, rivais no Ato III"
  - Notas sobre a relação
- Interação: arrastar nós para reposicionar, clicar para editar, clicar na aresta para editar a relação
- Ao clicar em um personagem: painel lateral mostra todos os seus dados + relações + cenas em que participa + posição na timeline
- Sugestão de relações arquetípicas baseada em Vogler: se há um personagem marcado como "Herói" e outro como "Mentor", sugerir "Herói ↔ Mentor: Guia e proteção"
- Bibliotecas sugeridas: React Flow ou D3.js para o grafo interativo

#### 5.3.4 — Timeline de Personagens (Arcos Visuais)

- Para cada personagem, uma linha do tempo emocional / de poder
- Eixo horizontal: os estágios/beats do framework (ou as cenas em sequência)
- Eixo vertical: nível do personagem (ascensão ↔ queda, poder ↔ vulnerabilidade, felicidade ↔ sofrimento)
- O autor posiciona pontos na linha para cada cena onde o personagem aparece, arrastando o ponto verticalmente
- Múltiplas timelines sobrepostas para comparar arcos:
  - Ex: protagonista subindo enquanto antagonista desce
  - Ex: dois aliados cujas curvas divergem no Ato II
- Inspiração: a "curva emocional" de Kurt Vonnegut, mas editável e interativa
- Cada ponto na timeline é clicável e leva à cena correspondente
- Curvas de referência: a aplicação pode mostrar em background semi-transparente a curva "ideal" do gênero selecionado (ex: tragédia = subida e queda, jornada do herói = descida no meio e subida no fim) como guia visual

#### 5.3.5 — Board de Cenas (Storyboard)

- Espaço de trabalho livre (tipo Miro) onde cada cena é um card
- O autor pode:
  - Arrastar cards para reposicionar livremente (posição X, Y salva)
  - Criar conexões/setas entre cenas com rótulos (causalidade, flashback, paralelo, consequência)
  - Agrupar cenas visualmente (por ato, por subplot, por personagem) — grupos com borda colorida
  - Adicionar notas soltas (post-its) no board — ideias que ainda não são cenas
  - Zoom e pan pelo board (scroll + pinch em mobile)
- Cada card de cena mostra:
  - Título
  - Personagens envolvidos (ícones/iniciais)
  - Valor em jogo
  - Indicador de carga (seta ↑ ou ↓, ou cor verde/vermelho)
  - Peso/duração (tag visual: leve/médio/pesado)
- Código de cor por ato/estágio do framework
- Vista alternativa: lista sequencial (toggle) para quem prefere linearidade sobre espacialidade
- Bibliotecas sugeridas: React Flow (boards interativos com nós e arestas), ou Konva/Fabric.js para canvas 2D mais livre

#### 5.3.6 — Subplots (Tramas Secundárias)

Subplots são entidades de primeira classe na aplicação:

- Cada subplot tem:
  - Nome (ex: "Romance de Ana e Pedro", "Conspiração do General")
  - Tipo: relação amorosa, relação de amizade, trama política, investigação paralela, arco de personagem secundário, ou customizado
  - Personagens envolvidos
  - Conexão com o tema (Snyder: "A Trama B carrega o tema")
  - Arco próprio (início, desenvolvimento, resolução)
- As cenas podem ser associadas a um ou mais subplots
- Na timeline de estrutura, subplots aparecem como linhas paralelas à trama principal, com cor diferenciada
- O autor pode ver quando subplots convergem com a trama principal (nós de intersecção)
- Pergunta-guia (Snyder): "A Trama B ilumina o tema? O que o protagonista aprende nesta trama secundária que resolve a trama principal?"

#### 5.3.7 — Curva de Tensão Automática

Feature diferenciadora, derivada diretamente de McKee e Freytag:

- A aplicação gera automaticamente um gráfico de tensão baseado na carga (+/-) que o autor atribui a cada cena
- Eixo X: cenas em ordem sequencial (ou beats do framework)
- Eixo Y: tensão/positividade acumulada
- O gráfico mostra:
  - A curva da trama principal
  - As curvas dos subplots (sobrepostas, com cores diferentes)
  - Zonas de perigo: platôs onde várias cenas seguidas não mudam de carga (ritmo monótono)
  - Pico: onde está o clímax (o autor pode validar se o ponto mais alto coincide com onde ele imagina o clímax)
- A curva é interativa: clicar em qualquer ponto abre a cena correspondente
- Curva de referência do gênero (fundo semi-transparente): a forma "ideal" baseada no gênero (pirâmide para tragédia, U para comédia, W para thriller)

#### 5.3.8 — Sistema de Promessas Narrativas (Setup/Payoff Tracker)

Feature diferenciadora, inspirada no conceito de Chekhov's Gun:

- O autor pode criar promessas narrativas a qualquer momento:
  - Nome da promessa (ex: "A arma na gaveta", "O segredo de Maria", "A profecia")
  - Tipo: objeto, informação, relação, habilidade, profecia, outro
  - Setup: em qual cena a promessa é plantada
  - Payoff: em qual cena (se houver) a promessa é resolvida
  - Status: aberta (plantada mas não resolvida), resolvida, ou abandonada (o autor decidiu não usar)
  - Notas
- Painel de promessas: visualização tipo checklist mostrando:
  - Promessas abertas (atenção: quanto mais perto do final sem resolução, mais urgente)
  - Promessas resolvidas (com distância entre setup e payoff)
  - Promessas abandonadas (o autor pode revisar se alguma vale a pena resgatar)
- As promessas aparecem como badges nos cards de cena no storyboard e na timeline
- Alerta: se a história está no terceiro ato e há muitas promessas abertas, a interface sinaliza

#### 5.3.9 — Controle de Informação e Revelação

Feature para mistério, suspense e qualquer história com segredos:

- Para cada segredo/informação importante da história:
  - Descrição da informação
  - Quem sabe (quais personagens têm essa informação e a partir de qual cena)
  - Quando o leitor descobre (em qual cena a informação é revelada ao leitor)
  - Dramatic Irony: se o leitor sabe antes do personagem (ou vice-versa), sinalizar
- Visualização: matriz personagens × informações mostrando quem sabe o quê em cada ponto da história
- Útil para: evitar furos de informação (personagem age baseado em algo que ele não deveria saber), planejar revelações, construir suspense

#### 5.3.10 — Modo "E se?" (Bifurcações)

Feature para experimentação narrativa:

- A qualquer momento, o autor pode criar uma bifurcação da história
- A bifurcação é uma cópia completa que pode ser editada independentemente
- O autor pode comparar duas versões lado a lado: "Na versão A o personagem morre; na versão B ele sobrevive"
- Cada bifurcação mostra:
  - Ponto de divergência (qual cena ou decisão mudou)
  - Diferenças visuais na curva de tensão
  - Diferenças nos arcos de personagens
- O autor pode escolher "absorver" uma bifurcação de volta à história principal, ou descartá-la
- Na home: bifurcações aparecem vinculadas à história original, como "branches" de um repositório Git

#### 5.3.11 — Worldbuilding (Leve)

Espaço para "regras do mundo" sem a profundidade de Campfire, mas suficiente para manter consistência:

- Notas de mundo organizadas em categorias livres (ex: "Sistema de Magia", "Política", "Tecnologia", "Geografia", "Cultura")
- Cada nota pode ser vinculada a personagens, cenas ou promessas narrativas
- Sem módulos específicos para espécies/línguas/religiões — isso fica como notas livres
- O objetivo é ter um lugar centralizado para registrar regras que afetam a trama, não um wiki completo

### 5.4 — Gestão de Histórias

- **Autenticação:** Login com Google via Supabase Auth
- **Salvamento automático:** a cada alteração, sincroniza com Supabase (com debounce para não sobrecarregar)
- **Indicador de sincronização:** ícone mostrando se está sincronizado, sincronizando, ou offline
- **Modo offline:** a aplicação funciona offline usando cache local (IndexedDB). Quando a conexão volta, sincroniza com Supabase (last-write-wins para conflitos simples)
- **Exportar como JSON:** backup completo da história (independente do Supabase)
- **Importar JSON:** restaurar uma história a partir do backup
- **Múltiplas histórias:** a tela inicial lista todas as histórias do usuário
- **Duplicar história:** criar cópia para experimentar (ou criar bifurcação "E se?")
- **Excluir história:** com confirmação e período de recuperação (soft delete, 30 dias)

### 5.5 — Exportação PDF

Gera um documento PDF formatado com toda a arquitetura da história. É um documento de referência para consultar enquanto o autor escreve no Google Docs.

**Seções do PDF:**

1. **Capa:** Título + logline + gênero(s) + data de geração
2. **Essência:** Premissa dramática, incidente incitante, tema central, pergunta temática, valor em jogo, tese
3. **Estrutura do Enredo:** Framework utilizado + descrição de cada ato/beat + imagem da curva de tensão
4. **Personagens:** Ficha completa de cada personagem (nome, papel, arquétipo(s), desejo, necessidade, medo, falha, Save the Cat moment, arco)
5. **Mapa de Relações:** Representação textual das relações entre personagens (lista formatada: "Ana → Pedro: mentor no Ato I, rival no Ato III")
6. **Subplots:** Descrição de cada trama secundária com personagens e conexão temática
7. **Cenas-Chave:** Lista ordenada de cenas com: título, personagens, valor em jogo, carga início/fim, conflito, gap, mudança
8. **Promessas Narrativas:** Lista de setups e payoffs com status (aberta/resolvida/abandonada)
9. **Informações e Revelações:** Matriz de quem sabe o quê (se preenchida)
10. **Worldbuilding:** Notas de mundo organizadas por categoria
11. **Notas Gerais:** Quaisquer notas soltas do board

O PDF deve ser funcional e legível, não precisa ser visualmente idêntico ao canvas.

## 6. Referências Visuais e de Experiência

### Tom Visual

- Escuro por padrão (dark mode), com opção de tema claro
- Tipografia editorial/literária: serif para títulos e display, sans-serif para campos e interface
- Paleta: tons quentes e escuros (fundo #111-#1a1a, acentos dourados/âmbar para destaques, cores do gênero para categorização)
- Referências: Notion (clareza dos blocos editáveis), Miro (board infinito para storyboard), Linear (design limpo para gestão de dados)

### Princípios de Interação

- Edição inline sempre: nunca abrir modals para editar. Clicar no texto → vira campo editável
- Drag-and-drop para reposicionar cenas no storyboard e pontos na timeline
- Transições suaves entre visões (tabs com fade, não reload)
- Salvamento contínuo sem botão de "salvar" — o autor nunca precisa pensar nisso
- Responsive: em mobile, o storyboard vira lista, o grafo vira lista de relações, a timeline vira scroll vertical

## 7. Modelo de Dados (Supabase)

Estrutura sugerida para o banco de dados PostgreSQL:

### Tabelas principais

- **users** — id, google_id, email, name, created_at
- **stories** — id, user_id, title, logline, premise, inciting_incident, genre (array), framework, theme_central, theme_question, theme_message, theme_value, theme_declaration, parent_story_id (para bifurcações), fork_point, status (active/archived/deleted), created_at, updated_at
- **story_acts** — id, story_id, framework, act_index, act_name, description, created_at, updated_at
- **characters** — id, story_id, name, role, archetypes (JSONB: [{archetype, phase}]), desire, need, fear, flaw, save_the_cat, arc, backstory, notes, created_at, updated_at
- **character_relations** — id, story_id, character_a_id, character_b_id, label, nature (positive/negative/ambiguous), temporal_changes (JSONB), notes
- **scenes** — id, story_id, title, act_index, subplot_id, characters (array de IDs), value_at_stake, charge_start (+/-), charge_end (+/-), conflict, change, gap_expected, gap_actual, weight (light/medium/heavy), position_x, position_y (para storyboard), sort_order, notes, created_at, updated_at
- **scene_connections** — id, story_id, scene_from_id, scene_to_id, label (causalidade, flashback, paralelo, consequência)
- **subplots** — id, story_id, name, type, characters (array), theme_connection, arc_start, arc_development, arc_resolution, notes
- **promises** — id, story_id, name, type (object/information/relation/skill/prophecy/other), setup_scene_id, payoff_scene_id, status (open/resolved/abandoned), notes
- **information_reveals** — id, story_id, description, scenes_known_by (JSONB: [{character_id, from_scene_id}]), reader_reveal_scene_id, dramatic_irony (boolean), notes
- **world_notes** — id, story_id, category, title, content, linked_characters (array), linked_scenes (array), linked_promises (array)
- **board_notes** — id, story_id, content, position_x, position_y, color
- **character_arc_points** — id, story_id, character_id, scene_id, level (float -1 a 1), notes

### Row Level Security (RLS)

- Todas as tabelas devem ter RLS habilitado
- Política: cada usuário só vê e edita suas próprias histórias
- FK cascade: deletar uma história deleta todos os dados relacionados

## 8. Priorização Sugerida para Desenvolvimento

### MVP (Fase 1) — O cockpit funcional

1. Autenticação (Supabase Auth + Google OAuth)
2. Home com gestão de histórias (criar, listar, duplicar, excluir)
3. Wizard completo (6 passos com perguntas-guia dos mestres)
4. Canvas — Visão Geral (dashboard de cards editáveis com card de saúde narrativa)
5. Canvas — Estrutura do Enredo (timeline com framework + perguntas contextuais)
6. Personagens com arquétipos, desejo/necessidade/medo/falha
7. Cenas com valores McKee (valor em jogo, carga +/-, gap)
8. Persistência Supabase + salvamento automático
9. Export/Import JSON

### Fase 2 — Visualizações profundas

1. Canvas — Board de Cenas (storyboard livre com drag-and-drop e conexões)
2. Canvas — Mapa de Relações (grafo de personagens interativo)
3. Subplots como entidades de primeira classe
4. Curva de tensão automática
5. Exportação PDF

### Fase 3 — Features diferenciadoras

1. Canvas — Timeline de Personagens (arcos visuais sobrepostos, curvas de Vonnegut)
2. Sistema de Promessas Narrativas (Setup/Payoff tracker)
3. Controle de Informação e Revelação
4. Modo "E se?" (bifurcações)
5. Worldbuilding leve (notas de mundo)
6. Indicador de ritmo/pacing visual
7. Modo offline + sincronização
8. Responsividade mobile refinada
9. Dark/Light mode toggle

## 9. Notas para o Desenvolvedor

### Arquitetura

- **Frameworks narrativos como dados, não como código:** Todos os frameworks (Campbell, Snyder, Freytag, etc.), seus estágios, e suas perguntas-guia devem viver em arquivos de dados (JSON/TS). Isso permite adicionar novos frameworks sem mudar componentes.
- **As perguntas-guia são conteúdo editorial de alto valor.** Cada pergunta foi escrita com intenção baseada nos autores de referência. Não substituir por placeholders genéricos.

### Componentes complexos

- **Grafo de relações e board de cenas:** são os componentes mais complexos. Bibliotecas sugeridas: React Flow (grafos e boards interativos com nós e arestas), D3.js (visualizações customizadas), Konva/Fabric.js (canvas 2D para board mais livre). Avaliar qual se encaixa melhor no stack escolhido.
- **Curva de tensão:** pode ser implementada com Recharts ou D3.js. O cálculo é simples: acumular as mudanças de carga (+1/-1) por cena em sequência.
- **Timeline de personagens:** similar à curva de tensão, mas com pontos editáveis por drag vertical. Recharts com pontos draggable ou D3.js custom.

### Persistência

- **Supabase client:** usar @supabase/supabase-js. Configurar Supabase URL e anon key como variáveis de ambiente.
- **Salvamento:** debounce de 1-2 segundos após cada alteração, salvar via upsert.
- **Offline:** IndexedDB como cache local (via Dexie.js ou similar). Queue de operações offline que sincroniza quando a conexão volta.

### Exportação PDF

- Bibliotecas sugeridas: jsPDF + html2canvas (para capturar visualizações), ou React-PDF para gerar PDFs estruturados.
- Priorizar legibilidade sobre fidelidade visual.
- A curva de tensão e o grafo de relações podem ser exportados como imagens embutidas no PDF.

### Mobile

- Desktop-first, mas o CSS deve usar breakpoints para adaptar:
  - Board de cenas → lista ordenável
  - Grafo de relações → lista de relações
  - Timeline → scroll vertical
  - Dashboard → cards empilhados

## 10. Glossário

| Termo | Origem | Significado na aplicação |
|---|---|---|
| Beat | Snyder / McKee | Menor unidade de mudança narrativa. No Save the Cat, são os 15 pontos estruturais. |
| Gap | McKee | Distância entre expectativa e resultado em uma cena. |
| Spine | McKee | O desejo consciente do protagonista que unifica a narrativa. |
| Hamartia | Aristóteles | A falha fatal do herói que causa sua queda na tragédia. |
| Monomito | Campbell | A estrutura universal da Jornada do Herói. |
| Setup/Payoff | Chekhov | Algo plantado no início que deve ser resolvido depois. "Se há uma arma no primeiro ato, ela deve disparar no terceiro." |
| Valor em jogo | McKee | O eixo moral de uma cena (amor/ódio, verdade/mentira, etc.) |
| Whiff of death | Snyder | Algo precisa "morrer" (literal ou simbolicamente) no momento "All Is Lost". |
| Dramatic Irony | Tradição dramatúrgica | Quando o leitor sabe algo que o personagem não sabe. |
| Subplot / Trama B | Snyder | História secundária que carrega o tema e ilumina a resolução da trama principal. |

---

*Story Canvas — Especificação Funcional v2.0*
*Documento para desenvolvimento via Claude Code*
*Março 2026*
