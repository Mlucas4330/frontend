ID: 202603277  
Tags: #react #performance

### Core idea

Rendering strategies define when and where a React app generates HTML: in the browser, on the server at request time, or at build time. Choosing the right strategy directly affects performance, SEO, and user experience.

### Why it matters

- Improves perceived performance and reduces load times
- Enables SEO when HTML is generated before the browser receives it
- Prevents unnecessary re-renders, saving CPU and memory
- Determines how fast users see content and interact with the page

### Key concepts

1. Client-side rendering (CSR)  
   The browser receives a minimal HTML shell and builds the UI using JavaScript. Initial load is slower because the browser must download and execute JS before rendering.

2. Server-side rendering (SSR)  
   The server generates full HTML for each request and sends it to the browser. React then hydrates the HTML to make it interactive. Improves time-to-first-byte and SEO.

3. Static site generation (SSG)  
   HTML pages are generated once at build time. Fastest delivery since files are served from CDN with no server computation per request. Best for content that rarely changes.

4. Incremental static regeneration (ISR)  
   Pages are pre-rendered at build time but regenerated in the background when the cache expires. Combines SSG speed with periodic freshness.

5. Partial pre-rendering (PPR)  
   A static shell is served instantly while dynamic parts stream in. Introduced in Next.js 14. Combines SSG and SSR in a single response.

6. Hydration  
   After SSR or SSG, React attaches event listeners and restores component state to make the static HTML interactive.

7. Lazy rendering  
   Components load only when needed using React.lazy and Suspense. Reduces the initial bundle size.

8. Memoization  
   React.memo, useMemo, and useCallback prevent re-renders when props or values have not changed.

### Insight

Pick the rendering strategy based on how often content changes and how critical SEO and initial load speed are. Most applications benefit from using SSG for static pages, SSR for user-specific pages, and CSR for highly interactive sections.

### Examples

1. Client-side rendering
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
```

2. Server-side rendering with Next.js (Pages Router)
```javascript
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()
  return { props: { data } }
}

function Page({ data }) {
  return <div>{data.title}</div>
}

export default Page
```

3. Static site generation with Next.js (Pages Router)
```javascript
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()
  return { props: { data } }
}

function Page({ data }) {
  return <div>{data.title}</div>
}

export default Page
```

4. Incremental static regeneration
```javascript
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()
  return { props: { data }, revalidate: 60 }
}
```

5. Lazy rendering with React.lazy
```javascript
import React, { Suspense } from 'react'

const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

6. Conditional rendering
```javascript
function UserGreeting({ isLoggedIn }) {
  return isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in.</h1>
}
```

7. Memoization to avoid re-renders
```javascript
import { useMemo } from 'react'

function ExpensiveComponent({ items }) {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.value, 0),
    [items]
  )

  return <div>Total: {total}</div>
}
```

### Common patterns

- Use SSG for marketing pages, blogs, and documentation
- Use SSR for pages with user-specific data or frequent updates
- Use CSR for dashboards and highly interactive UIs behind authentication
- Combine SSR with React Query to hydrate server data into client cache
- Apply memoization only after profiling, not by default

### Common mistakes

- Using SSR for every page regardless of whether content is dynamic
- Hydrating the entire page when only part of it is interactive
- Not memoizing components that receive the same props on every parent render
- Using CSR for public pages that need SEO
- Applying memoization prematurely before identifying actual re-render problems
