ID: 202603282  
Tags: #architecture #frontend

### Core idea

Micro frontends apply microservices thinking to the frontend. You split a large frontend application into independently deployable pieces, each owned by a separate team and composed together at runtime or build time.

### Why it matters

- Enables large teams to work on the same product without stepping on each other
- Each team deploys independently without coordinating a single release
- Teams choose their own tech stack and upgrade at their own pace
- Isolates failures: a broken micro frontend does not crash the entire page

### Key concepts

1. Composition  
   How micro frontends are combined. Can happen at build time (npm packages), server side (server-side includes), or client side (Module Federation, iframes).

2. Module Federation  
   A Webpack/Vite feature that lets one application expose components or modules that other applications load at runtime. No shared npm install; the code loads from a remote URL.

3. Routing  
   Each micro frontend owns a set of routes. A shell application handles top-level routing and loads the correct micro frontend for the current URL.

4. Shared dependencies  
   Loading React twice inflates bundle size. Module Federation lets applications share a single React instance at runtime.

5. Design system  
   A shared component library ensures visual consistency across micro frontends built by different teams.

6. Communication  
   Micro frontends communicate via custom events, shared state in the URL, or a lightweight pub/sub bus. Avoid direct function calls between micro frontends.

7. Shell application  
   The host application that bootstraps the page, handles authentication, and loads the appropriate micro frontends.

### Insight

Micro frontends solve organizational problems more than technical ones. If your team is small, the overhead is not worth it. The architecture makes sense when multiple teams need to deploy the same product independently.

### Examples

1. Module Federation host configuration (Webpack)
```javascript
// webpack.config.js - Host (shell)
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        cart: 'cart@https://cart.example.com/remoteEntry.js',
        profile: 'profile@https://profile.example.com/remoteEntry.js'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
}
```

2. Module Federation remote configuration (Webpack)
```javascript
// webpack.config.js - Remote (Cart micro frontend)
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'cart',
      filename: 'remoteEntry.js',
      exposes: {
        './CartWidget': './src/CartWidget'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
}
```

3. Loading a remote component in the shell
```javascript
import React, { Suspense } from 'react'

const CartWidget = React.lazy(() => import('cart/CartWidget'))

function Header() {
  return (
    <header>
      <nav>...</nav>
      <Suspense fallback={<div>Loading cart...</div>}>
        <CartWidget />
      </Suspense>
    </header>
  )
}
```

4. Communication between micro frontends via custom events
```javascript
// Cart micro frontend dispatches an event
window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 3 } }))

// Shell listens for it
window.addEventListener('cart:updated', (e) => {
  updateCartCount(e.detail.count)
})
```

5. Route-based composition in the shell
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const ProductApp = React.lazy(() => import('products/App'))
const CheckoutApp = React.lazy(() => import('checkout/App'))

function Shell() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/products/*" element={<ProductApp />} />
          <Route path="/checkout/*" element={<CheckoutApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Common patterns

- Use Module Federation for runtime composition without npm install
- Share React and React DOM as singletons to avoid duplicate instances
- Own routing per micro frontend and delegate top-level routing to the shell
- Use custom events or URL state for cross-micro-frontend communication
- Build and deploy each micro frontend through its own CI/CD pipeline

### Common mistakes

- Applying micro frontends to a small team with one codebase
- Loading React separately in each micro frontend, doubling the bundle size
- Using direct imports between micro frontends, creating tight coupling
- Sharing too much state between micro frontends, defeating the isolation goal
- Not versioning the interface contract between shell and remotes, causing runtime breaks
