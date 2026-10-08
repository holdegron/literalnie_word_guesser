import type { CSSProperties } from 'react'
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

export const tileBase =
  'size-(--tile) text-[length:calc(var(--tile)*0.5)] grid place-items-center rounded-md border-2 font-bold uppercase select-none'

export const tileSizeFor = (length: number): CSSProperties =>
  ({ '--tile': `min(3.5rem, calc((100vw - 7.5rem - ${length - 1} * 0.375rem) / ${length}))` }) as CSSProperties
