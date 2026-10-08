import { useState } from 'react'
import { PART_OF_SPEECH, type Word } from '../api/solver.ts'
import { countWords } from '../game/polish.ts'
import type { SolverResult } from '../hooks/useSolver.ts'

interface Props {
  result: SolverResult | null
  pending: boolean
  narrowed: boolean
  onEnter?: (word: string) => void
  onShowMore: () => void
}

const describe = (word: Word): string =>
  [...word.partsOfSpeech.map((pos) => PART_OF_SPEECH[pos].full), ...word.qualifiers].join(' · ')

const abbreviate = (word: Word): string =>
  word.partsOfSpeech
    .map((pos) => PART_OF_SPEECH[pos].short)
    .filter(Boolean)
    .join('/')

const actionButton =
  'focus-visible:outline-ink inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold transition-opacity hover:opacity-85 focus-visible:outline-3 focus-visible:outline-offset-2'

export const Results = ({ result, pending, narrowed, onEnter, onShowMore }: Props) => {
  if (result === null) {
    return <p className="text-pencil">Wczytuję słownik…</p>
  }

  if (result.status === 'error') {
    return (
      <section className="border-margin bg-paper max-w-xl rounded-lg border-2 p-5">
        <h2 className="text-xl font-bold">Brak połączenia z serwerem podpowiedzi</h2>
        <p className="mt-2">
          Uruchom backend poleceniem <code className="bg-grid rounded px-1.5 py-0.5">./gradlew bootRun</code>, a
          ściąga sama spróbuje ponownie przy następnej zmianie.
        </p>
        <p className="text-pencil mt-2 text-sm">{result.message}</p>
      </section>
    )
  }

  const { total, words } = result.response

  return (
    <section aria-live="polite" className={`min-w-0 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      <Heading total={total} narrowed={narrowed} />
      {words.length > 0 && (
        <Suggestions key={`${words[0]?.text}:${total}`} words={words} total={total} onEnter={onEnter} />
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

interface SuggestionsProps {
  words: Word[]
  total: number
  onEnter?: (word: string) => void
}

const Suggestions = ({ words, total, onEnter }: SuggestionsProps) => {
  const [index, setIndex] = useState(0)
  const position = index % words.length
  const featured = words[position]!
  const others = words.filter((word) => word !== featured)

  return (
    <>
      <div className="border-ink/15 bg-paper mt-5 rounded-xl border-2 p-5">
        <p className="text-pencil text-sm font-medium">
          {total === 1
            ? 'Hasło to najpewniej'
            : position === 0
              ? 'Najlepszy następny strzał'
              : `Propozycja ${position + 1} z ${words.length}`}
        </p>
        <p className="mt-2 text-[clamp(2rem,9vw,3rem)] leading-tight font-extrabold tracking-[0.18em] break-all uppercase">
          {featured.text}
        </p>
        <p className="text-pencil text-sm">{describe(featured)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {words.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((current) => current + 1)}
              className={`${actionButton} border-ink/25 text-ink border-2`}
            >
              <RefreshIcon />
              Inna propozycja
            </button>
          )}
          {onEnter && (
            <button type="button" onClick={() => onEnter(featured.text)} className={`${actionButton} bg-ink text-paper`}>
              Wpisz na planszę
            </button>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Pozostałe pasujące słowa">
          {others.map((word) => (
            <li key={word.text}>
              <WordChip word={word} onEnter={onEnter} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

const WordChip = ({ word, onEnter }: { word: Word; onEnter?: (word: string) => void }) => {
  const content = (
    <>
      <span className="font-semibold tracking-wider uppercase">{word.text}</span>
      <span className="text-pencil text-xs">{word.rare ? word.qualifiers.join(', ') : abbreviate(word)}</span>
    </>
  )
  const style = `border-ink/15 bg-paper flex items-baseline gap-1.5 rounded-md border px-2.5 py-1.5 ${word.rare ? 'text-pencil' : ''}`

  return onEnter ? (
    <button
      type="button"
      title={describe(word)}
      onClick={() => onEnter(word.text)}
      className={`${style} hover:border-ink/50 focus-visible:outline-ink transition-colors focus-visible:outline-3 focus-visible:outline-offset-1`}
    >
      {content}
    </button>
  ) : (
    <span title={describe(word)} className={style}>
      {content}
    </span>
  )
}

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4" />
  </svg>
)

const Heading = ({ total, narrowed }: { total: number; narrowed: boolean }) => {
  if (total === 0) {
    return (
      <>
        <h2 className="text-3xl font-extrabold">Nic nie pasuje</h2>
        <p className="text-pencil mt-2 max-w-prose">
          Któraś litera jest zaznaczona inaczej niż w grze, albo hasła nie ma w słowniku SGJP. Sprawdź zaznaczenia.
        </p>
      </>
    )
  }

  if (!narrowed) {
    return (
      <>
        <h2 className="text-3xl font-extrabold">Od czego zacząć</h2>
        <p className="text-pencil mt-2 max-w-prose">
          Słowa z najczęstszymi literami spośród {countWords(total)} tej długości. Zaznacz litery z gry, a lista się
          zawęzi.
        </p>
      </>
    )
  }

  return <h2 className="text-3xl font-extrabold">{total === 1 ? 'Zostało jedno słowo' : `Pasuje ${countWords(total)}`}</h2>
}
