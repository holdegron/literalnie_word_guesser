import { KEYBOARD_ROWS } from '../game/alphabet.ts'
import type { Mark } from '../game/board.ts'
import { MARK_STYLE } from './tiles.ts'

const keyBase =
  'h-11 min-w-0 flex-1 rounded-md border font-semibold uppercase transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink sm:h-12'

interface Props {
  marks: ReadonlyMap<string, Mark>
  onLetter: (letter: string) => void
  onErase?: () => void
  label: string
}

export const Keyboard = ({ marks, onLetter, onErase, label }: Props) => (
  <div className="flex w-full max-w-lg flex-col gap-1.5" role="group" aria-label={label}>
    {KEYBOARD_ROWS.map((row, index) => (
      <div key={index} className="flex justify-center gap-1">
        {row.map((letter) => {
          const mark = marks.get(letter)
          return (
            <button
              key={letter}
              type="button"
              onClick={() => onLetter(letter)}
              className={`${keyBase} max-w-11 ${mark ? MARK_STYLE[mark] : 'border-ink/20 bg-paper text-ink hover:bg-grid'}`}
            >
              {letter}
            </button>
          )
        })}
        {onErase && index === KEYBOARD_ROWS.length - 1 && (
          <button
            type="button"
            onClick={onErase}
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
