ID: 202603286  
Tags: #react #data-fetching

### Core idea

React Query manages server state in React applications. It handles fetching, caching, synchronizing, and updating data from APIs. You describe what data you need and React Query handles when and how to fetch it.

### Why it matters

- Eliminates boilerplate from manual fetch + useState + useEffect patterns
- Provides automatic caching, deduplication, and background refetching
- Handles loading, error, and stale states out of the box
- Separates server state from UI state, which belong in different systems

### Key concepts

1. Server state  
   Data that lives on a remote server and must be fetched. It is asynchronous, can be stale, and needs synchronization. Different from UI state, which is synchronous and owned by the client.

2. Query  
   A request to read data. Defined by a query key (cache identifier) and a query function. React Query caches results by key.

3. Query key  
   A unique identifier for a query. React Query uses it to cache results and track when to refetch. Keys are arrays: ['user', userId].

4. Stale time  
   How long cached data is considered fresh. React Query refetches stale data when you revisit a page, switch browser tabs, or reconnect to the internet.

5. Mutation  
   A request to write, update, or delete data. Separate from queries. Mutations trigger refetches on related queries to keep the cache in sync.

6. Query invalidation  
   Marking cached data as stale so it refetches on next use. Call queryClient.invalidateQueries after a mutation.

7. Prefetching  
   Loading data before the user navigates to a page. Improves perceived performance.

### Insight

The biggest mistake when adopting React Query is continuing to put server data into useState. Once you use React Query, server state lives in the cache. Local component state is only for UI: form inputs, modals, toggles.

### Examples

1. Basic query
```javascript
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json())
  })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load user</div>

  return <div>{data.name}</div>
}
```

2. Mutation with cache invalidation
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function UpdateUserForm({ userId }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    }
  })

  return (
    <button onClick={() => mutation.mutate({ name: 'New Name' })}>
      Update
    </button>
  )
}
```

3. QueryClient provider setup
```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
```

4. Configuring stale time and retry behavior
```javascript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 2
})
```

5. Prefetching on hover
```javascript
const queryClient = useQueryClient()

function PostLink({ postId }) {
  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId)
    })
  }

  return <a href={`/posts/${postId}`} onMouseEnter={prefetch}>Read more</a>
}
```

6. Dependent queries
```javascript
function UserPosts({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchUserPosts(user.id),
    enabled: !!user
  })

  return posts?.map(p => <div key={p.id}>{p.title}</div>)
}
```

### Common patterns

- Use staleTime to prevent unnecessary refetches for slow-changing data
- Invalidate queries after mutations to keep data fresh
- Use queryKey arrays with specific IDs to scope cache entries
- Use enabled to block queries that depend on previous results
- Prefetch data on hover or on route transition

### Common mistakes

- Copying server data from React Query into useState
- Using useEffect + fetch instead of useQuery
- Using a single generic query key like ['data'] for all queries
- Not invalidating queries after mutations, leaving the cache stale
- Setting staleTime: 0 globally and causing too many background refetches
