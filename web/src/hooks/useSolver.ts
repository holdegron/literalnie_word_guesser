import { useEffect, useState } from 'react'
import { solve, type SolveRequest, type SolveResponse } from '../api/solver.ts'

const DEBOUNCE_MS = 150

export type SolverResult = { status: 'ok'; response: SolveResponse } | { status: 'error'; message: string }

interface Settled {
  key: string
  result: SolverResult
}

export const useSolver = (request: SolveRequest): { result: SolverResult | null; pending: boolean } => {
  const key = JSON.stringify(request)
  const [settled, setSettled] = useState<Settled | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      solve(JSON.parse(key) as SolveRequest, controller.signal)
        .then((response) => setSettled({ key, result: { status: 'ok', response } }))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          const message = error instanceof Error ? error.message : String(error)
          setSettled({ key, result: { status: 'error', message } })
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [key])

  return { result: settled?.result ?? null, pending: settled?.key !== key }
}
