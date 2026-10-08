import { PART_OF_SPEECH, type Word } from '../api/solver.ts'
import { countWords } from '../game/polish.ts'
import type { SolverResult } from '../hooks/useSolver.ts'

interface Props {
  result: SolverResult | null
  pending: boolean
  hasGuesses: boolean
  canEnter: boolean
  onEnter: (word: string) => void
  onShowMore: () => void
}

const describe = (word: Word): string =>
  [...word.partsOfSpeech.map((pos) => PART_OF_SPEECH[pos].full), ...word.qualifiers].join(' · ')

const abbreviate = (word: Word): string =>
  word.partsOfSpeech
    .map((pos) => PART_OF_SPEECH[pos].short)
    .filter(Boolean)
    .join('/')

export const Results = ({ result, pending, hasGuesses, canEnter, onEnter, onShowMore }: Props) => {
  if (result === null) {
    return <p className="text-pencil">Wczytuję słownik…</p>
  }

  if (result.status === 'error') {
    return (
      <section className="border-margin bg-paper max-w-xl rounded-lg border-2 p-5">
        <h2 className="text-xl font-bold">Brak połączenia z serwerem podpowiedzi</h2>
        <p className="mt-2">
          Uruchom backend poleceniem <code className="bg-grid rounded px-1.5 py-0.5">./gradlew bootRun</code>, a
          ściąga sama spróbuje ponownie przy następnej zmianie na planszy.
        </p>
        <p className="text-pencil mt-2 text-sm">{result.message}</p>
      </section>
    )
  }

  const { total, words } = result.response
  const [best, ...rest] = words

  return (
    <section aria-live="polite" className={`min-w-0 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      <Heading total={total} hasGuesses={hasGuesses} />

      {best && (
        <div className="border-ink/15 bg-paper mt-5 rounded-xl border-2 p-5">
          <p className="text-pencil text-sm font-medium">{total === 1 ? 'Hasło to najpewniej' : 'Najlepszy następny strzał'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
            <p className="text-4xl font-extrabold tracking-[0.2em] uppercase sm:text-5xl">{best.text}</p>
            <button
              type="button"
              disabled={!canEnter}
              onClick={() => onEnter(best.text)}
              className="bg-ink text-paper focus-visible:outline-ink rounded-md px-4 py-2 font-semibold transition-opacity hover:opacity-85 focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-30"
            >
              Wpisz na planszę
            </button>
          </div>
          <p className="text-pencil mt-2 text-sm">{describe(best)}</p>
        </div>
      )}

      {rest.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Pozostałe pasujące słowa">
          {rest.map((word) => (
            <li key={word.text}>
              <button
                type="button"
                title={describe(word)}
                disabled={!canEnter}
                onClick={() => onEnter(word.text)}
                className={`border-ink/15 bg-paper hover:border-ink/50 focus-visible:outline-ink flex items-baseline gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 disabled:cursor-default ${
                  word.rare ? 'text-pencil' : ''
                }`}
              >
                <span className="font-semibold tracking-wider uppercase">{word.text}</span>
                <span className="text-pencil text-xs">{word.rare ? word.qualifiers.join(', ') : abbreviate(word)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {words.length < total && (
        <button
          type="button"
          onClick={onShowMore}
          className="text-pencil hover:text-ink mt-5 text-sm font-medium underline underline-offset-4"
        >
          Pokaż kolejne (jest jeszcze {countWords(total - words.length)})
        </button>
      )}
    </section>
  )
}

const Heading = ({ total, hasGuesses }: { total: number; hasGuesses: boolean }) => {
  if (total === 0) {
    return (
      <>
        <h2 className="text-3xl font-extrabold">Nic nie pasuje</h2>
        <p className="text-pencil mt-2 max-w-prose">
          Sprawdź kolory kafelków: jeden zły kolor wystarczy, żeby odrzucić hasło. Słowa może też nie być w
          słowniku SGJP.
        </p>
      </>
    )
  }

  if (!hasGuesses) {
    return (
      <>
        <h2 className="text-3xl font-extrabold">Od czego zacząć</h2>
        <p className="text-pencil mt-2 max-w-prose">
          Słowa z najczęstszymi literami spośród {countWords(total)} tej długości. Wpisz pierwszą próbę z gry, a
          lista się zawęzi.
        </p>
      </>
    )
  }

  return <h2 className="text-3xl font-extrabold">{total === 1 ? 'Zostało jedno słowo' : `Pasuje ${countWords(total)}`}</h2>
}
