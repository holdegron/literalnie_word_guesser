import { type Dispatch, useEffect } from 'react'
import { isLetter } from '../game/alphabet.ts'
import type { BoardAction } from '../game/board.ts'

/** Lets the physical keyboard type into the board, Polish letters (AltGr / Option) included. */
export const useKeyboardInput = (dispatch: Dispatch<BoardAction>): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.defaultPrevented) return
      if (event.key === 'Backspace') {
        event.preventDefault()
        dispatch({ type: 'erase' })
      } else if (isLetter(event.key)) {
        dispatch({ type: 'type', letter: event.key.toLowerCase() })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])
}
