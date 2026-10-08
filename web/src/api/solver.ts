import type { Guess } from '../game/board.ts'
import type { LettersRequest } from '../game/letters.ts'

export type PartOfSpeech =
  | 'NOUN'
  | 'ADJECTIVE'
  | 'VERB'
  | 'ADVERB'
  | 'NUMERAL'
  | 'PRONOUN'
  | 'PREPOSITION'
  | 'CONJUNCTION'
  | 'PARTICLE'
  | 'INTERJECTION'
  | 'OTHER'

export interface Word {
  text: string
  partsOfSpeech: PartOfSpeech[]
  qualifiers: string[]
  rare: boolean
}

export interface SolveRequest {
  length: number
  guesses: readonly Guess[]
  letters?: LettersRequest
  limit: number
}

export interface SolveResponse {
  total: number
  funnel: number[]
  words: Word[]
}

export const solve = async (request: SolveRequest, signal: AbortSignal): Promise<SolveResponse> => {
  const response = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
  if (!response.ok) throw new Error(`Serwer odpowiedział statusem ${response.status}.`)
  return (await response.json()) as SolveResponse
}

export const PART_OF_SPEECH: Record<PartOfSpeech, { short: string; full: string }> = {
  NOUN: { short: 'rz.', full: 'rzeczownik' },
  ADJECTIVE: { short: 'przym.', full: 'przymiotnik' },
  VERB: { short: 'czas.', full: 'czasownik' },
  ADVERB: { short: 'przysł.', full: 'przysłówek' },
  NUMERAL: { short: 'licz.', full: 'liczebnik' },
  PRONOUN: { short: 'zaim.', full: 'zaimek' },
  PREPOSITION: { short: 'przyim.', full: 'przyimek' },
  CONJUNCTION: { short: 'spój.', full: 'spójnik' },
  PARTICLE: { short: 'part.', full: 'partykuła' },
  INTERJECTION: { short: 'wykrz.', full: 'wykrzyknik' },
  OTHER: { short: '', full: 'inna część mowy' },
}
