ID: 202603288  
Tags: #react #nextjs #performance

### Core idea

React Server Components (RSC) run only on the server. They fetch data, render HTML, and send it to the client without adding JavaScript to the browser bundle. Client Components run in the browser and handle interactivity.

### Why it matters

- Reduces client JavaScript bundle size
- Moves data fetching to the server, closer to the database
- Eliminates client-server waterfalls for initial data
- Lets you use server-only resources (databases, file system, secrets) directly in components

### Key concepts

1. Server Component  
   A component that runs on the server. Cannot use useState, useEffect, or browser APIs. Can be async. Sends no JavaScript to the client.

2. Client Component  
   A component marked with "use client". Runs in the browser. Handles events, state, and side effects. The JavaScript ships to the browser.

3. The boundary  
   Server and Client Components form a tree. Client Components can import other Client Components. Server Components cannot import Client Components without placing them as children via props.

4. Composition pattern  
   Server Components pass Client Components as children or props. The Server Component controls the data; the Client Component controls the interaction.

5. Direct database access  
   Server Components can query a database directly because they never expose that code to the browser.

6. Streaming  
   Combined with Suspense, Server Components stream HTML to the browser as they finish rendering, instead of waiting for all data.

7. "use server"  
   Marks server-only functions as callable from Client Components. Used for form actions and mutations that run on the server.

### Insight

The key mental model shift: by default everything is a Server Component. You opt into the browser by adding "use client". Minimize Client Components to only the parts that need interactivity.

### Examples

1. Basic Server Component fetching data
```javascript
// app/users/page.js - Server Component by default
async function UsersPage() {
  const users = await db.query('SELECT * FROM users')

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  )
}

export default UsersPage
```

2. Client Component for interactivity
```javascript
'use client'

import { useState } from 'react'

function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false)

  return (
    <button onClick={() => setLiked(l => !l)}>
      {liked ? 'Liked' : 'Like'}
    </button>
  )
}
```

3. Composition: Server Component wraps Client Component
```javascript
// Server Component
async function PostPage({ postId }) {
  const post = await fetchPost(postId)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <LikeButton postId={postId} />
    </article>
  )
}
```

4. Passing server data to a Client Component
```javascript
// Server Component
async function Dashboard() {
  const stats = await fetchStats()
  return <StatsChart data={stats} />
}

// Client Component
'use client'
function StatsChart({ data }) {
  return <canvas>{/* render chart with data */}</canvas>
}
```

5. Server Action with "use server"
```javascript
// Server Component with a form
async function CreatePost() {
  async function handleSubmit(formData) {
    'use server'
    const title = formData.get('title')
    await db.insert({ title })
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

6. Streaming with Suspense
```javascript
import { Suspense } from 'react'

async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading data...</div>}>
        <SlowDataComponent />
      </Suspense>
    </div>
  )
}
```

### Common patterns

- Keep Server Components as the default; add "use client" only when needed
- Push data fetching as close to where the data is used as possible
- Use Suspense boundaries to stream slow data independently
- Pass serializable data (not functions) from Server to Client Components
- Use Server Actions for mutations instead of API routes when possible

### Common mistakes

- Adding "use client" at the root level, converting the whole tree to client
- Importing a Client Component into a Server Component without using the composition pattern
- Passing non-serializable values (functions, class instances) from server to client
- Fetching data in a Client Component that should run on the server
- Using Server Components for interactive elements that need useState or event handlers
