You're architecting an e-commerce platform split into three micro frontends: Catalog, Cart, and UserProfile. A shell app owns layout and navigation.

    20. The Cart badge in the shell header needs to show the item count, but the Cart MFE owns that data. How do you communicate it without coupling them?
        There's three main ways of communicating in the MFE architecture. Custom events, shared state in the URL, or a lightweight pub/sub bus. For this scenario the best approach is custom events, every time some user interacts with Cart, it triggers an event that changes item count.
    21. All three MFEs share the same design system. How do you avoid shipping three copies of it to the user?
        A shared component library ensures visual consistency across micro frontends built by different teams.
    22. If the Cart MFE fails to load, what should the user experience be and how do you implement it?
        I'd have some local component with a similar structure as the Cart MFE, and I'd use Suspense with fallback to render it if necessary.


Good answers. Let me give feedback on each:

**20. Custom events ✅**
Correct approach and correct reasoning. The implementation looks like this so you have it concrete:

```ts
// Inside Cart MFE — fires when items change
window.dispatchEvent(
    new CustomEvent('cart:updated', {
        detail: { count: 3 }
    })
)

// Inside Shell — listens and updates the badge
window.addEventListener('cart:updated', e => {
    setBadgeCount(e.detail.count)
})
```

The key word you were looking for is **decoupling** — the Cart doesn't import anything from the Shell and the Shell doesn't import anything from Cart. They only share a contract: the event name and the shape of `detail`.

**21. Shared component library ⚠️**
You identified the solution but didn't answer the technical question — _how do you avoid shipping three copies_. The answer is **Module Federation** (Webpack 5). The design system is declared as a shared singleton in the webpack config, so when all three MFEs load, the browser only downloads it once and the others reuse the cached version. Without this, each MFE bundles its own copy and the user downloads it three times.

**22. Suspense fallback ⚠️**
The direction is right but Suspense alone isn't enough here. Suspense handles loading state, not failure. What you actually need is an **Error Boundary** wrapping the MFE. If the remote fails to load, the Error Boundary catches it and renders your fallback UI instead of crashing the whole shell.

```tsx
<ErrorBoundary fallback={<CartFallback />}>
    <Suspense fallback={<CartSkeleton />}>
        <CartMFE />
    </Suspense>
</ErrorBoundary>
```

Suspense = loading. ErrorBoundary = failure. You need both.