ID: 202603284  
Tags: #performance #nextjs

### Core idea

Partial Pre-Rendering (PPR) serves a static HTML shell instantly from the CDN while streaming dynamic content into it from the server. A single request delivers both static and dynamic parts of the page.

### Why it matters

- Combines the speed of static delivery with the freshness of server rendering
- Users see the page layout immediately instead of waiting for dynamic data
- Eliminates the choice between static or dynamic at the page level
- Improves LCP and TTFB for pages that mix static and user-specific content

### Key concepts

1. Static shell  
   The parts of the page that do not depend on request-time data. Rendered at build time and served from CDN. Arrives in the initial response instantly.

2. Dynamic holes  
   Sections wrapped in Suspense. These stream in from the server after the static shell is delivered. Rendered per request.

3. Suspense boundary  
   The mechanism that marks dynamic holes. PPR treats each Suspense boundary as a slot that the server fills while the static shell loads.

4. Streaming  
   The server sends the static shell first, then progressively sends the HTML for each Suspense boundary as it resolves.

5. Build-time vs request-time  
   PPR separates what is known at build time (layout, navigation, static content) from what requires a request (user data, cart, notifications).

### Insight

PPR is most useful for pages that are mostly static but contain a few dynamic sections, such as an e-commerce product page with a static description and a dynamic stock count or personalized recommendations.

### Examples

1. Enabling PPR in Next.js (experimental)
```javascript
// next.config.js
module.exports = {
  experimental: {
    ppr: true
  }
}
```

2. Page with static shell and dynamic hole
```javascript
import { Suspense } from 'react'

// This component is static - rendered at build time
function ProductDetails({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />
    </div>
  )
}

// This component is dynamic - rendered per request
async function StockStatus({ productId }) {
  const stock = await fetchStock(productId)
  return <p>In stock: {stock.count}</p>
}

// Page uses Suspense to mark the dynamic hole
async function ProductPage({ params }) {
  const product = await fetchProduct(params.id)

  return (
    <div>
      <ProductDetails product={product} />
      <Suspense fallback={<p>Checking availability...</p>}>
        <StockStatus productId={params.id} />
      </Suspense>
    </div>
  )
}

export default ProductPage
```

3. Multiple dynamic sections on one page
```javascript
async function DashboardPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading stats...</div>}>
        <UserStats />
      </Suspense>
      <Suspense fallback={<div>Loading recent activity...</div>}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

4. Dynamic component that opts out of static rendering
```javascript
import { unstable_noStore as noStore } from 'next/cache'

async function UserCart() {
  noStore()
  const cart = await fetchUserCart()
  return <div>{cart.items.length} items</div>
}
```

### Common patterns

- Wrap only the truly dynamic parts in Suspense; keep the shell as static as possible
- Use meaningful fallback UIs that match the dimensions of the loading content to avoid CLS
- Combine PPR with React Query hydration for client-side cache priming
- Use noStore() in components that must always be dynamic

### Common mistakes

- Wrapping the entire page in a single Suspense boundary, losing the static shell benefit
- Using dynamic data in the shell components, forcing the whole shell to be dynamic
- Not providing a fallback, causing the dynamic hole to be blank during loading
- Applying PPR to pages that are fully static, adding streaming overhead with no benefit
