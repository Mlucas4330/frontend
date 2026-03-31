ID: 202603287  
Tags: #react #performance #ssr

### Core idea

SSR (Server-Side Rendering) generates HTML on the server for each request and sends it to the browser. Hydration is the process where React takes that static HTML and attaches event listeners to make it interactive.

### Why it matters

- Users see content faster because HTML arrives pre-rendered
- Search engines index content without executing JavaScript
- Improves LCP (Largest Contentful Paint) scores
- Required for pages that depend on user-specific data at load time

### Key concepts

1. Server-Side Rendering  
   The server runs your React components, generates HTML, and sends it to the browser with the full content already present. The browser can display it before any JavaScript runs.

2. Hydration  
   After the browser receives the server-rendered HTML, React downloads the JavaScript bundle and "hydrates" the page by attaching event listeners and making components interactive.

3. Hydration mismatch  
   If the HTML generated on the server differs from what React would generate on the client, React throws a warning and re-renders from scratch on the client. Common causes: dates, random values, browser-only APIs.

4. Time to First Byte (TTFB)  
   The time from request to first byte of the response. Critical in SSR because the server must compute the HTML before sending anything.

5. Streaming SSR  
   Instead of waiting for the entire page to render, the server sends HTML in chunks. React 18 supports streaming with Suspense boundaries.

6. Selective hydration  
   React 18 prioritizes hydrating components the user interacts with first, rather than hydrating the entire tree in order.

7. dehydrate / hydrate  
   Used by React Query and similar libraries to serialize server-fetched data into the HTML so the client cache starts populated, avoiding a second fetch.

### Insight

The biggest cost of SSR is the time between the browser receiving HTML and finishing hydration. During this window, the page looks interactive but is not. Streaming SSR with React 18 reduces this by hydrating in chunks.

### Examples

1. Basic SSR with Next.js App Router
```javascript
// app/page.tsx - runs on the server by default
async function Page() {
  const data = await fetch('https://api.example.com/posts').then(r => r.json())

  return (
    <ul>
      {data.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}

export default Page
```

2. SSR with getServerSideProps (Pages Router)
```javascript
export async function getServerSideProps(context) {
  const { params } = context
  const data = await fetch(`https://api.example.com/posts/${params.id}`).then(r => r.json())

  return { props: { post: data } }
}

function PostPage({ post }) {
  return <article>{post.title}</article>
}

export default PostPage
```

3. Streaming SSR with Suspense
```javascript
import { Suspense } from 'react'

function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading feed...</div>}>
        <Feed />
      </Suspense>
    </div>
  )
}
```

4. Hydrating React Query data from server
```javascript
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  )
}
```

5. Avoiding hydration mismatch
```javascript
// Bad: different output on server vs client
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>
}

// Good: render on client only
function Timestamp() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <span>{new Date().toLocaleString()}</span>
}
```

### Common patterns

- Use the App Router (Next.js 13+) for automatic SSR by default
- Wrap slow components in Suspense to enable streaming
- Prefetch data on the server and pass it to the client via HydrationBoundary
- Keep client components small and push data fetching to server components
- Use suppressHydrationWarning for elements that intentionally differ between server and client

### Common mistakes

- Using browser-only APIs (window, document) directly in server-rendered components
- Relying on random values or Date.now() during render without seeding from the server
- Fetching data on the client that should have been fetched on the server
- Not wrapping dynamic parts in Suspense, blocking the full page render
- Ignoring hydration warnings instead of finding their root cause
