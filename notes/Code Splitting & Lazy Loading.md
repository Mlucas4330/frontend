ID: 202603272  
Tags: #performance #react

### Core idea

Code splitting and lazy loading reduce the initial JavaScript bundle by loading code only when it is needed. The browser downloads less code upfront, which improves load time.

### Why it matters

- Reduces time-to-interactive on first load
- Improves performance on slow networks and low-end devices
- Loads only what the user needs for the current route or interaction
- Keeps bundle size manageable as the application grows

### Key concepts

1. Code splitting  
   Breaking a large JavaScript bundle into smaller chunks. Each chunk is a separate file that loads independently.

2. Lazy loading  
   Loading components or modules only when they are rendered or triggered by user interaction, not on initial page load.

3. React.lazy  
   A built-in React function that wraps a dynamic import. The component loads when React first renders it.

4. Suspense  
   Wraps lazy-loaded components and shows a fallback UI while the component is loading.

5. Dynamic import  
   The import() function loads a module asynchronously at runtime. It is the foundation that React.lazy builds on.

6. Route-based splitting  
   The most impactful split point. Each route loads its own bundle instead of loading all routes at startup.

### Insight

Route-based splitting gives you the most performance gain for the least effort. Splitting individual components inside a route is usually unnecessary unless the component is large and conditionally rendered.

### Examples

1. Basic React.lazy with Suspense
```javascript
import React, { Suspense } from 'react'

const Home = React.lazy(() => import('./Home'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  )
}
```

2. Route-based splitting with React Router
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React, { Suspense } from 'react'

const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

3. Dynamic import without React.lazy
```javascript
function loadChart() {
  import('./Chart').then(module => {
    const Chart = module.default
    // use Chart dynamically
  })
}
```

4. Lazy loading on user interaction
```javascript
import React, { useState } from 'react'

function App() {
  const [Chart, setChart] = useState(null)

  const loadChart = async () => {
    const module = await import('./Chart')
    setChart(() => module.default)
  }

  return (
    <div>
      <button onClick={loadChart}>Load Chart</button>
      {Chart && <Chart />}
    </div>
  )
}
```

5. Named exports with React.lazy
```javascript
const MyComponent = React.lazy(() =>
  import('./module').then(module => ({ default: module.NamedExport }))
)
```

6. Library-level splitting
```javascript
async function processData(data) {
  const { chunk } = await import('lodash')
  return chunk(data, 2)
}
```

### Common patterns

- Split at route boundaries first, then optimize from there
- Place Suspense boundaries as high as possible to avoid multiple loading states
- Preload critical chunks after initial load using import() during idle time
- Use named chunks to make debugging easier
- Split third-party libraries that are only used on specific pages

### Common mistakes

- Lazy loading everything including small components that load faster synchronously
- Placing Suspense too deep in the tree, causing layout shifts
- Not providing a useful fallback in Suspense (showing nothing instead of a loader)
- Code splitting without measuring bundle size impact first
- Forgetting to handle errors when a dynamic import fails
