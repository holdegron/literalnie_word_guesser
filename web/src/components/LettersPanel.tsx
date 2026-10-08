import { type Dispatch, type KeyboardEvent, useMemo, useRef } from 'react'
import { isLetter } from '../game/alphabet.ts'
import { canToggleNotAt, type Letters, type LettersAction, lettersMarks } from '../game/letters.ts'
import { Keyboard } from './Keyboard.tsx'
import { MARK_STYLE, tileBase, tileSizeFor } from './tiles.ts'

interface Props {
  letters: Letters
  dispatch: Dispatch<LettersAction>
}

const Step = ({ swatches, title, hint }: { swatches: string[]; title: string; hint: string }) => (
  <div>
    <h3 className="flex items-center gap-2 text-lg font-bold">
      {swatches.map((swatch) => (
        <span key={swatch} className={`size-4 rounded-sm border ${swatch}`} aria-hidden />
      ))}
      {title}
    </h3>
    <p className="text-pencil mt-0.5 text-sm">{hint}</p>
  </div>
)

export const LettersPanel = ({ letters, dispatch }: Props) => {
  const slots = useRef<(HTMLInputElement | null)[]>([])
  const marks = useMemo(() => lettersMarks(letters), [letters])
  const positions = Array.from({ length: letters.length }, (_, position) => position)
  const presentLetters = Object.keys(letters.present)

  const place = (position: number, value: string) => {
    const letter = [...value.toLowerCase()].filter(isLetter).at(-1) ?? ''
    dispatch({ type: 'place', position, letter })
    if (letter) slots.current[position + 1]?.focus()
  }

  const backOnEmpty = (position: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && letters.correct[position] === '') slots.current[position - 1]?.focus()
  }

  return (
    <div className="flex w-full flex-col gap-7" style={tileSizeFor(letters.length)}>
      <section className="flex flex-col gap-3">
        <Step
          swatches={[MARK_STYLE.CORRECT]}
          title="Na swoim miejscu"
          hint="Wpisz literę w kratkę, na której w grze była zielona."
        />
        <div className="flex gap-1.5">
          {positions.map((position) => {
            const letter = letters.correct[position] ?? ''
            return (
              <label key={position} className="flex flex-col items-center gap-1">
                <input
                  ref={(element) => {
                    slots.current[position] = element
                  }}
                  value={letter}
                  onChange={(event) => place(position, event.target.value)}
                  onKeyDown={backOnEmpty(position)}
                  onFocus={(event) => event.target.select()}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-label={`Litera na pozycji ${position + 1}`}
                  className={`${tileBase} text-center caret-transparent outline-none focus:ring-3 focus:ring-ink/40 ${
                    letter ? MARK_STYLE.CORRECT : 'border-ink/25 bg-paper text-ink'
                  }`}
                />
                <span className="text-pencil text-xs">{position + 1}</span>
              </label>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Step
          swatches={[MARK_STYLE.ABSENT, MARK_STYLE.PRESENT]}
          title="Są w słowie albo ich nie ma"
          hint="Stuknij literę raz: nie ma jej w słowie (szara). Drugi raz: jest, ale nie wiesz gdzie (żółta). Trzeci raz: czyścisz."
        />
        <Keyboard marks={marks} onLetter={(letter) => dispatch({ type: 'cycle', letter })} label="Litery do zaznaczenia" />
      </section>

      {presentLetters.length > 0 && (
        <section className="flex flex-col gap-3">
          <Step
            swatches={[MARK_STYLE.PRESENT]}
            title="Gdzie żółtych liter nie ma"
            hint="Zaznacz miejsca, w których litera była żółta. Tam na pewno nie stoi."
          />
          <div className="flex flex-col gap-1.5">
            {presentLetters.map((letter) => (
              <div key={letter} className="flex items-center gap-1.5">
                <span className="w-8 shrink-0 text-xl font-bold uppercase">{letter}</span>
                {positions.map((position) => {
                  const notHere = letters.present[letter]?.includes(position) ?? false
                  const lastPlaceLeft = !canToggleNotAt(letters, letter, position)
                  return (
                    <button
                      key={position}
                      type="button"
                      disabled={lastPlaceLeft}
                      title={lastPlaceLeft ? 'To ostatnie miejsce, na którym ta litera może stać' : undefined}
                      aria-pressed={notHere}
                      aria-label={`${letter.toUpperCase()} nie stoi na pozycji ${position + 1}`}
                      onClick={() => dispatch({ type: 'toggleNotAt', letter, position })}
                      className={`${tileBase} focus-visible:outline-ink cursor-pointer transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                        notHere ? MARK_STYLE.PRESENT : 'border-ink/20 bg-paper'
                      }`}
                    >
                      {notHere ? letter : <span className="text-pencil text-sm font-medium">{position + 1}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
