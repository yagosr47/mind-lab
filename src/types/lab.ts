/**
 * MIND//LAB — arquitetura de dados.
 *
 * Este arquivo é a fonte única de verdade dos tipos do sistema: catálogo,
 * sessões, atributos e os contratos de payload de cada motor.
 */

export type AttrKey =
  | "intelligence"
  | "emotion"
  | "profiling"
  | "self"
  | "manipulation"
  | "field"
  | "sensory"
  | "reasoning"
  | "deception"
  | "strategy"
  | "adaptability"
  | "social"
  | "counter"
  | "foresight";

export type Difficulty = "easy" | "medium" | "hard";

export type EngineType =
  | "stroop-reaction"   // Tempo real: controle de impulso, atenção e velocidade sob interferência
  | "memory-matrix"     // Memória visual/espacial e sequências com tempo de exposição limitado
  | "rule-shift"        // Dedução dinâmica: regra oculta muda a cada N rodadas sem aviso
  | "statement-audit"   // Análise forense de texto/diálogo: clicar na frase exata com falha/contradição
  | "tactical-tree";    // Simulação de 3 a 4 turnos com medidores de tensão/confiança e consequências

export interface DifficultyConfig {
  level: Difficulty;
  label: "Fácil" | "Médio" | "Difícil";
  timeLimitSec: number | null; // null = sem cronômetro estrito
  xpReward: number;            // Base: Fácil = 15, Médio = 30, Difícil = 55
  description: string;         // O que muda nesta dificuldade (ex: "4x4 grid, 2.5s de exposição")
  payload: Record<string, unknown>; // Parâmetros específicos para o motor do exercício
}

export interface Exercise {
  id: string;
  attr: AttrKey;
  title: string;
  subtitle: string;
  engine: EngineType;
  instructions: string;
  cognitivePrinciple: string; // Explicação breve do mecanismo psicológico/cognitivo treinado
  difficulties: Record<Difficulty, DifficultyConfig>;
}

export interface SessionRecord {
  id: string;
  exerciseId: string;
  attr: AttrKey;
  difficulty: Difficulty;
  accuracy: number;     // 0 a 100%
  scoreDelta: number;   // Quanto a nota do atributo subiu (ex: +1.4)
  timeSpentSec: number;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/* Catálogo estendido                                                  */
/* ------------------------------------------------------------------ */

export interface BenchmarkAnchor {
  score: number;
  label: string;
}

export interface AttributeMeta {
  key: AttrKey;
  /** Código curto exibido no HUD, ex.: "INT". */
  code: string;
  /** Nome editorial, ex.: "Intelligence". */
  name: string;
  /** Domínio humano, ex.: "Cognição e Padrões". */
  domain: string;
  summary: string;
  benchmarks: BenchmarkAnchor[];
}

/* ------------------------------------------------------------------ */
/* Progresso persistido                                                */
/* ------------------------------------------------------------------ */

export interface LabProgress {
  version: number;
  scores: Record<AttrKey, number>;
  sessions: SessionRecord[];
  streak: number;
  /** Data local (YYYY-MM-DD) da última sessão, usada para a sequência. */
  lastSessionDay: string | null;
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* Contrato dos motores                                                */
/* ------------------------------------------------------------------ */

export interface EngineOutcome {
  /** 0 a 100. */
  accuracy: number;
  /** Linha de telemetria opcional exibida no debriefing. */
  note?: string;
}

export interface EngineProps {
  exercise: Exercise;
  config: DifficultyConfig;
  onComplete: (outcome: EngineOutcome) => void;
}

export interface StroopPayload {
  /**
   * ink: responde a cor da tinta.
   * word: responde o que a palavra diz.
   * direction: seta vs. rótulo textual.
   * classify: itens de um pool (silogismos, microsinais...).
   */
  task: "ink" | "word" | "direction" | "classify";
  rounds: number;
  roundMs: number;
  /** Inverte a regra de resposta em parte das rodadas. */
  reverse?: boolean;
  /** Estímulo pisca antes de revelar a regra aplicável. */
  blink?: boolean;
  /** Ruído visual de fundo durante a rodada. */
  distractors?: boolean;
  /** Chave do pool de itens (apenas task = classify). */
  pool?: string;
}

export interface MemoryPayload {
  gridSize: number;
  exposureMs: number;
  mode: "recall" | "change" | "sequence" | "nback";
  /** Quantidade de rodadas/tentativas. */
  trials: number;
  /** Células acesas por rodada. */
  litCount: number;
  /** N do N-back. */
  n?: number;
  /** Velocidade do stream no modo nback (ms por estímulo). */
  streamMs?: number;
  /** Células com alertas falsos durante a exposição. */
  distractors?: boolean;
}

export interface RuleShiftPayload {
  /** Acertos necessários para a regra oculta mudar. */
  changeEvery: number;
  trials: number;
  /** Adiciona cartas que combinam por dois atributos (ambíguas). */
  ambiguous?: boolean;
  /** Atributos disponíveis para a regra ativa. */
  attributes: ("color" | "shape" | "count")[];
  startRule?: "color" | "shape" | "count";
}

export interface StatementPayload {
  /** Dossiê do arquivo `src/data/cases.ts`. */
  caseId: string;
  /** Quantidade de cláusulas visíveis (recorte do dossiê). */
  visible: number;
  /** Quantas cláusulas o operador deve apontar. */
  required: number;
  /** Índices das cláusulas com falha dentro do recorte visível. */
  answers: number[];
  /** Desfechos possíveis (motivo técnico). */
  reasons: string[];
  /** Índice da explicação correta em `reasons`. */
  correctReason: number;
  /** Red herrings explícitos do modo Difícil. */
  redHerrings?: boolean;
}

export interface TacticalPayload {
  /** Cenário do arquivo `src/data/scenarios.ts`. */
  scenarioId: string;
  rounds: number;
  startSuspicion: number;
  startAdvantage: number;
  targetAdvantage: number;
  suspicionLimit: number;
  /** full = mostra o impacto de cada escolha; hidden = consequências de 2ª ordem. */
  feedback: "full" | "hidden";
  /** Exibe o resultado de cada turno apenas no fim. */
  delayedConsequences?: boolean;
}

export type LabView = "dashboard" | "catalog" | "telemetry";

export interface GuidedStep {
  exerciseId: string;
  difficulty: Difficulty;
}
