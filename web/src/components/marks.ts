import type { Mark } from '../game/board.ts'

export const MARK_STYLE: Record<Mark, string> = {
  ABSENT: 'bg-absent text-on-tile border-absent',
  PRESENT: 'bg-present text-on-present border-present',
  CORRECT: 'bg-correct text-on-tile border-correct',
}

export const MARK_NAME: Record<Mark, string> = {
  ABSENT: 'szara',
  PRESENT: 'żółta',
  CORRECT: 'zielona',
}
