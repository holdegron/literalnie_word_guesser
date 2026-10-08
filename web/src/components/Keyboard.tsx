import type { Dispatch } from 'react'
import { KEYBOARD_ROWS } from '../game/alphabet.ts'
import type { BoardAction, Mark } from '../game/board.ts'
import { MARK_STYLE } from './marks.ts'

const keyBase =
  'h-11 min-w-0 flex-1 rounded-md border font-semibold uppercase transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink sm:h-12'

interface Props {
  marks: ReadonlyMap<string, Mark>
  dispatch: Dispatch<BoardAction>
}

export const Keyboard = ({ marks, dispatch }: Props) => (
  <div className="flex w-full max-w-lg flex-col gap-1.5" aria-label="Klawiatura">
    {KEYBOARD_ROWS.map((row, index) => (
      <div key={index} className="flex justify-center gap-1">
        {row.map((letter) => {
          const mark = marks.get(letter)
          return (
            <button
              key={letter}
              type="button"
              onClick={() => dispatch({ type: 'type', letter })}
              className={`${keyBase} max-w-11 ${mark ? MARK_STYLE[mark] : 'border-ink/20 bg-paper text-ink hover:bg-grid'}`}
            >
              {letter}
            </button>
          )
        })}
        {index === KEYBOARD_ROWS.length - 1 && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'erase' })}
            aria-label="Usuń ostatnią literę"
            className={`${keyBase} max-w-20 grow-[1.6] border-ink/20 bg-paper text-ink hover:bg-grid`}
          >
            ⌫
          </button>
        )}
      </div>
    ))}
  </div>
)
