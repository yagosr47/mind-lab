/**
 * Gerador pseudoaleatório determinístico (mulberry32).
 *
 * Necessário porque o React Compiler marca `Math.random()` em render como
 * impuro. Com uma semente fixa por sessão, a sequência é estável para a
 * montagem do componente e continua variando entre sessões.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let counter = 0

/** Semente nova para cada sessão montada. */
export function nextSeed(): number {
  counter += 1
  return (Date.now() % 2147483647) + counter * 7919
}
