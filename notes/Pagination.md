ID: 202603283  
Tags: #performance #ux

### Core idea

Pagination splits a large dataset into smaller pages or chunks, delivering only a subset of records at a time. The goal is to avoid loading and rendering thousands of items at once.

### Why it matters

- Reduces server load and database query cost
- Improves initial page load time
- Prevents the browser from rendering large lists that slow down the UI
- Provides a more manageable user experience for large datasets

### Key concepts

1. Offset pagination  
   Uses skip and limit (or page and pageSize). The server returns records starting from a position. Simple to implement but can return inconsistent results if data changes between pages.

2. Cursor-based pagination  
   Uses a pointer (cursor) to the last fetched record. The next request starts after that cursor. More stable for real-time data because it is not affected by insertions or deletions.

3. Infinite scroll  
   Loads the next page automatically when the user scrolls near the bottom. No explicit page navigation. Common in social feeds.

4. Load more  
   A button that appends the next page to the existing list. Explicit user control. Less disorienting than infinite scroll.

5. Page-based navigation  
   Classic numbered pages. Users can jump to any page. Better for structured content like search results.

6. Total count  
   Counting total records for offset pagination is expensive on large tables. Cursor-based pagination avoids this by not needing a total.

### Insight

Cursor-based pagination is harder to implement but works better for dynamic data and large datasets. Use offset pagination for admin tables or search results where users need to jump to a specific page.

### Examples

1. Offset pagination API call
```javascript
async function fetchUsers(page, pageSize = 20) {
  const offset = (page - 1) * pageSize
  const res = await fetch(`/api/users?limit=${pageSize}&offset=${offset}`)
  return res.json()
}
```

2. Page-based UI
```javascript
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span>{currentPage} / {totalPages}</span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  )
}
```

3. Infinite scroll with React Query
```javascript
import { useInfiniteQuery } from '@tanstack/react-query'

function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined
  })

  return (
    <div>
      {data?.pages.flatMap(page => page.posts).map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
```

4. Cursor-based pagination API
```javascript
async function fetchPosts(cursor) {
  const params = cursor ? `?cursor=${cursor}` : ''
  const res = await fetch(`/api/posts${params}`)
  return res.json() // returns { posts, nextCursor }
}
```

5. URL-driven pagination
```javascript
import { useSearchParams } from 'react-router-dom'

function UserList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')

  const { data } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page)
  })

  return (
    <div>
      {data?.users.map(u => <div key={u.id}>{u.name}</div>)}
      <button onClick={() => setSearchParams({ page: page + 1 })}>Next</button>
    </div>
  )
}
```

### Common patterns

- Store page state in the URL so users can share and bookmark their position
- Use React Query's useInfiniteQuery for infinite scroll
- Prefetch the next page while the user is on the current page
- Use cursor-based pagination for feeds or frequently updated datasets
- Add a loading skeleton that matches the item layout to prevent layout shift

### Common mistakes

- Loading all data and paginating on the client instead of the server
- Not handling the case where the dataset changes while the user is paginating
- Using offset pagination for real-time data where records are inserted frequently
- Not preserving scroll position when navigating back from a detail page
- Forgetting to reset to page 1 when filters or search terms change
