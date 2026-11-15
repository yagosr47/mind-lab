/**
 * Dossiês do motor `statement-audit`.
 *
 * Cada caso tem 8 cláusulas, dois desfechos possíveis (`reasons`) e exatamente
 * duas falhas: uma dentro das 4 primeiras cláusulas (modo Fácil) e outra dentro
 * das 6 primeiras (modo Médio). O modo Difícil usa o dossiê inteiro e ativa
 * pistas falsas de contexto na interface.
 */

export interface CaseSegment {
  speaker: string
  text: string
}

export interface CaseFile {
  id: string
  title: string
  brief: string
  segments: CaseSegment[]
  /** Índices das cláusulas com falha. */
  flaws: number[]
  reasons: string[]
  correctReason: number
  explanation: string
}

export const CASES: CaseFile[] = [
  {
    id: 'patamar-42',
    title: 'Queda no patamar',
    brief:
      'M. Prado encontrou um colega desacordado na sala de reuniões do 4º andar. O relato tem 90 segundos e nenhuma pausa. A perícia ainda está no local.',
    segments: [
      { speaker: 'ANALISTA', text: 'O senhor foi a primeira pessoa a entrar na sala?' },
      {
        speaker: 'PRADO',
        text: 'Fui. A porta estava trancada e eu abri com a minha chave, sem tocar na maçaneta.',
      },
      { speaker: 'ANALISTA', text: 'O que o senhor encontrou lá dentro?' },
      {
        speaker: 'PRADO',
        text: 'O Dr. Salles sentado na cadeira, com o copo na mão, e a janela fechada.',
      },
      {
        speaker: 'PRADO',
        text: 'Ele já estava gelado quando cheguei, mas o copo na mão dele ainda estava quente.',
      },
      { speaker: 'ANALISTA', text: 'O senhor tocou no corpo em algum momento?' },
      {
        speaker: 'PRADO',
        text: 'Só para conferir o pulso, e o copo ficou na mão dele o tempo todo.',
      },
      {
        speaker: 'PERÍCIA',
        text: 'O laudo indica que o copo foi apoiado na mesa depois que o corpo já havia caído.',
      },
    ],
    flaws: [1, 4],
    reasons: [
      'Contradição física entre o estado do corpo e o do objeto que ele segurava',
      'Excesso de detalhes irrelevantes sobre a mobília da sala',
      'Tom emocional incompatível com a gravidade do relato',
    ],
    correctReason: 0,
    explanation:
      'Relatos fabricados colidem primeiro nos detalhes físicos: temperatura, apoio, atrito. Quem inventa uma cena descreve objetos estáveis, mas esquece que um corpo sem vida não sustenta um copo quente por horas.',
  },
  {
    id: 'apartamento-42',
    title: 'Autópsia de ambiente',
    brief:
      'Apartamento 42, vistoriado às 06h20. A energia está cortada desde a noite anterior. Dois moradores prestam esclarecimentos sobre a ausência.',
    segments: [
      {
        speaker: 'VISTOR',
        text: 'O imóvel estava vazio, sem energia e com a geladeira desligada na tomada.',
      },
      {
        speaker: 'MORADOR',
        text: 'Saí na quinta com minha irmã e ninguém voltou ao apartamento depois disso.',
      },
      {
        speaker: 'VISTOR',
        text: 'Na cozinha há duas xícaras com resíduo úmido e a torradeira ainda morna.',
      },
      {
        speaker: 'VISTOR',
        text: 'No quarto: cama feita, mala aberta e metade dos cabides vazios.',
      },
      { speaker: 'ANALISTA', text: 'Quem mais tem a chave do apartamento?' },
      {
        speaker: 'MORADOR',
        text: 'Só minha irmã. Mas eu subi no sábado para pegar o carregador e não entrei na cozinha.',
      },
      {
        speaker: 'MORADOR',
        text: 'Deixei tudo arrumado, desliguei a geladeira e tranquei a porta ao sair.',
      },
      {
        speaker: 'VISTOR',
        text: 'A irmã confirma a versão da viagem de quinta e nega ter voltado ao prédio.',
      },
    ],
    flaws: [2, 5],
    reasons: [
      'Contradição entre a negativa de retorno e a visita admitida, com vestígios incompatíveis com a ausência',
      'Falta de detalhes sobre o itinerário da viagem',
      'Uso de linguagem vaga ao descrever os cômodos',
    ],
    correctReason: 0,
    explanation:
      'Vestígios térmicos são testemunhas mudas: uma torradeira morna desmonta uma ausência de três dias. O detalhe que sobra — a visita admitida no sábado — é a costura que faltava para explicar os objetos fora de lugar.',
  },
  {
    id: 'lote-escassez',
    title: 'Lote encerrado',
    brief:
      'Transcrição de uma ligação comercial gravada com autorização. O cliente ainda não assinou nada.',
    segments: [
      { speaker: 'VENDEDOR', text: 'Obrigado por abrir espaço na sua agenda hoje.' },
      {
        speaker: 'VENDEDOR',
        text: 'Só restam duas unidades desse lote e elas saem hoje à noite.',
      },
      { speaker: 'CLIENTE', text: 'Duas? Ontem eu vi três no site.' },
      {
        speaker: 'VENDEDOR',
        text: 'O site atrasa. O que importa é que a condição termina às 18h em ponto.',
      },
      {
        speaker: 'VENDEDOR',
        text: 'Se você não fechar agora, o lote volta ao preço cheio amanhã e eu não consigo segurar.',
      },
      { speaker: 'CLIENTE', text: 'E se eu precisar de mais um dia para decidir?' },
      {
        speaker: 'VENDEDOR',
        text: 'Aí eu teria que tirar de outro cliente que já pagou a entrada.',
      },
      {
        speaker: 'ANALISTA',
        text: 'O mesmo lote aparece em três canais com estoques diferentes e o mesmo prazo de 18h.',
      },
    ],
    flaws: [1, 4],
    reasons: [
      'Escassez artificial: estoque e prazo fabricados para forçar decisão',
      'Prova social sem fonte verificável',
      'Ancoragem de preço alto antes de apresentar o desconto',
    ],
    correctReason: 0,
    explanation:
      'Escassez é o gatilho mais barato de produzir e o mais difícil de verificar. Quando o prazo aparece antes do argumento, o argumento não existe: o objetivo é reduzir o tempo de análise, não convencer.',
  },
  {
    id: 'saguao-hotel',
    title: 'Saguão às 21h40',
    brief:
      'Registro de observação de uma abordagem no saguão do hotel. O alvo conversa com a recepção há dois minutos.',
    segments: [
      {
        speaker: 'OBSERVADOR',
        text: 'O alvo mantém o corpo de perfil e a fala em volume baixo.',
      },
      {
        speaker: 'OBSERVADOR',
        text: 'A mão direita está no bolso do casaco e o cotovelo aponta para fora.',
      },
      {
        speaker: 'OBSERVADOR',
        text: 'Os pés apontam para a saída lateral, não para o recepcionista.',
      },
      {
        speaker: 'OBSERVADOR',
        text: 'O volume da voz não muda quando eu me aproximo a três metros.',
      },
      {
        speaker: 'OBSERVADOR',
        text: 'Ele confirma o número do quarto duas vezes sem consultar nada.',
      },
      {
        speaker: 'OBSERVADOR',
        text: 'O peso do corpo está na perna de trás, pronto para girar.',
      },
      { speaker: 'OBSERVADOR', text: 'O casaco segue aberto apesar do frio na entrada.' },
      {
        speaker: 'ANALISTA',
        text: 'Quando peço que ele mostre as mãos, ele recua meio passo e sorri.',
      },
    ],
    flaws: [1, 5],
    reasons: [
      'Conjunto de sinais posturais indica saída iminente, não confronto',
      'Contradição factual entre dois horários citados',
      'Generalização sobre o comportamento de hóspedes',
    ],
    correctReason: 0,
    explanation:
      'Antecipação é leitura de preparação motora: pés, peso e cotovelo denunciam a intenção antes do gesto. O corpo se orienta para onde vai sair, mesmo quando a conversa continua.',
  },
  {
    id: 'predio-9andar',
    title: 'Três alibis, uma janela',
    brief:
      'Ocorrência no 9º andar entre 22h e 23h. O sistema de acesso registrou uma única entrada pelo elevador social.',
    segments: [
      {
        speaker: 'SISTEMA',
        text: 'Entrada única no elevador social: 22h41, cartão vinculado ao 9º andar.',
      },
      {
        speaker: 'SILVA',
        text: 'Eu entrei às 22h20 pelo elevador social e subi direto para a sala.',
      },
      {
        speaker: 'SILVA',
        text: 'O segurança da recepção me viu e pode confirmar o horário.',
      },
      {
        speaker: 'COSTA',
        text: 'Eu estava no 9º andar desde as 21h, sozinho, revisando contratos.',
      },
      {
        speaker: 'COSTA',
        text: 'Não saí do andar em nenhum momento, nem para buscar o café que acabou.',
      },
      {
        speaker: 'SISTEMA',
        text: 'Leituras do 9º andar: 21h02, 22h47 e 23h10.',
      },
      {
        speaker: 'COSTA',
        text: 'A porta da escada fica aberta, qualquer pessoa sobe sem cartão.',
      },
      {
        speaker: 'PERÍCIA',
        text: 'A garrafa térmica da copa estava cheia e a xícara do 9º andar, limpa.',
      },
    ],
    flaws: [1, 4],
    reasons: [
      'As versões colidem com o registro eletrônico de acesso',
      'Há divergência sobre quem preparou o café',
      'Os dois depoentes descrevem a mesma pessoa de formas diferentes',
    ],
    correctReason: 0,
    explanation:
      'Em dedução, o registro mais barato de falsificar é a memória; o mais difícil é o log. Cruzar horário declarado com horário gravado elimina hipóteses sem precisar acreditar em ninguém.',
  },
  {
    id: 'galpao-duarte',
    title: 'A ponta solta',
    brief:
      'Relato escrito entregue por F. Duarte às 08h sobre o desvio de duas caixas na transportadora.',
    segments: [
      { speaker: 'ANALISTA', text: 'Este é o relato que o senhor entregou por escrito, correto?' },
      {
        speaker: 'DUARTE',
        text: 'Sim. Cheguei às 06h10 e o galpão ainda estava trancado como eu deixei.',
      },
      {
        speaker: 'DUARTE',
        text: 'Conferi os lacres, todos intactos, e fui direto para o escritório.',
      },
      {
        speaker: 'DUARTE',
        text: 'Não fiquei no pátio em momento nenhum e o portão seguiu fechado o dia inteiro.',
      },
      {
        speaker: 'ANALISTA',
        text: 'A gravação mostra o senhor no pátio às 06h40, carregando duas caixas.',
      },
      {
        speaker: 'DUARTE',
        text: 'Eu abri o portão às 06h15 com a minha chave, mas não carreguei caixa nenhuma.',
      },
      {
        speaker: 'DUARTE',
        text: 'As caixas que estavam lá não eram minhas e eu não assinei a saída delas.',
      },
      {
        speaker: 'PERÍCIA',
        text: 'Os lacres foram rompidos na doca e uma caixa vazia ficou no corredor.',
      },
    ],
    flaws: [3, 5],
    reasons: [
      'Duas cláusulas do próprio relato colidem entre si e com a gravação',
      'O relato tem detalhes demais sobre a rotina do vigia',
      'Há uma divergência de cinco minutos no horário de abertura',
    ],
    correctReason: 0,
    explanation:
      'Uma narrativa falsa costuma ser construída em blocos, e cada bloco resolve o problema anterior. A ponta solta aparece quando o autor se defende de uma acusação que ainda não foi feita.',
  },
  {
    id: 'plano-doca',
    title: 'Auditoria do plano',
    brief:
      'Memorando operacional com três fases para retirar carga da doca antes da ronda das 23h30.',
    segments: [
      { speaker: 'PLANEJADOR', text: 'Fase 1: desarmar o alarme do depósito às 23h em ponto.' },
      {
        speaker: 'PLANEJADOR',
        text: 'Fase 2: entrar pela doca usando o código do turno da noite.',
      },
      {
        speaker: 'SEGURANÇA',
        text: 'O código do turno da noite é trocado todas as sextas-feiras às 22h.',
      },
      {
        speaker: 'PLANEJADOR',
        text: 'O código é fixo desde o ano passado, ninguém troca isso.',
      },
      {
        speaker: 'PLANEJADOR',
        text: 'Se o alarme cair, o backup assume em 40 segundos e o supervisor desarma.',
      },
      {
        speaker: 'PLANEJADOR',
        text: 'O supervisor já estará em casa, então o backup não entra no cronograma.',
      },
      {
        speaker: 'SEGURANÇA',
        text: 'A ronda passa pela doca às 23h20 e só volta à meia-noite.',
      },
      {
        speaker: 'ANALISTA',
        text: 'O cronograma reserva 15 minutos para as três fases e nenhum para o backup.',
      },
    ],
    flaws: [3, 5],
    reasons: [
      'Premissa não verificada sobre o código e ausência de contingência para o backup',
      'Excesso de fases para uma janela de 15 minutos',
      'Dependência de um único operador sem rota de extração',
    ],
    correctReason: 0,
    explanation:
      'Planos falham menos por erro de execução e mais por premissa não testada. O ponto cego é sempre o que o autor considera garantido — e por isso não coloca no cronograma.',
  },
  {
    id: 'sala-3',
    title: 'Quem decide na sala',
    brief:
      'Transcrição de uma reunião de orçamento com cinco pessoas. Ninguém foi apresentado formalmente.',
    segments: [
      { speaker: 'NARRADOR', text: 'O diretor abre a reunião e distribui uma página impressa.' },
      {
        speaker: 'DIRETOR',
        text: 'A reunião é minha, mas quem fecha o número é o financeiro.',
      },
      { speaker: 'GERENTE', text: 'Eu trouxe três cenários de corte para o trimestre.' },
      {
        speaker: 'NARRADOR',
        text: 'O diretor responde olhando para a consultora antes de abrir a boca.',
      },
      {
        speaker: 'CONSULTORA',
        text: 'O cenário B cobre o caixa e mantém o contrato assinado.',
      },
      {
        speaker: 'NARRADOR',
        text: 'O sócio, calado até aqui, empurra a pasta dois centímetros e todos param.',
      },
      { speaker: 'GERENTE', text: 'Então está decidido, vou preparar o B.' },
      {
        speaker: 'NARRADOR',
        text: 'A consultora recolhe a pasta e encerra a reunião sem votação.',
      },
    ],
    flaws: [3, 5],
    reasons: [
      'O poder real aparece em quem os outros consultam com o olhar e em quem move o objeto de decisão',
      'O diretor lidera porque abriu a reunião e distribuiu o material',
      'A consultora lidera porque falou por último e encerrou o encontro',
    ],
    correctReason: 0,
    explanation:
      'Hierarquia formal se anuncia; hierarquia real se revela em microdeferência. Quem espera o olhar do outro antes de falar está pedindo autorização, não liderando.',
  },
  {
    id: 'portaria-cruzada',
    title: 'Depoimentos cruzados',
    brief:
      'Depoimentos de A (portaria) e B (manutenção), colhidos em salas separadas sobre a mesma noite.',
    segments: [
      { speaker: 'ANALISTA', text: 'Os dois vão repetir a sequência da noite, sem se ouvir.' },
      {
        speaker: 'PORTARIA',
        text: 'O técnico chegou às 22h10 e assinou o livro de entrada com o próprio punho.',
      },
      {
        speaker: 'TÉCNICO',
        text: 'Cheguei às 22h10, mas nunca assinei aquele livro; entrei atrás de um morador.',
      },
      {
        speaker: 'PORTARIA',
        text: 'Ele subiu com a caixa de ferramentas e ficou no 4º andar até depois das 23h.',
      },
      {
        speaker: 'TÉCNICO',
        text: 'Levei só a bolsa. A caixa ficou na van a noite inteira, trancada.',
      },
      { speaker: 'TÉCNICO', text: 'Saí às 23h20 pela portaria, sem pressa nenhuma.' },
      {
        speaker: 'PORTARIA',
        text: 'Ele saiu às 23h20, de mãos vazias, e não devolveu a chave do 4º andar.',
      },
      {
        speaker: 'PERÍCIA',
        text: 'A caixa de ferramentas foi encontrada no 4º andar, aberta e sem o alicate.',
      },
    ],
    flaws: [2, 4],
    reasons: [
      'Os depoimentos divergem sobre a assinatura e sobre o objeto transportado, e a perícia confirma uma das versões',
      'Há uma divergência de trinta minutos no horário de saída',
      'O técnico usa um morador para confirmar a própria versão',
    ],
    correctReason: 0,
    explanation:
      'No interrogatório cruzado, a mentira não está no tom, está na divergência de detalhes verificáveis. Quanto mais concreta a testemunha, mais fácil confrontá-la com o registro físico.',
  },
  {
    id: 'memorando-turno',
    title: 'Corte de 18%',
    brief:
      'Memorando interno que propõe encerrar o turno da noite para reduzir custo operacional em 18%.',
    segments: [
      {
        speaker: 'GESTOR',
        text: 'Proposta: encerrar o turno da noite e absorver a demanda no turno diurno.',
      },
      {
        speaker: 'GESTOR',
        text: 'A produção diurna absorve a demanda sem hora extra e o custo cai 18%.',
      },
      {
        speaker: 'MANUTENÇÃO',
        text: 'O turno da noite é o único que faz a manutenção preventiva das prensas.',
      },
      {
        speaker: 'GESTOR',
        text: 'A manutenção passa para a diurna aos sábados, sem custo extra de banco de horas.',
      },
      {
        speaker: 'CONTROLE',
        text: 'A diurna já opera com 96% de capacidade e 12% de retrabalho.',
      },
      {
        speaker: 'GESTOR',
        text: 'O retrabalho cai se a equipe estiver descansada, então o corte melhora o indicador.',
      },
      {
        speaker: 'CONTROLE',
        text: 'A equipe da noite é a mesma que treina os novos operadores da diurna.',
      },
      {
        speaker: 'CONTROLE',
        text: 'O contrato com o cliente exige entrega em 48h e a diurna já cumpre esse prazo.',
      },
    ],
    flaws: [3, 5],
    reasons: [
      'Efeito de segunda ordem: a economia destrói a capacidade que sustenta o prazo e o treinamento',
      'O corte é pequeno demais para justificar o risco operacional',
      'O cliente não foi consultado sobre a mudança de turno',
    ],
    correctReason: 0,
    explanation:
      'Toda decisão de primeira ordem tem custo visível e ganho visível. O risco real mora na segunda ordem: a folga que a operação usa para absorver imprevistos e que não aparece em nenhum indicador.',
  },
]

export function caseById(id: string): CaseFile {
  const found = CASES.find((item) => item.id === id)
  if (!found) throw new Error(`Dossiê desconhecido: ${id}`)
  return found
}
