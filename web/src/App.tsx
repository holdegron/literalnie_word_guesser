import { useMemo, useReducer, useState } from 'react'
import { Board } from './components/Board.tsx'
import { Keyboard } from './components/Keyboard.tsx'
import { MARK_STYLE } from './components/marks.ts'
import { Results } from './components/Results.tsx'
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
import { countWords } from './game/polish.ts'
import { useKeyboardInput } from './hooks/useKeyboardInput.ts'
import { useSolver } from './hooks/useSolver.ts'

const PAGE_SIZE = 120

const LEGEND: readonly [Mark, string][] = [
  ['ABSENT', 'litery nie ma'],
  ['PRESENT', 'jest gdzie indziej'],
  ['CORRECT', 'na swoim miejscu'],
]

const stepperButton =
  'border-ink/20 bg-paper hover:bg-grid focus-visible:outline-ink size-9 rounded-md border text-lg font-semibold focus-visible:outline-3 focus-visible:outline-offset-1 disabled:opacity-30'

export const App = () => {
  const [board, dispatch] = useReducer(boardReducer, DEFAULT_LENGTH, emptyBoard)
  const [limit, setLimit] = useState(PAGE_SIZE)
  useKeyboardInput(dispatch)

  const guesses = useMemo(() => toGuesses(board), [board])
  const marks = useMemo(() => letterMarks(board), [board])
  const { result, pending } = useSolver({ length: board.length, guesses, limit })
  const funnel = result?.status === 'ok' ? result.response.funnel : undefined
  const resize = (length: number) => dispatch({ type: 'resize', length })

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="bg-margin pointer-events-none fixed inset-y-0 left-8 hidden w-0.5 sm:block lg:left-12" />

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:pr-8 sm:pl-16 lg:pl-20">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Ściąga do Literalnie</h1>
            <p className="text-pencil mt-2 max-w-md">
              Przepisz swoje próby z gry i klikaj kafelki, aż kolory będą takie jak w grze. Ściąga pokaże słowa,
              które wciąż pasują.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" role="group" aria-label="Liczba liter w haśle">
              <span className="text-pencil text-sm">Liter w haśle</span>
              <button
                type="button"
                className={stepperButton}
                disabled={board.length <= MIN_LENGTH}
                onClick={() => resize(board.length - 1)}
                aria-label="Mniej liter"
              >
                −
              </button>
              <output className="w-6 text-center text-xl font-bold" aria-live="polite">
                {board.length}
              </output>
              <button
                type="button"
                className={stepperButton}
                disabled={board.length >= MAX_LENGTH}
                onClick={() => resize(board.length + 1)}
                aria-label="Więcej liter"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'reset' })}
              className="text-pencil hover:text-ink text-sm font-medium underline underline-offset-4"
            >
              Wyczyść planszę
            </button>
          </div>
        </header>

        <main className="mt-10 grid gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
          <section aria-label="Twoje próby" className="flex flex-col items-start gap-5">
            <p className="font-hand text-pencil h-7 -rotate-2 text-2xl leading-none">
              {funnel?.[0] !== undefined && `na start: ${countWords(funnel[0])}`}
            </p>

            <Board board={board} funnel={funnel} stale={pending} dispatch={dispatch} />

            <ul className="text-pencil flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {LEGEND.map(([mark, label]) => (
                <li key={mark} className="flex items-center gap-1.5">
                  <span className={`size-3.5 rounded-sm border ${MARK_STYLE[mark]}`} />
                  {label}
                </li>
              ))}
            </ul>

            <Keyboard marks={marks} dispatch={dispatch} />
          </section>

          <Results
            result={result}
            pending={pending}
            hasGuesses={guesses.length > 0}
            canEnter={activeRowIndex(board) !== null}
            onEnter={(word) => dispatch({ type: 'enterWord', word })}
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
