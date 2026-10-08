import { type Dispatch, useEffect } from 'react'
import { isLetter } from '../game/alphabet.ts'
import type { BoardAction } from '../game/board.ts'

export const useKeyboardInput = (dispatch: Dispatch<BoardAction>, enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.defaultPrevented) return
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'Backspace') {
        event.preventDefault()
        dispatch({ type: 'erase' })
      } else if (isLetter(event.key)) {
        dispatch({ type: 'type', letter: event.key.toLowerCase() })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, enabled])
}
