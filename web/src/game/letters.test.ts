import { describe, expect, it } from 'vitest'
import { emptyLetters, isEmpty, type Letters, type LettersAction, lettersMarks, lettersReducer, toLettersRequest } from './letters.ts'

const apply = (letters: Letters, ...actions: LettersAction[]): Letters => actions.reduce(lettersReducer, letters)
const cycle = (letter: string): LettersAction => ({ type: 'cycle', letter })

describe('lettersReducer', () => {
  it('cycles a letter through grey, yellow and unknown', () => {
    const grey = apply(emptyLetters(5), cycle('k'))
    const yellow = apply(grey, cycle('k'))

    expect(grey.absent).toEqual(['k'])
    expect(yellow).toMatchObject({ absent: [], present: { k: [] } })
    expect(apply(yellow, cycle('k'))).toEqual(emptyLetters(5))
  })

  it('never marks a green letter as missing', () => {
    const letters = apply(emptyLetters(5), { type: 'place', position: 4, letter: 'a' }, cycle('a'))

    expect(letters.absent).toEqual([])
    expect(letters.present).toEqual({ a: [] })
  })

  it('placing a grey letter on the board takes it off the missing list', () => {
    const letters = apply(emptyLetters(5), cycle('a'), { type: 'place', position: 0, letter: 'a' })

    expect(letters).toMatchObject({ correct: ['a', '', '', '', ''], absent: [] })
  })

  it('toggles the positions where a yellow letter is not', () => {
    const toggle = (position: number): LettersAction => ({ type: 'toggleNotAt', letter: 'o', position })
    const letters = apply(emptyLetters(5), cycle('o'), cycle('o'), toggle(3), toggle(1), toggle(3))

    expect(letters.present).toEqual({ o: [1] })
  })

  it('never rules out every position of a yellow letter', () => {
    const toggles = [0, 1, 2, 3, 4].map((position): LettersAction => ({ type: 'toggleNotAt', letter: 'b', position }))
    const letters = apply(emptyLetters(5), cycle('b'), cycle('b'), ...toggles)

    expect(letters.present).toEqual({ b: [0, 1, 2, 3] })
  })

  it('starts over when the length changes', () => {
    expect(apply(emptyLetters(5), cycle('x'), { type: 'resize', length: 6 })).toEqual(emptyLetters(6))
  })
})

describe('selectors', () => {
  const letters = apply(
    emptyLetters(5),
    { type: 'place', position: 4, letter: 'a' },
    cycle('o'),
    cycle('o'),
    { type: 'toggleNotAt', letter: 'o', position: 1 },
    cycle('k'),
  )

  it('builds the API request', () => {
    expect(toLettersRequest(letters)).toEqual({ correct: { 4: 'a' }, present: { o: [1] }, absent: ['k'] })
  })

  it('colours the keyboard', () => {
    expect(Object.fromEntries(lettersMarks(letters))).toEqual({ a: 'CORRECT', o: 'PRESENT', k: 'ABSENT' })
  })

  it('knows when nothing has been marked', () => {
    expect(isEmpty(emptyLetters(5))).toBe(true)
    expect(isEmpty(letters)).toBe(false)
  })
})
