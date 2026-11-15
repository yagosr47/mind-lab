/**
 * Cenários do motor `tactical-tree`.
 *
 * Cada cenário tem 3 turnos (o de álibi tem 4) e três escolhas por turno.
 * `suspicion` e `advantage` são deltas aplicados aos medidores do HUD; a
 * dificuldade redefine pontos de partida, metas e o quanto o impacto é exposto.
 */

export interface ScenarioChoice {
  label: string
  outcome: string
  suspicion: number
  advantage: number
}

export interface ScenarioRound {
  prompt: string
  choices: ScenarioChoice[]
}

export interface Scenario {
  id: string
  title: string
  opponent: string
  brief: string
  rounds: ScenarioRound[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'termometro-vulnerabilidade',
    title: 'Termômetro de vulnerabilidade',
    opponent: 'Rafael, 41 — gerente rebaixado há três semanas',
    brief:
      'Ele aceitou conversar, mas trata o rebaixamento como piada. Três perguntas para localizar o gatilho dominante: ego, culpa, apego ou utilidade.',
    rounds: [
      {
        prompt: 'Ele abre com uma piada sobre "voltar ao chão de fábrica".',
        choices: [
          {
            label: 'Perguntar do que ele sente mais falta',
            outcome: 'Ele desvia para processos e nunca cita pessoas. O gatilho é utilidade, não status.',
            suspicion: 6,
            advantage: 14,
          },
          {
            label: 'Elogiar a trajetória dele',
            outcome: 'Ele se infla e fala por dois minutos. O ego responde, mas protege o resto.',
            suspicion: 14,
            advantage: 16,
          },
          {
            label: 'Ficar em silêncio e esperar',
            outcome: 'Ele preenche o vazio reclamando do novo chefe. Ainda é superfície.',
            suspicion: 2,
            advantage: 8,
          },
        ],
      },
      {
        prompt: 'Ele menciona "gente que subiu sem mérito".',
        choices: [
          {
            label: 'Concordar e citar um nome específico',
            outcome: 'Ele corrige o nome e defende o colega. A lealdade é o eixo real.',
            suspicion: 10,
            advantage: 18,
          },
          {
            label: 'Perguntar quem ele treinou na equipe',
            outcome: 'Ele lista três nomes e sorri pela primeira vez sem ironia. Apego confirmado.',
            suspicion: 4,
            advantage: 16,
          },
          {
            label: 'Perguntar se ele se sente injustiçado',
            outcome: 'Ele responde "todo mundo se sente" e fecha o assunto. Pergunta direta gera defesa.',
            suspicion: 16,
            advantage: 6,
          },
        ],
      },
      {
        prompt: 'Fecho. Ele pergunta se ainda dá para "voltar".',
        choices: [
          {
            label: 'Dizer que depende de quem ele quer proteger',
            outcome: 'Ele cita os dois analistas que treinou. O gatilho dominante é apego, não ego.',
            suspicion: 5,
            advantage: 20,
          },
          {
            label: 'Prometer que dá, sem detalhes',
            outcome: 'Ele aceita na hora e relaxa demais. Promessa vazia compra simpatia e perde leitura.',
            suspicion: 8,
            advantage: 9,
          },
          {
            label: 'Devolver a pergunta e registrar a resposta',
            outcome: 'Ele hesita por quatro segundos e fala do salário. A superfície volta a vencer.',
            suspicion: 3,
            advantage: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'mapeamento-alavancas',
    title: 'Mapeamento de alavancas',
    opponent: 'Helena, diretora de compras — fama de intratável',
    brief:
      'Você precisa de um contrato fora do prazo. Helena não responde a elogio nem a pressão. Três sondagens para descobrir o que a move.',
    rounds: [
      {
        prompt: 'Ela recebe você em pé, com o relógio na mão.',
        choices: [
          {
            label: 'Reconhecer o tempo dela e ir direto ao risco',
            outcome: 'Ela senta e pede o número. Respeito a tempo vale mais que simpatia.',
            suspicion: 4,
            advantage: 14,
          },
          {
            label: 'Elogiar o histórico de negociações dela',
            outcome: 'Ela corta o elogio com um "vamos ao assunto". Ego não é a alavanca.',
            suspicion: 12,
            advantage: 8,
          },
          {
            label: 'Citar o nome do seu patrocinador',
            outcome: 'Ela pergunta quem autorizou. O nome compra dois minutos e cobra o troco depois.',
            suspicion: 15,
            advantage: 12,
          },
        ],
      },
      {
        prompt: 'Ela pergunta o que você ganha se o contrato passar.',
        choices: [
          {
            label: 'Responder com o número exato e o que perde se falhar',
            outcome: 'Ela anota os dois valores. Transparência sobre interesse próprio gera confiança técnica.',
            suspicion: 3,
            advantage: 18,
          },
          {
            label: 'Dizer que o importante é o resultado da empresa',
            outcome: 'Ela ri e devolve a pergunta. Discurso altruísta desliga a escuta.',
            suspicion: 10,
            advantage: 6,
          },
          {
            label: 'Desviar para a qualidade do fornecedor',
            outcome: 'Ela aceita o desvio e volta ao preço no turno seguinte. Tempo perdido.',
            suspicion: 6,
            advantage: 9,
          },
        ],
      },
      {
        prompt: 'Ela encosta a caneta na mesa: "me dá um motivo".',
        choices: [
          {
            label: 'Mostrar que a falha do fornecedor atual atinge o nome dela',
            outcome: 'Ela liga para o jurídico na sua frente. A alavanca é preservar reputação.',
            suspicion: 7,
            advantage: 19,
          },
          {
            label: 'Oferecer desconto imediato',
            outcome: 'Ela aceita desconto e pede mais. Preço vira a única conversa possível.',
            suspicion: 9,
            advantage: 10,
          },
          {
            label: 'Pedir que ela assine mesmo sem aprovar',
            outcome: 'Ela encerra a reunião. Pressão sobre assinatura queima a relação inteira.',
            suspicion: 22,
            advantage: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'filtro-provocacao',
    title: 'Filtro de provocação',
    opponent: 'Cliente furioso em reunião com seis testemunhas',
    brief:
      'Ele quer que você perca a compostura. Cada isca de ego aceita é um ponto de influência entregue de graça.',
    rounds: [
      {
        prompt: '"Quem tomou essa decisão claramente não entende do assunto."',
        choices: [
          {
            label: 'Perguntar qual parte da decisão não fecha',
            outcome: 'Ele aponta o prazo. Você separa a pessoa do problema e ganha o dado real.',
            suspicion: 4,
            advantage: 16,
          },
          {
            label: 'Lembrar que a decisão foi sua',
            outcome: 'Ele escala a acusação para o seu time. Defesa de ego abre frente nova.',
            suspicion: 18,
            advantage: 7,
          },
          {
            label: 'Concordar que a decisão foi ruim',
            outcome: 'Ele exige que você desfaça na hora. Concessão rápida vira obrigação.',
            suspicion: 10,
            advantage: 11,
          },
        ],
      },
      {
        prompt: '"Você claramente nunca operou na linha de frente."',
        choices: [
          {
            label: 'Pedir o exemplo específico e escrever no quadro',
            outcome: 'O exemplo tem dois detalhes e uma exceção. A plateia vê o tamanho da crítica.',
            suspicion: 6,
            advantage: 17,
          },
          {
            label: 'Descrever seu currículo em voz alta',
            outcome: 'Ele sorri para a plateia. Currículo como resposta prova o ataque.',
            suspicion: 20,
            advantage: 5,
          },
          {
            label: 'Ignorar e seguir a pauta',
            outcome: 'Ele repete a frase mais alto. Ignorar aumenta o volume, não encerra a isca.',
            suspicion: 12,
            advantage: 9,
          },
        ],
      },
      {
        prompt: 'Ele ameaça levar o caso ao conselho.',
        choices: [
          {
            label: 'Oferecer o resumo do caso para ele levar',
            outcome: 'Ele desacelera e pede ajustes no texto. A ameaça virou trabalho conjunto.',
            suspicion: 5,
            advantage: 19,
          },
          {
            label: 'Dizer que o conselho não vai aceitar a reclamação',
            outcome: 'Ele marca a reunião e convida quem discorda. Você criou o palco.',
            suspicion: 22,
            advantage: 6,
          },
          {
            label: 'Propor um intervalo de dez minutos',
            outcome: 'A sala esfria e ele perde a plateia. Custo: todos percebem o desvio.',
            suspicion: 8,
            advantage: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'arquitetura-escolha',
    title: 'Arquitetura de escolha',
    opponent: 'Sócio que precisa escolher o seu plano achando que escolheu sozinho',
    brief:
      'Ele rejeita qualquer proposta que pareça sua. O objetivo é fazer a opção desejada ser a conclusão dele.',
    rounds: [
      {
        prompt: 'Ele abre dizendo que "já sabe o que não quer".',
        choices: [
          {
            label: 'Pedir que ele liste o que não aceita',
            outcome: 'Ele entrega três critérios que só o seu plano cumpre. A régua é dele.',
            suspicion: 3,
            advantage: 16,
          },
          {
            label: 'Apresentar o plano completo',
            outcome: 'Ele ouve em silêncio e pergunta o preço. Plano cedo demais vira proposta a derrubar.',
            suspicion: 12,
            advantage: 10,
          },
          {
            label: 'Sugerir o plano do concorrente primeiro',
            outcome: 'Ele encontra falhas no concorrente com precisão. A comparação ficou armada.',
            suspicion: 8,
            advantage: 14,
          },
        ],
      },
      {
        prompt: 'Ele diz: "preciso de algo que não me amarre".',
        choices: [
          {
            label: 'Oferecer duas variantes da sua opção, ambas com saída em 90 dias',
            outcome: 'Ele escolhe a mais enxuta e explica por que ela é mais livre. A ideia é dele agora.',
            suspicion: 4,
            advantage: 20,
          },
          {
            label: 'Garantir que nada será assinado',
            outcome: 'Ele desconfia do excesso de flexibilidade e pede advogado. Concessão grande gera suspeita.',
            suspicion: 14,
            advantage: 8,
          },
          {
            label: 'Explicar tecnicamente por que não há amarra',
            outcome: 'Ele ouve a explicação e depois pede por escrito. A autoria continua sua.',
            suspicion: 9,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'Ele resuma o que entendeu, olhando para você.',
        choices: [
          {
            label: 'Confirmar a versão dele sem corrigir nada',
            outcome: 'Ele fecha no próprio resumo, com uma cláusula melhor que a sua. Vitória com ajuste.',
            suspicion: 2,
            advantage: 21,
          },
          {
            label: 'Corrigir dois pontos',
            outcome: 'Ele aceita corrigir e volta a tratar o plano como seu. Autoria perdida no detalhe.',
            suspicion: 7,
            advantage: 13,
          },
          {
            label: 'Dizer que pode ser ainda melhor',
            outcome: 'Ele pede a versão melhor e adia a decisão. A oferta de melhoria compra tempo.',
            suspicion: 6,
            advantage: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'negociacao-assimetrica',
    title: 'Negociação assimétrica',
    opponent: 'Parceiro desconfiado com o dobro de informação sobre o contrato',
    brief:
      'Ele sabe mais e sabe que você sabe menos. Três lances para arrancar concessões sem entregar a sua margem.',
    rounds: [
      {
        prompt: 'Ele começa com "essa cláusula é padrão".',
        choices: [
          {
            label: 'Pedir a versão anterior da cláusula',
            outcome: 'Ele hesita e envia a versão original. A cláusula perdeu o status de padrão.',
            suspicion: 5,
            advantage: 17,
          },
          {
            label: 'Aceitar e pedir uma concessão em troca',
            outcome: 'Ele concede um desconto pequeno e trava a cláusula. Troca desequilibrada.',
            suspicion: 8,
            advantage: 10,
          },
          {
            label: 'Dizer que precisa de auditoria jurídica',
            outcome: 'Ele aceita e marca nova reunião. Tempo ganho, pressão perdida.',
            suspicion: 11,
            advantage: 12,
          },
        ],
      },
      {
        prompt: 'Ele oferece prazo de 30 dias se você aceitar multa alta.',
        choices: [
          {
            label: 'Trocar a multa por um escalonamento por volume',
            outcome: 'Ele reluta e aceita no meio de uma frase. A multa era mais desconfortável para ele.',
            suspicion: 7,
            advantage: 19,
          },
          {
            label: 'Aceitar a multa pelo prazo',
            outcome: 'Ele registra a multa e mantém o prazo apertado. Ganhou o risco que queria.',
            suspicion: 5,
            advantage: 8,
          },
          {
            label: 'Pedir 15 dias sem multa',
            outcome: 'Ele concede os 15 dias e cobra em outro item no turno seguinte.',
            suspicion: 9,
            advantage: 13,
          },
        ],
      },
      {
        prompt: 'Ele se levanta: "acho que não vamos fechar".',
        choices: [
          {
            label: 'Resumir as três concessões que ele já fez e perguntar qual falta',
            outcome: 'Ele senta e nomeia uma quarta. O resumo mostrou o custo de desistir.',
            suspicion: 6,
            advantage: 20,
          },
          {
            label: 'Oferecer o último ponto antes da saída',
            outcome: 'Ele aceita na porta e sabe que pode pressionar assim de novo. Precedente caro.',
            suspicion: 13,
            advantage: 12,
          },
          {
            label: 'Deixar ele sair',
            outcome: 'Ele sai e liga em duas horas pedindo o mesmo acordo. O tempo ganhou a negociação.',
            suspicion: 3,
            advantage: 15,
          },
        ],
      },
    ],
  },
  {
    id: 'recursos-escassos',
    title: 'Recursos escassos',
    opponent: 'Cerco em galpão com saída bloqueada',
    brief:
      'Você tem três itens improvisados: um extintor, um cabo de rede de 12 metros e o crachá de um estagiário. O cerco aperta a cada turno.',
    rounds: [
      {
        prompt: 'Passos no corredor leste. A porta oeste está trancada por dentro.',
        choices: [
          {
            label: 'Bater no extintor para atrair os passos',
            outcome: 'Dois deles vão para o leste. O corredor oeste fica aberto por 40 segundos.',
            suspicion: 12,
            advantage: 16,
          },
          {
            label: 'Usar o crachá do estagiário no leitor da doca',
            outcome: 'O leitor aceita e registra o estagiário no log. Saída aberta, rastro criado.',
            suspicion: 18,
            advantage: 17,
          },
          {
            label: 'Se esconder atrás das caixas e esperar',
            outcome: 'Eles passam direto, mas fecham a doca no caminho. Janela menor.',
            suspicion: 4,
            advantage: 9,
          },
        ],
      },
      {
        prompt: 'O leitor da doca pisca em vermelho. Vocês têm dois minutos.',
        choices: [
          {
            label: 'Curto-circuitar o leitor com o cabo de rede',
            outcome: 'A trava solta e o alarme de porta não dispara. O cabo ficou inutilizável.',
            suspicion: 10,
            advantage: 19,
          },
          {
            label: 'Forçar a porta com o extintor',
            outcome: 'A porta cede e o barulho ecoa. Eles sabem exatamente onde você está.',
            suspicion: 22,
            advantage: 14,
          },
          {
            label: 'Esperar o próximo turno de ronda',
            outcome: 'A doca reabre, mas o cerco fecha o corredor leste. Restou uma rota.',
            suspicion: 7,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'Última saída: o pátio, com câmera ativa e um portão de 2 metros.',
        choices: [
          {
            label: 'Apontar o extintor para a câmera e subir pelo portão',
            outcome: 'A câmera registra apenas fumaça. Você sai com o crachá do estagiário em cima.',
            suspicion: 16,
            advantage: 20,
          },
          {
            label: 'Usar o crachá para abrir o portão e sair andando',
            outcome: 'O portão abre devagar e o estagiário é chamado no dia seguinte. Saída limpa, custo alto.',
            suspicion: 13,
            advantage: 16,
          },
          {
            label: 'Correr pelo portão sem disfarce',
            outcome: 'Você sai e a câmera entrega o rosto em alta resolução. Improviso sem cobertura.',
            suspicion: 26,
            advantage: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'sustentacao-alibi',
    title: 'Sustentação de álibi',
    opponent: 'Investigador com o log do prédio impresso na mão',
    brief:
      'Sua história: você estava no 2º andar entre 22h e 23h. Quatro perguntas. Qualquer incoerência derruba a versão inteira.',
    rounds: [
      {
        prompt: 'Ele pergunta o que você foi fazer no 2º andar.',
        choices: [
          {
            label: 'Buscar um documento na sala de arquivo',
            outcome: 'Ele pergunta qual documento. A resposta fecha com o crachá e com a sala.',
            suspicion: 6,
            advantage: 17,
          },
          {
            label: 'Visitar um colega',
            outcome: 'Ele anota o nome do colega. Uma segunda versão terá de sustentar a sua.',
            suspicion: 14,
            advantage: 11,
          },
          {
            label: 'Dizer que não lembra exatamente',
            outcome: 'Ele marca a lacuna em vermelho. Esquecer o motivo enfraquece o resto.',
            suspicion: 20,
            advantage: 5,
          },
        ],
      },
      {
        prompt: 'Ele mostra que o elevador parou no 5º andar às 22h20.',
        choices: [
          {
            label: 'Explicar que desceu um andar pela escada para buscar café',
            outcome: 'Ele confronta com o registro da copa. A rota tem cobertura parcial, mas sobrevive.',
            suspicion: 12,
            advantage: 16,
          },
          {
            label: 'Dizer que o elevador estava com defeito',
            outcome: 'Ele puxa a manutenção do dia. A versão abre uma frente nova e perde força.',
            suspicion: 22,
            advantage: 7,
          },
          {
            label: 'Corrigir o horário que você mesmo tinha dado',
            outcome: 'Ele registra a correção. Ajuste declarado antes da acusação parece memória, não invenção.',
            suspicion: 8,
            advantage: 15,
          },
        ],
      },
      {
        prompt: 'Ele pergunta quem pode confirmar sua presença.',
        choices: [
          {
            label: 'O segurança da recepção, que viu seu crachá',
            outcome: 'Ele liga na frente e o segurança confirma o horário. Uma testemunha, um fato.',
            suspicion: 5,
            advantage: 19,
          },
          {
            label: 'O colega que você visitou',
            outcome: 'Ele pergunta se o colega sabe que é testemunha. A dependência ficou exposta.',
            suspicion: 16,
            advantage: 12,
          },
          {
            label: 'Ninguém, você estava sozinho',
            outcome: 'Ele anota "sem testemunha" e muda de tom. A solidão é o ponto fraco da versão.',
            suspicion: 24,
            advantage: 8,
          },
        ],
      },
      {
        prompt: 'Última pergunta: "por que o senhor não mencionou isso antes?"',
        choices: [
          {
            label: 'Porque ninguém perguntou sobre o 2º andar',
            outcome: 'Ele confere o primeiro depoimento e encontra a pergunta. A versão fecha.',
            suspicion: 9,
            advantage: 18,
          },
          {
            label: 'Porque não achei importante',
            outcome: 'Ele pergunta o que você consideraria importante. A frase entrega o critério.',
            suspicion: 18,
            advantage: 10,
          },
          {
            label: 'Porque estava nervoso com a situação',
            outcome: 'Ele anota o nervosismo como comportamento, não como explicação. Custo alto.',
            suspicion: 21,
            advantage: 9,
          },
        ],
      },
    ],
  },
  {
    id: 'blefe-calculado',
    title: 'Blefe calculado',
    opponent: 'Comprador com vantagem de informação e prazo melhor',
    brief:
      'Você não tem o laudo que ele quer ver. Ele não sabe disso. Convença-o de que a carta existe sem precisar mostrá-la.',
    rounds: [
      {
        prompt: 'Ele exige prova de que o fornecedor alternativo já aceitou.',
        choices: [
          {
            label: 'Dizer que o laudo está com o jurídico e que você não assina sem ele',
            outcome: 'Ele pede prazo. A recusa virou garantia de rigor, não de ausência.',
            suspicion: 8,
            advantage: 18,
          },
          {
            label: 'Mostrar o e-mail antigo do fornecedor',
            outcome: 'Ele lê a data e vê que é de outro projeto. Blefe com prova fraca queima o resto.',
            suspicion: 24,
            advantage: 6,
          },
          {
            label: 'Mudar de assunto para o preço',
            outcome: 'Ele aceita a mudança e volta ao laudo no turno seguinte. Você concedeu tempo.',
            suspicion: 10,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'Ele propõe fechar hoje se o laudo for enviado amanhã.',
        choices: [
          {
            label: 'Aceitar com cláusula de retroatividade',
            outcome: 'Ele aceita a cláusula e assina. O laudo virou condição contratual, não prova.',
            suspicion: 6,
            advantage: 20,
          },
          {
            label: 'Dizer que o laudo sai hoje, sem definir hora',
            outcome: 'Ele espera até 18h e cobra às 18h05. Promessa específica cria relógio.',
            suspicion: 17,
            advantage: 10,
          },
          {
            label: 'Exigir o adiantamento antes do laudo',
            outcome: 'Ele paga 20% e segura o restante. Você ganhou caixa e perdeu cobertura.',
            suspicion: 12,
            advantage: 14,
          },
        ],
      },
      {
        prompt: 'Ele pergunta diretamente: "o laudo existe?"',
        choices: [
          {
            label: 'Responder que existe e que ele não é seu destinatário',
            outcome: 'Ele ri e muda o tom. A recusa de mostrar virou hierarquia de acesso.',
            suspicion: 9,
            advantage: 19,
          },
          {
            label: 'Responder que sim, sem pausa',
            outcome: 'A pausa veio antes da resposta. Ele percebeu e pede o número do processo.',
            suspicion: 20,
            advantage: 8,
          },
          {
            label: 'Pedir que ele defina o que aceitaria como prova',
            outcome: 'Ele define um critério que você consegue cumprir em 48h. Blefe virou prazo real.',
            suspicion: 5,
            advantage: 17,
          },
        ],
      },
    ],
  },
  {
    id: 'engenharia-contingencia',
    title: 'Engenharia de contingência',
    opponent: 'Comitê que autoriza apenas a Fase 1',
    brief:
      'Três fases. O comitê libera a primeira e quer resultados antes de falar da segunda. O fracasso da Fase 1 precisa financiar a Fase 2.',
    rounds: [
      {
        prompt: 'O comitê pergunta o que acontece se a Fase 1 falhar.',
        choices: [
          {
            label: 'Apresentar a falha como gatilho de auditoria e redução de escopo',
            outcome: 'O comitê aceita porque a falha gera informação útil. Risco virou entrega.',
            suspicion: 4,
            advantage: 18,
          },
          {
            label: 'Garantir que a Fase 1 não pode falhar',
            outcome: 'Eles pedem garantia por escrito. Promessa absoluta transfere todo o risco para você.',
            suspicion: 16,
            advantage: 8,
          },
          {
            label: 'Pedir autorização das três fases de uma vez',
            outcome: 'Eles adiam a decisão para o mês seguinte. Escopo maior, velocidade zero.',
            suspicion: 11,
            advantage: 10,
          },
        ],
      },
      {
        prompt: 'Metade do orçamento da Fase 1 foi cortada.',
        choices: [
          {
            label: 'Reduzir a amostra e transformar o corte em teste controlado',
            outcome: 'A amostra menor ainda produz o dado que a Fase 2 precisa. Corte absorvido.',
            suspicion: 6,
            advantage: 19,
          },
          {
            label: 'Cobrir o corte com fornecedor mais barato',
            outcome: 'O fornecedor atrasa e a Fase 1 vira gargalo. Economia comprada a prazo.',
            suspicion: 14,
            advantage: 9,
          },
          {
            label: 'Pedir suplemento ao comitê',
            outcome: 'Eles negam e registram o pedido. A próxima solicitação custa o dobro.',
            suspicion: 12,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'A Fase 1 entrega 60% do previsto. O comitê cobra a Fase 2.',
        choices: [
          {
            label: 'Usar os 60% como linha de base e vender a Fase 2 como correção',
            outcome: 'A Fase 2 é aprovada como ajuste, não como expansão. O fracasso pagou a próxima fase.',
            suspicion: 5,
            advantage: 20,
          },
          {
            label: 'Defender que os 60% valem como sucesso',
            outcome: 'Eles aceitam o número e cortam a Fase 2 pela metade. Vitória de relatório.',
            suspicion: 9,
            advantage: 12,
          },
          {
            label: 'Reiniciar a Fase 1 antes de seguir',
            outcome: 'Você ganha rigor e perde a janela. O comitê congela o programa.',
            suspicion: 7,
            advantage: 8,
          },
        ],
      },
    ],
  },
  {
    id: 'lideranca-procuracao',
    title: 'Liderança por procuração',
    opponent: 'Impasse entre três facções em uma sala sem cadeira de chefe',
    brief:
      'Ninguém aceita comando direto. Você precisa que a decisão saia da sala sem que ninguém possa dizer que você decidiu.',
    rounds: [
      {
        prompt: 'As três facções apresentam números incompatíveis.',
        choices: [
          {
            label: 'Pedir que cada uma aponte o dado que aceitaria rever',
            outcome: 'Duas facções admitem a mesma premissa frágil. O impasse perdeu o primeiro pilar.',
            suspicion: 4,
            advantage: 17,
          },
          {
            label: 'Escolher a proposta com melhor número',
            outcome: 'As outras duas se unem contra a escolhida. Você criou uma maioria hostil.',
            suspicion: 18,
            advantage: 9,
          },
          {
            label: 'Propor votação aberta',
            outcome: 'A facção menor se retira antes do voto. Legitimidade formal, sala vazia.',
            suspicion: 12,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'A facção minoritária ameaça sair da mesa.',
        choices: [
          {
            label: 'Pedir que ela escreva a condição para ficar',
            outcome: 'A condição é pequena e resolve o ponto de honra. Custo baixo, permanência garantida.',
            suspicion: 5,
            advantage: 19,
          },
          {
            label: 'Convencer a maioria a ceder algo',
            outcome: 'A maioria cede e cobra a fatura depois. Você ficou devedor dos dois lados.',
            suspicion: 13,
            advantage: 12,
          },
          {
            label: 'Deixar sair e seguir com dois',
            outcome: 'A decisão sai, mas ninguém assina a implementação. Acordo sem dono.',
            suspicion: 15,
            advantage: 8,
          },
        ],
      },
      {
        prompt: 'Alguém precisa anunciar a decisão final.',
        choices: [
          {
            label: 'Sugerir que o membro mais cético anuncie',
            outcome: 'Ele anuncia como se fosse sua conclusão e defende o acordo depois. Autoria distribuída.',
            suspicion: 3,
            advantage: 21,
          },
          {
            label: 'Anunciar você mesmo, em nome do consenso',
            outcome: 'A sala aceita e registra você como autor. O impasse volta na próxima reunião.',
            suspicion: 11,
            advantage: 13,
          },
          {
            label: 'Pedir que a decisão seja votada por escrito',
            outcome: 'O escrito expõe as diferenças que o acordo verbal escondia. Tensão recriada.',
            suspicion: 9,
            advantage: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'construcao-rapport',
    title: 'Construção de rapport',
    opponent: 'Arquivista que controla o acesso à sala restrita',
    brief:
      'Ele não responde a autoridade nem a dinheiro. Sua única via é espelhar o que ele valoriza sem parecer que está tentando.',
    rounds: [
      {
        prompt: 'Ele corrige a forma como você chamou o arquivo.',
        choices: [
          {
            label: 'Repetir o termo correto e pedir a razão da diferença',
            outcome: 'Ele explica por quatro minutos e abre a gaveta. Espelhar linguagem abriu a porta.',
            suspicion: 3,
            advantage: 18,
          },
          {
            label: 'Dizer que é a mesma coisa',
            outcome: 'Ele responde em monossílabos até o fim da conversa. Correção contestada fecha a porta.',
            suspicion: 14,
            advantage: 6,
          },
          {
            label: 'Mostrar a autorização assinada',
            outcome: 'Ele confere a assinatura e libera o mínimo. Autoridade resolve o acesso, não a relação.',
            suspicion: 9,
            advantage: 12,
          },
        ],
      },
      {
        prompt: 'Ele comenta que "ninguém mais se importa com o arquivo morto".',
        choices: [
          {
            label: 'Perguntar qual peça ele salvaria primeiro',
            outcome: 'Ele mostra um mapa de 1962 que restaurou sozinho. O valor dele virou assunto.',
            suspicion: 4,
            advantage: 20,
          },
          {
            label: 'Concordar que arquivo morto é desperdício',
            outcome: 'Ele fecha a gaveta e muda de assunto. Você espelhou o desprezo, não o valor.',
            suspicion: 17,
            advantage: 7,
          },
          {
            label: 'Oferecer ajuda com a digitalização',
            outcome: 'Ele agradece e adia. Oferta de recurso não substitui reconhecimento.',
            suspicion: 8,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'Você precisa da caixa 14, na sala restrita.',
        choices: [
          {
            label: 'Perguntar o que ele recomendaria consultar antes da caixa 14',
            outcome: 'Ele separa três itens e inclui a caixa 14 no pacote. O acesso veio como conselho.',
            suspicion: 5,
            advantage: 21,
          },
          {
            label: 'Pedir a caixa 14 diretamente',
            outcome: 'Ele pede o protocolo. Pedido direto aciona o procedimento, não a relação.',
            suspicion: 12,
            advantage: 10,
          },
          {
            label: 'Elogiar o trabalho dele e pedir a caixa',
            outcome: 'O elogio soa comprado e o pedido volta ao protocolo. Rapport com pedido embutido não cola.',
            suspicion: 15,
            advantage: 8,
          },
        ],
      },
    ],
  },
  {
    id: 'desarme-isca',
    title: 'Desarme de isca',
    opponent: 'Intermediário oferecendo um acordo bom demais',
    brief:
      'Ele oferece acesso total, sem garantia, sem custo e com prazo curto. Toda oferta assim tem um gancho. Encontre e inverta.',
    rounds: [
      {
        prompt: 'Ele oferece o arquivo completo em troca de "um favor depois".',
        choices: [
          {
            label: 'Aceitar e definir o favor por escrito antes',
            outcome: 'Ele recusa especificar o favor. A recusa revela que o gancho é o próprio favor.',
            suspicion: 6,
            advantage: 18,
          },
          {
            label: 'Aceitar na hora e agradecer',
            outcome: 'Ele entrega metade do arquivo e guarda o resto como alavanca. Você comprou dívida aberta.',
            suspicion: 19,
            advantage: 9,
          },
          {
            label: 'Recusar e encerrar a conversa',
            outcome: 'Ele ri e oferece o dobro pela metade do preço. Recusar tudo confirmou o valor da isca.',
            suspicion: 10,
            advantage: 13,
          },
        ],
      },
      {
        prompt: 'Ele "deixa escapar" que seu concorrente já aceitou o acordo.',
        choices: [
          {
            label: 'Pedir o nome de quem assinou e a data',
            outcome: 'Ele gagueja e muda o nome duas vezes. A prova social era encenação.',
            suspicion: 5,
            advantage: 20,
          },
          {
            label: 'Dizer que você não se importa com o concorrente',
            outcome: 'Ele insiste no assunto e perde credibilidade. Negar a informação não testa a fonte.',
            suspicion: 11,
            advantage: 12,
          },
          {
            label: 'Acelerar a decisão por causa da concorrência',
            outcome: 'Você assina o termo de intenção e ele cobra o favor no dia seguinte. A pressa era o golpe.',
            suspicion: 24,
            advantage: 7,
          },
        ],
      },
      {
        prompt: 'Ele pede sua assinatura agora, "antes que o diretor volte".',
        choices: [
          {
            label: 'Dizer que assina e propor gravar a entrega com ele',
            outcome: 'Ele inventa uma reunião e sai. A isca era a informalidade, e você a espelhou.',
            suspicion: 8,
            advantage: 19,
          },
          {
            label: 'Assinar mediante recibo simples',
            outcome: 'Ele aceita o recibo com nome falso. O gancho agora está no seu próprio documento.',
            suspicion: 20,
            advantage: 10,
          },
          {
            label: 'Pedir que o diretor participe da assinatura',
            outcome: 'Ele adia indefinidamente. A isca precisa da ausência de testemunhas.',
            suspicion: 9,
            advantage: 15,
          },
        ],
      },
    ],
  },
  {
    id: 'efeito-dominio',
    title: 'Efeito dominó',
    opponent: 'Oponente que pensa um turno à frente, mas não dois',
    brief:
      'Você começa em desvantagem. A jogada que parece fraca agora é a que vence três turnos depois — mas ele vai reagir.',
    rounds: [
      {
        prompt: 'Turno 1. Ele ocupa o centro e espera sua reação.',
        choices: [
          {
            label: 'Ceder o centro e ocupar a lateral dele',
            outcome: 'Ele comemora o centro e ignora a lateral. Sua peça agora controla a rota de saída dele.',
            suspicion: 5,
            advantage: 15,
          },
          {
            label: 'Disputar o centro imediatamente',
            outcome: 'Você empata o centro e perde duas peças na troca. Reação de primeira ordem.',
            suspicion: 14,
            advantage: 9,
          },
          {
            label: 'Recuar e reforçar a defesa',
            outcome: 'Ele avança duas casas e ganha espaço. Defesa sem plano deixa ele escolher o ritmo.',
            suspicion: 8,
            advantage: 10,
          },
        ],
      },
      {
        prompt: 'Turno 2. Ele avança para bloquear sua lateral.',
        choices: [
          {
            label: 'Oferecer uma peça de valor médio como isca',
            outcome: 'Ele aceita a peça e abre a diagonal que você preparou. A isca funciona porque parece erro.',
            suspicion: 6,
            advantage: 19,
          },
          {
            label: 'Defender a peça ameaçada',
            outcome: 'Ele troca e mantém a iniciativa. Você salvou a peça e perdeu a diagonal.',
            suspicion: 12,
            advantage: 11,
          },
          {
            label: 'Atacar a peça dele do outro lado',
            outcome: 'Ele responde com uma ameaça maior. Contra-ataque prematuro devolve a iniciativa.',
            suspicion: 15,
            advantage: 10,
          },
        ],
      },
      {
        prompt: 'Turno 3. Ele tem duas respostas possíveis. Só uma perde em três.',
        choices: [
          {
            label: 'Jogar a linha que pune a resposta natural dele',
            outcome: 'Ele escolhe a natural e perde a diagonal. O plano de três turnos fechou.',
            suspicion: 4,
            advantage: 21,
          },
          {
            label: 'Forçar o empate imediato',
            outcome: 'O empate garante o ponto e encerra a linha. Você venceu o turno, não a sequência.',
            suspicion: 9,
            advantage: 13,
          },
          {
            label: 'Ameaçar duas peças ao mesmo tempo',
            outcome: 'Ele sacrifica uma peça e escapa da outra. A ameaça dupla era visível demais.',
            suspicion: 11,
            advantage: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'colapso-plano-a',
    title: 'Colapso do plano A',
    opponent: 'Traição do parceiro no meio da operação',
    brief:
      'Dois turnos, mais um de fechamento. O parceiro levou metade dos recursos e avisou o outro lado. Não há tempo para plano novo — só para reorganizar o que sobrou.',
    rounds: [
      {
        prompt: 'Turno 1. Você tem metade do orçamento e uma janela de 40 minutos.',
        choices: [
          {
            label: 'Cortar o escopo ao núcleo e assumir o risco de entrega parcial',
            outcome: 'A entrega parcial cobre o essencial. O cliente aceita o recorte porque o prazo foi mantido.',
            suspicion: 7,
            advantage: 18,
          },
          {
            label: 'Continuar o plano original com metade dos recursos',
            outcome: 'A operação atrasa e o cliente descobre a falha antes do fim. Escopo intacto, entrega zero.',
            suspicion: 20,
            advantage: 8,
          },
          {
            label: 'Pedir recursos ao antigo parceiro',
            outcome: 'Ele aceita ajudar e cobra o dobro em condições. A traição virou dependência.',
            suspicion: 16,
            advantage: 11,
          },
        ],
      },
      {
        prompt: 'Turno 2. O outro lado já sabe do recorte e oferece uma saída.',
        choices: [
          {
            label: 'Aceitar a saída e entregar o recorte com a assinatura deles',
            outcome: 'A entrega sai menor e com dois responsáveis. A traição virou garantia contratual.',
            suspicion: 8,
            advantage: 20,
          },
          {
            label: 'Recusar e tentar a entrega completa no tempo restante',
            outcome: 'A pressa quebra o recorte e o prazo. Tentar o plano A de novo custa os dois.',
            suspicion: 22,
            advantage: 9,
          },
          {
            label: 'Entregar o recorte sem avisar o cliente',
            outcome: 'O cliente descobre a diferença no aceite. Economia de conversa, custo de confiança.',
            suspicion: 18,
            advantage: 12,
          },
        ],
      },
      {
        prompt: 'Turno 3. O cliente aceita o recorte, mas exige uma garantia.',
        choices: [
          {
            label: 'Abrir a auditoria do que ficou de fora',
            outcome: 'Ele aceita o recorte com escopo documentado. A falha virou registro cobrável.',
            suspicion: 6,
            advantage: 18,
          },
          {
            label: 'Prometer entregar o restante sem custo',
            outcome: 'Ele aceita e o custo do restante volta para você. A saída ficou mais cara que o plano.',
            suspicion: 15,
            advantage: 11,
          },
          {
            label: 'Pedir assinatura imediata',
            outcome: 'Ele assina e registra a pressa. A confiança caiu no mesmo gesto que fechou o contrato.',
            suspicion: 20,
            advantage: 9,
          },
        ],
      },
    ],
  },
]

export function scenarioById(id: string): Scenario {
  const found = SCENARIOS.find((item) => item.id === id)
  if (!found) throw new Error(`Cenário desconhecido: ${id}`)
  return found
}
