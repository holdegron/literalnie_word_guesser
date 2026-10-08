import { useMemo, useReducer, useState } from 'react'
import type { SolveRequest } from './api/solver.ts'
import { Board } from './components/Board.tsx'
import { Keyboard } from './components/Keyboard.tsx'
import { LettersPanel } from './components/LettersPanel.tsx'
import { Results } from './components/Results.tsx'
import { MARK_STYLE } from './components/tiles.ts'
import {
  activeRowIndex,
  boardReducer,
  DEFAULT_LENGTH,
  emptyBoard,
  letterMarks,
  type Mark,
  MAX_LENGTH,
  MIN_LENGTH,
  toGuesses,
} from './game/board.ts'
import { emptyLetters, isEmpty, lettersReducer, toLettersRequest } from './game/letters.ts'
import { countWords } from './game/polish.ts'
import { useKeyboardInput } from './hooks/useKeyboardInput.ts'
import { useSolver } from './hooks/useSolver.ts'

const PAGE_SIZE = 120

type Mode = 'letters' | 'board'

const MODES: readonly [Mode, string][] = [
  ['letters', 'Znane litery'],
  ['board', 'Plansza z próbami'],
]

const LEGEND: readonly [Mark, string][] = [
  ['ABSENT', 'litery nie ma'],
  ['PRESENT', 'jest gdzie indziej'],
  ['CORRECT', 'na swoim miejscu'],
]

const stepperButton =
  'border-ink/20 bg-paper hover:bg-grid focus-visible:outline-ink size-9 rounded-md border text-lg font-semibold focus-visible:outline-3 focus-visible:outline-offset-1 disabled:opacity-30'

export const App = () => {
  const [mode, setMode] = useState<Mode>('letters')
  const [board, dispatchBoard] = useReducer(boardReducer, DEFAULT_LENGTH, emptyBoard)
  const [letters, dispatchLetters] = useReducer(lettersReducer, DEFAULT_LENGTH, emptyLetters)
  const [limit, setLimit] = useState(PAGE_SIZE)
  useKeyboardInput(dispatchBoard, mode === 'board')

  const length = board.length
  const guesses = useMemo(() => toGuesses(board), [board])
  const boardMarks = useMemo(() => letterMarks(board), [board])
  const request: SolveRequest =
    mode === 'board' ? { length, guesses, limit } : { length, guesses: [], letters: toLettersRequest(letters), limit }
  const { result, pending } = useSolver(request)

  const response = result?.status === 'ok' ? result.response : undefined
  const narrowed = mode === 'board' ? guesses.length > 0 : !isEmpty(letters)
  const canEnter = mode === 'board' && activeRowIndex(board) !== null

  const resize = (newLength: number) => {
    dispatchBoard({ type: 'resize', length: newLength })
    dispatchLetters({ type: 'resize', length: newLength })
  }
  const reset = () => (mode === 'board' ? dispatchBoard({ type: 'reset' }) : dispatchLetters({ type: 'reset' }))

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="bg-margin pointer-events-none fixed inset-y-0 left-8 hidden w-0.5 sm:block lg:left-12" />

      <div className="px-4 pt-8 pb-12 sm:pr-8 sm:pl-16 lg:pr-12 lg:pl-20">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Ściąga do Literalnie</h1>
            <p className="text-pencil mt-2 max-w-xl">
              Zaznacz, które litery są na swoim miejscu, które są w słowie, a których nie ma. Ściąga przeszuka słownik
              i pokaże słowa, które wciąż pasują.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2" role="group" aria-label="Liczba liter w haśle">
              <span className="text-pencil text-sm">Liter w haśle</span>
              <button
                type="button"
                className={stepperButton}
                disabled={length <= MIN_LENGTH}
                onClick={() => resize(length - 1)}
                aria-label="Mniej liter"
              >
                −
              </button>
              <output className="w-6 text-center text-xl font-bold" aria-live="polite">
                {length}
              </output>
              <button
                type="button"
                className={stepperButton}
                disabled={length >= MAX_LENGTH}
                onClick={() => resize(length + 1)}
                aria-label="Więcej liter"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-pencil hover:text-ink text-sm font-medium underline underline-offset-4"
            >
              Wyczyść
            </button>
          </div>
        </header>

        <main className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-14">
          <section aria-label="Co wiesz o haśle" className="flex min-w-0 flex-col items-start gap-5">
            <div role="tablist" aria-label="Sposób wpisywania" className="border-ink/15 bg-paper inline-flex rounded-lg border p-1">
              {MODES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => setMode(value)}
                  className={`focus-visible:outline-ink rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-3 ${
                    mode === value ? 'bg-ink text-paper' : 'text-pencil hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="font-hand text-pencil h-7 -rotate-2 text-2xl leading-none whitespace-nowrap">
              {response && `na start: ${countWords(response.funnel[0] ?? 0)}`}
              {response && mode === 'letters' && narrowed && ` → zostało ${response.total.toLocaleString('pl-PL')}`}
            </p>

            {mode === 'letters' ? (
              <LettersPanel letters={letters} dispatch={dispatchLetters} />
            ) : (
              <>
                <p className="text-pencil -mt-2 max-w-md text-sm">
                  Przepisz słowa wpisane w grze i klikaj ich kafelki, aż kolory będą takie jak w grze.
                </p>
                <Board board={board} funnel={response?.funnel} stale={pending} dispatch={dispatchBoard} />
                <ul className="text-pencil flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {LEGEND.map(([mark, label]) => (
                    <li key={mark} className="flex items-center gap-1.5">
                      <span className={`size-3.5 rounded-sm border ${MARK_STYLE[mark]}`} />
                      {label}
                    </li>
                  ))}
                </ul>
                <Keyboard
                  marks={boardMarks}
                  onLetter={(letter) => dispatchBoard({ type: 'type', letter })}
                  onErase={() => dispatchBoard({ type: 'erase' })}
                  label="Klawiatura"
                />
              </>
            )}
          </section>

          <Results
            result={result}
            pending={pending}
            narrowed={narrowed}
            onEnter={canEnter ? (word) => dispatchBoard({ type: 'enterWord', word }) : undefined}
            onShowMore={() => setLimit((current) => current + PAGE_SIZE)}
          />
        </main>

        <footer className="text-pencil mt-16 text-sm">
          Nieoficjalny pomocnik, niezwiązany z twórcami gry Literalnie. Słownik:{' '}
          <a className="hover:text-ink underline underline-offset-4" href="https://morfeusz.sgjp.pl/doc/license/">
            SGJP
          </a>{' '}
          (Woliński, Saloni i in.), licencja BSD-2.
        </footer>
      </div>
    </div>
  )
}
