import type { Mark } from './board.ts'

export interface Letters {
  readonly length: number
  readonly correct: readonly string[]
  readonly present: Readonly<Record<string, readonly number[]>>
  readonly absent: readonly string[]
}

export type LettersAction =
  | { type: 'cycle'; letter: string }
  | { type: 'place'; position: number; letter: string }
  | { type: 'toggleNotAt'; letter: string; position: number }
  | { type: 'resize'; length: number }
  | { type: 'reset' }

export interface LettersRequest {
  correct: Record<number, string>
  present: Record<string, readonly number[]>
  absent: readonly string[]
}

export const emptyLetters = (length: number): Letters => ({
  length,
  correct: Array.from({ length }, () => ''),
  present: {},
  absent: [],
})

const isPresent = (letters: Letters, letter: string): boolean => Object.hasOwn(letters.present, letter)

export const isEmpty = (letters: Letters): boolean =>
  letters.correct.every((letter) => letter === '') && Object.keys(letters.present).length === 0 && letters.absent.length === 0

const withoutKey = <T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key))

const cycle = (letters: Letters, letter: string): Letters => {
  if (letters.absent.includes(letter)) {
    return { ...letters, absent: letters.absent.filter((l) => l !== letter), present: { ...letters.present, [letter]: [] } }
  }
  if (isPresent(letters, letter)) {
    return { ...letters, present: withoutKey(letters.present, letter) }
  }
  return letters.correct.includes(letter)
    ? { ...letters, present: { ...letters.present, [letter]: [] } }
    : { ...letters, absent: [...letters.absent, letter] }
}

const place = (letters: Letters, position: number, letter: string): Letters => ({
  ...letters,
  correct: letters.correct.map((current, i) => (i === position ? letter : current)),
  absent: letters.absent.filter((l) => l !== letter),
})

const toggleNotAt = (letters: Letters, letter: string, position: number): Letters => {
  const notAt = letters.present[letter] ?? []
  return {
    ...letters,
    present: {
      ...letters.present,
      [letter]: notAt.includes(position) ? notAt.filter((p) => p !== position) : [...notAt, position].sort((a, b) => a - b),
    },
  }
}

export const lettersReducer = (letters: Letters, action: LettersAction): Letters => {
  switch (action.type) {
    case 'cycle':
      return cycle(letters, action.letter)
    case 'place':
      return place(letters, action.position, action.letter)
    case 'toggleNotAt':
      return toggleNotAt(letters, action.letter, action.position)
    case 'resize':
      return emptyLetters(action.length)
    case 'reset':
      return emptyLetters(letters.length)
  }
}

export const lettersMarks = (letters: Letters): ReadonlyMap<string, Mark> =>
  new Map<string, Mark>([
    ...letters.absent.map((letter): [string, Mark] => [letter, 'ABSENT']),
    ...Object.keys(letters.present).map((letter): [string, Mark] => [letter, 'PRESENT']),
    ...letters.correct.filter(Boolean).map((letter): [string, Mark] => [letter, 'CORRECT']),
  ])

export const toLettersRequest = (letters: Letters): LettersRequest => ({
  correct: Object.fromEntries(letters.correct.flatMap((letter, position) => (letter ? [[position, letter]] : []))),
  present: letters.present,
  absent: letters.absent,
})
