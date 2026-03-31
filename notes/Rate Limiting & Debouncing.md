ID: 202603285  
Tags: #performance #patterns

### Core idea

Debouncing and throttling control how often a function runs in response to rapid events. Rate limiting controls how many requests a client sends to a server. All three prevent overload from high-frequency triggers.

### Why it matters

- Prevents unnecessary API calls from search inputs, scroll events, or resize handlers
- Reduces server load and avoids hitting API rate limits
- Improves perceived performance by reducing flicker from rapid updates
- Protects infrastructure from abusive or accidental high request rates

### Key concepts

1. Debounce  
   Delays a function call until after a specified wait period with no new triggers. The timer resets on each new event. Fires once when the user stops acting.

2. Throttle  
   Allows a function to run at most once per time interval, regardless of how many times it is triggered. Fires regularly while the user is acting.

3. Debounce vs throttle  
   Use debounce when you want to wait for the user to stop (search input). Use throttle when you want to fire periodically while the user is active (scroll, resize).

4. Rate limiting  
   Server-side enforcement of maximum requests per time window per client. Returns 429 Too Many Requests when the limit is exceeded.

5. Exponential backoff  
   A retry strategy where each retry waits longer than the previous one. Used when a request fails with 429 or 5xx.

6. Leading vs trailing  
   A debounced function fires on the leading edge (first call) or the trailing edge (last call) of a burst. Trailing is the default and most common.

### Insight

Debounce search inputs at 300-500ms for a natural feel. Shorter than 300ms fires too often. Longer than 500ms feels slow. Throttle scroll and resize events at 100-200ms.

### Examples

1. Debounce with a custom hook
```javascript
import { useEffect, useState } from 'react'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

2. Debounced search input
```javascript
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery)
  }, [debouncedQuery])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
```

3. Debounce with lodash
```javascript
import { debounce } from 'lodash'
import { useCallback } from 'react'

function SearchInput() {
  const search = useCallback(
    debounce((value) => fetchResults(value), 400),
    []
  )

  return <input onChange={e => search(e.target.value)} />
}
```

4. Throttle with lodash
```javascript
import { throttle } from 'lodash'
import { useCallback } from 'react'

function ScrollTracker() {
  const handleScroll = useCallback(
    throttle(() => {
      console.log('scroll position:', window.scrollY)
    }, 150),
    []
  )

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return null
}
```

5. Exponential backoff on 429
```javascript
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url)
    if (res.status === 429) throw new Error('Rate limited')
    return res.json()
  } catch (err) {
    if (retries === 0) throw err
    await new Promise(resolve => setTimeout(resolve, delay))
    return fetchWithRetry(url, retries - 1, delay * 2)
  }
}
```

6. Server-side rate limiting with Express
```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please try again later.'
})

app.use('/api/', limiter)
```

### Common patterns

- Debounce search inputs and form validation that triggers API calls
- Throttle scroll, resize, and mousemove event handlers
- Use useCallback to wrap debounced functions so they are not recreated on each render
- Apply rate limiting at the API gateway or reverse proxy level
- Return Retry-After headers with 429 responses so clients know when to retry

### Common mistakes

- Recreating a debounced function inside a component without useCallback (resets the timer on every render)
- Using debounce where throttle is correct (e.g., live position tracking)
- Not cleaning up the debounce timer on unmount
- Setting debounce delay too short (under 200ms) and still firing on every keystroke
- Not handling 429 errors and retrying immediately, making the problem worse
