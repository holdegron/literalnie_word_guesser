import type { Dispatch } from 'react'
import { activeRowIndex, type Board as BoardState, type BoardAction, isComplete, MAX_ROWS, type Tile } from '../game/board.ts'
import { MARK_NAME, MARK_STYLE, tileBase, tileSizeFor } from './tiles.ts'

interface Props {
  board: BoardState
  funnel: readonly number[] | undefined
  stale: boolean
  dispatch: Dispatch<BoardAction>
}

export const Board = ({ board, funnel, stale, dispatch }: Props) => {
  const active = activeRowIndex(board)
  const columns = Array.from({ length: board.length }, (_, column) => column)

  return (
    <div className="flex flex-col gap-1.5" style={tileSizeFor(board.length)}>
      {Array.from({ length: MAX_ROWS }, (_, rowIndex) => {
        const row = board.rows[rowIndex] ?? []
        const complete = isComplete(board, row)
        const remaining = complete ? funnel?.[rowIndex + 1] : undefined

        return (
          <div key={rowIndex} className="flex items-center gap-1.5">
            {columns.map((column) => {
              const tile = row[column]
              return complete && tile ? (
                <MarkedTile
                  key={column}
                  tile={tile}
                  position={column + 1}
                  onCycle={() => dispatch({ type: 'cycleMark', row: rowIndex, column })}
                />
              ) : (
                <div
                  key={column}
                  aria-hidden
                  className={`${tileBase} ${
                    tile
                      ? 'motion-safe:animate-pop border-ink/70 bg-paper text-ink'
                      : rowIndex === active
                        ? 'border-ink/25 bg-paper'
                        : 'border-ink/10 bg-paper/60'
                  }`}
                >
                  {tile?.letter}
                </div>
              )
            })}
            <span
              className={`font-hand text-pencil w-20 shrink-0 -rotate-3 pl-2 text-2xl leading-none whitespace-nowrap transition-opacity ${
                stale ? 'opacity-40' : ''
              }`}
            >
              {remaining !== undefined && `→ ${remaining.toLocaleString('pl-PL')}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface MarkedTileProps {
  tile: Tile
  position: number
  onCycle: () => void
}

const MarkedTile = ({ tile, position, onCycle }: MarkedTileProps) => (
  <button
    type="button"
    onClick={onCycle}
    aria-label={`${tile.letter.toUpperCase()} na pozycji ${position}: ${MARK_NAME[tile.mark]}. Zmień kolor.`}
    className={`${tileBase} ${MARK_STYLE[tile.mark]} cursor-pointer transition-colors duration-200 hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink`}
  >
    {tile.letter}
  </button>
)
