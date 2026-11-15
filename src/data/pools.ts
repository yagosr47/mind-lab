/**
 * Pools de estímulo usados pelos motores de classificação rápida
 * (stroop-reaction → task: 'classify').
 *
 * Cada pool traz duas categorias possíveis e itens que devem ser julgados
 * em menos de dois segundos. O texto é a única pista: não há imagens.
 */

export interface ClassifyItem {
  text: string
  /** Índice em `options`. */
  answer: 0 | 1
  tip?: string
}

export interface ClassifyPool {
  id: string
  label: string
  options: [string, string]
  items: ClassifyItem[]
}

export const CLASSIFY_POOLS: Record<string, ClassifyPool> = {
  microsignals: {
    id: 'microsignals',
    label: 'Microsinais faciais',
    options: ['TENSÃO', 'NEUTRO'],
    items: [
      { text: 'Sorriso que não alcança os olhos', answer: 0, tip: 'Contração apenas labial.' },
      { text: 'Ombros soltos, respiração lenta', answer: 1 },
      { text: 'Piscada acelerada ao ouvir o nome', answer: 0 },
      { text: 'Olhar fixo e neutro no objeto', answer: 1 },
      { text: 'Mandíbula travada ao mencionar a data', answer: 0 },
      { text: 'Mãos abertas apoiadas no colo', answer: 1 },
      { text: 'Lábio inferior puxado para dentro', answer: 0 },
      { text: 'Cabeça inclinada, ritmo estável', answer: 1 },
      { text: 'Deglutição seca antes de responder', answer: 0 },
      { text: 'Sobrancelha relaxada durante a pausa', answer: 1 },
      { text: 'Narinas dilatadas na pergunta-chave', answer: 0 },
      { text: 'Pés virados para a saída', answer: 0 },
      { text: 'Ritmo de fala constante, sem quebra', answer: 1 },
      { text: 'Micro-espasmo abaixo do olho direito', answer: 0 },
    ],
  },
  silogismos: {
    id: 'silogismos',
    label: 'Validade formal',
    options: ['VÁLIDO', 'FALÁCIA'],
    items: [
      { text: 'Todo A é B. Todo B é C. Logo, todo A é C.', answer: 0 },
      { text: 'Alguns A são B. Logo, todos A são B.', answer: 1, tip: 'Generalização indevida.' },
      { text: 'Se A, então B. B ocorreu. Logo, A ocorreu.', answer: 1, tip: 'Afirmação do consequente.' },
      { text: 'Se A, então B. A ocorreu. Logo, B ocorreu.', answer: 0 },
      { text: 'Nenhum A é B. X é A. Logo, X não é B.', answer: 0 },
      { text: 'A é verdadeiro. Quem diz A é suspeito. Logo, A é falso.', answer: 1, tip: 'Ad hominem.' },
      { text: 'Todos A são B. X não é B. Logo, X não é A.', answer: 0 },
      { text: 'Muitos A fazem B. Logo, B é seguro.', answer: 1 },
      { text: 'A ou B. Não A. Logo, B.', answer: 0 },
      { text: 'A ou B. A ocorreu. Logo, não B.', answer: 1, tip: 'Ou inclusivo.' },
      { text: 'Se A, então B. Não B. Logo, não A.', answer: 0 },
      { text: 'A é antigo. Logo, A é correto.', answer: 1 },
      { text: 'Todo A é B. Algum B é C. Logo, algum A é C.', answer: 1, tip: 'Termo médio não distribuído.' },
      { text: 'X é A ou B. X é A. Logo, X não é B.', answer: 1 },
      { text: 'Nenhum A é B. Nenhum B é C. Logo, nenhum A é C.', answer: 1 },
      { text: 'Se A, então B. Se B, então C. Logo, se A, então C.', answer: 0 },
    ],
  },
  blefe: {
    id: 'blefe',
    label: 'Sinal genuíno x ruído',
    options: ['SINAL', 'RUÍDO'],
    items: [
      { text: 'Aposta alta imediatamente após o flop', answer: 0 },
      { text: 'Pausa longa seguida de pergunta sobre o regulamento', answer: 1 },
      { text: 'Contradição entre aposta e postura corporal', answer: 0 },
      { text: 'Reajuste de fichas perfeitamente alinhado', answer: 1 },
      { text: 'Olhar rápido para o avaliador ao ouvir "prazo"', answer: 0 },
      { text: 'História ensaiada com detalhes na ordem certa', answer: 1 },
      { text: 'Mudança de ritmo na terceira repetição da mesma frase', answer: 0 },
      { text: 'Excesso de detalhes irrelevantes sem serem pedidos', answer: 1 },
      { text: 'Resposta imediata demais para uma pergunta complexa', answer: 0 },
      { text: 'Confirmação enfática sem ser questionado', answer: 1 },
      { text: 'Mão que se fecha quando o nome do alvo é citado', answer: 0 },
      { text: 'Riso fora de hora em pergunta neutra', answer: 0 },
      { text: 'Silêncio calculado de exatamente dois segundos', answer: 1 },
      { text: 'Correção espontânea de um horário irrelevante', answer: 1 },
    ],
  },
  periferia: {
    id: 'periferia',
    label: 'Anomalia periférica',
    options: ['ANOMALIA', 'ESPERADO'],
    items: [
      { text: 'Sombra que atravessa o corredor duas vezes', answer: 0 },
      { text: 'Extintor no suporte padrão da parede', answer: 1 },
      { text: 'Porta corta-fogo entreaberta sem calço', answer: 0 },
      { text: 'Placa de saída alinhada ao teto', answer: 1 },
      { text: 'Câmera inclinada 15° acima do normal', answer: 0 },
      { text: 'Cadeira fora do lugar na sala de espera', answer: 1 },
      { text: 'Reflexo de flash no vidro da sala ao lado', answer: 0 },
      { text: 'Luz de emergência apagada em dia útil', answer: 1 },
      { text: 'Dois cabos do mesmo tipo com espessuras diferentes', answer: 0 },
      { text: 'Piso recém-encerado na área comum', answer: 1 },
      { text: 'Relógio de parede parado dois minutos atrás', answer: 0 },
      { text: 'Janela com película nova em um único escritório', answer: 0 },
    ],
  },
}

export function poolById(id: string | undefined): ClassifyPool {
  return (id && CLASSIFY_POOLS[id]) || CLASSIFY_POOLS.microsignals
}
