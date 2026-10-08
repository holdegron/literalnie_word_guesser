export type Mark = 'ABSENT' | 'PRESENT' | 'CORRECT'

export interface Tile {
  readonly letter: string
  readonly mark: Mark
}

export type Row = readonly Tile[]

export interface Board {
  readonly length: number
  readonly rows: readonly Row[]
}

export interface Guess {
  readonly word: string
  readonly marks: readonly Mark[]
}

export type BoardAction =
  | { type: 'type'; letter: string }
  | { type: 'erase' }
  | { type: 'enterWord'; word: string }
  | { type: 'cycleMark'; row: number; column: number }
  | { type: 'resize'; length: number }
  | { type: 'reset' }

export const MAX_ROWS = 6
export const MIN_LENGTH = 2
export const MAX_LENGTH = 15
export const DEFAULT_LENGTH = 5

const NEXT_MARK: Record<Mark, Mark> = { ABSENT: 'PRESENT', PRESENT: 'CORRECT', CORRECT: 'ABSENT' }
const MARK_RANK: Record<Mark, number> = { ABSENT: 0, PRESENT: 1, CORRECT: 2 }

export const emptyBoard = (length: number): Board => ({ length, rows: [] })

export const isComplete = (board: Board, row: Row): boolean => row.length === board.length

export const completeRows = (board: Board): Row[] => board.rows.filter((row) => isComplete(board, row))

export const activeRowIndex = (board: Board): number | null => {
  const last = board.rows.at(-1)
  if (last && !isComplete(board, last)) return board.rows.length - 1
  return board.rows.length < MAX_ROWS ? board.rows.length : null
}

export const toGuesses = (board: Board): Guess[] =>
  completeRows(board).map((row) => ({
    word: row.map((tile) => tile.letter).join(''),
    marks: row.map((tile) => tile.mark),
  }))

export const letterMarks = (board: Board): ReadonlyMap<string, Mark> =>
  completeRows(board)
    .flat()
    .reduce((marks, { letter, mark }) => {
      const known = marks.get(letter)
      return known && MARK_RANK[known] >= MARK_RANK[mark] ? marks : new Map(marks).set(letter, mark)
    }, new Map<string, Mark>())

const newTile = (board: Board, letter: string, column: number): Tile => ({
  letter,
  mark: completeRows(board).some((row) => row[column]?.letter === letter && row[column]?.mark === 'CORRECT')
    ? 'CORRECT'
    : 'ABSENT',
})

const withActiveRow = (board: Board, row: Row): Board => {
  const index = activeRowIndex(board)
  if (index === null) return board
  return { ...board, rows: [...board.rows.slice(0, index), row] }
}

const typeLetter = (board: Board, letter: string): Board => {
  const index = activeRowIndex(board)
  if (index === null) return board
  const row = board.rows[index] ?? []
  return withActiveRow(board, [...row, newTile(board, letter, row.length)])
}

const erase = (board: Board): Board => {
  const last = board.rows.at(-1)
  if (!last) return board
  const shortened = last.slice(0, -1)
  const rest = board.rows.slice(0, -1)
  return { ...board, rows: shortened.length > 0 ? [...rest, shortened] : rest }
}

const enterWord = (board: Board, word: string): Board =>
  word.length === board.length
    ? withActiveRow(board, [...word].map((letter, column) => newTile(board, letter, column)))
    : board

const cycleMark = (board: Board, rowIndex: number, column: number): Board => ({
  ...board,
  rows: board.rows.map((row, r) =>
    r !== rowIndex ? row : row.map((tile, c) => (c !== column ? tile : { ...tile, mark: NEXT_MARK[tile.mark] })),
  ),
})

export const boardReducer = (board: Board, action: BoardAction): Board => {
  switch (action.type) {
    case 'type':
      return typeLetter(board, action.letter)
    case 'erase':
      return erase(board)
    case 'enterWord':
      return enterWord(board, action.word)
    case 'cycleMark':
      return cycleMark(board, action.row, action.column)
    case 'resize':
      return emptyBoard(action.length)
    case 'reset':
      return emptyBoard(board.length)
  }
}
