import { describe, expect, it } from 'vitest'
import { activeRowIndex, type Board, type BoardAction, boardReducer, emptyBoard, letterMarks, MAX_ROWS, toGuesses } from './board.ts'

const apply = (board: Board, ...actions: BoardAction[]): Board => actions.reduce(boardReducer, board)
const typeWord = (word: string): BoardAction[] => [...word].map((letter) => ({ type: 'type', letter }))

describe('boardReducer', () => {
  it('types letters into the active row and starts a new row once it is full', () => {
    const board = apply(emptyBoard(3), ...typeWord('kotek'))

    expect(board.rows.map((row) => row.map((tile) => tile.letter).join(''))).toEqual(['kot', 'ek'])
    expect(activeRowIndex(board)).toBe(1)
  })

  it('erases backwards across rows', () => {
    const board = apply(emptyBoard(3), ...typeWord('kota'), { type: 'erase' }, { type: 'erase' })

    expect(board.rows.map((row) => row.length)).toEqual([2])
  })

  it('stops accepting letters when every row is filled', () => {
    const full = apply(emptyBoard(2), ...typeWord('ab'.repeat(MAX_ROWS)))

    expect(activeRowIndex(full)).toBeNull()
    expect(apply(full, { type: 'type', letter: 'x' })).toBe(full)
  })

  it('cycles a tile through grey, yellow and green', () => {
    const cycle: BoardAction = { type: 'cycleMark', row: 0, column: 1 }
    const typed = apply(emptyBoard(2), ...typeWord('ok'))

    expect(apply(typed, cycle).rows[0]?.[1]?.mark).toBe('PRESENT')
    expect(apply(typed, cycle, cycle).rows[0]?.[1]?.mark).toBe('CORRECT')
    expect(apply(typed, cycle, cycle, cycle).rows[0]?.[1]?.mark).toBe('ABSENT')
  })

  it('pre-colours letters already found in the same position', () => {
    const board = apply(
      emptyBoard(5),
      ...typeWord('lalka'),
      { type: 'cycleMark', row: 0, column: 4 },
      { type: 'cycleMark', row: 0, column: 4 },
      { type: 'enterWord', word: 'kotka' },
    )

    expect(board.rows[1]?.map((tile) => tile.mark)).toEqual(['ABSENT', 'ABSENT', 'ABSENT', 'ABSENT', 'CORRECT'])
  })

  it('replaces a half-typed row when a whole word is entered', () => {
    const board = apply(emptyBoard(5), ...typeWord('ko'), { type: 'enterWord', word: 'palma' })

    expect(toGuesses(board).map((guess) => guess.word)).toEqual(['palma'])
  })

  it('clears the board when the word length changes', () => {
    expect(apply(emptyBoard(5), ...typeWord('kotek'), { type: 'resize', length: 6 })).toEqual(emptyBoard(6))
  })
})

describe('selectors', () => {
  const board = apply(
    emptyBoard(5),
    ...typeWord('kokos'),
    { type: 'cycleMark', row: 0, column: 0 },
    { type: 'cycleMark', row: 0, column: 1 },
    { type: 'cycleMark', row: 0, column: 1 },
    ...typeWord('ko'),
  )

  it('sends only complete rows as guesses', () => {
    expect(toGuesses(board)).toEqual([{ word: 'kokos', marks: ['PRESENT', 'CORRECT', 'ABSENT', 'ABSENT', 'ABSENT'] }])
  })

  it('keeps the best colour of every letter for the keyboard', () => {
    expect(Object.fromEntries(letterMarks(board))).toEqual({ k: 'PRESENT', o: 'CORRECT', s: 'ABSENT' })
  })
})
