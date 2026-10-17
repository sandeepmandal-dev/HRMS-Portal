import { useCallback, useEffect, useState } from 'react'

/**
 * Minimal async-data hook (no React Query dependency by design — this app's data
 * needs are simple enough that a heavier cache layer isn't worth the bundle weight).
 * `deps` re-triggers the fetch, matching useEffect's dependency semantics.
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const run = useCallback(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    asyncFn()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => run(), [run])

  return { data, error, isLoading, refetch: run, setData }
}
