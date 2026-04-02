ID: 202603280  
Tags: #performance #http

### Core idea

HTTP caching lets browsers and intermediary servers store responses so they do not need to re-fetch the same resource on every request. Correct cache configuration reduces load times and server costs.

### Why it matters

- Eliminates round trips for unchanged resources
- Reduces bandwidth and server load
- Improves repeat-visit performance significantly
- Works at multiple levels: browser, CDN, and reverse proxy

### Key concepts

1. Cache-Control  
   The primary header for controlling caching behavior. Sent by the server. Directives include max-age, no-cache, no-store, public, private, and immutable.

2. max-age  
   Tells the browser how many seconds to use the cached response before it is considered stale. After expiry, the browser revalidates.

3. ETag  
   A fingerprint of the response content. The browser sends it back on the next request via If-None-Match. If the content has not changed, the server returns 304 Not Modified with no body.

4. Last-Modified  
   A timestamp the server sends. The browser sends it back via If-Modified-Since. Like ETag but less precise.

5. no-cache  
   Does not mean "do not cache." It means always revalidate with the server before using the cached response. The response is still stored locally.

6. no-store  
   Means never cache this response at all. Use for sensitive data like bank account pages.

7. immutable  
   Tells the browser the resource will never change, so skip revalidation even during forced refresh. Use only with hashed filenames.

8. Stale-while-revalidate  
   Serves the stale cached response immediately while fetching an updated one in the background.

### Insight

Separate your caching strategy by resource type. HTML needs short TTL or revalidation. JS and CSS with hashed filenames can use max-age=31536000 and immutable. Images fall somewhere in between.

### Examples

1. Long-lived cache for versioned assets
```http
Cache-Control: public, max-age=31536000, immutable
```

2. Always revalidate HTML
```http
Cache-Control: no-cache
ETag: "abc123"
```

3. Never cache sensitive data
```http
Cache-Control: no-store
```

4. Stale-while-revalidate for near-fresh content
```http
Cache-Control: max-age=60, stale-while-revalidate=3600
```

5. Browser sends ETag on revalidation
```http
// First request - server responds:
HTTP/1.1 200 OK
ETag: "v1"
Cache-Control: no-cache

// Second request - browser sends:
GET /api/data
If-None-Match: "v1"

// Server responds if unchanged:
HTTP/1.1 304 Not Modified
```

6. Setting headers in Express.js
```javascript
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.set('ETag', '"abc123"')
  res.json({ data: 'value' })
})

app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}))
```

7. Next.js custom headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  }
}
```

### Common patterns

- Use max-age=31536000 + immutable for hashed static assets
- Use no-cache + ETag for HTML and API responses
- Use no-store for authentication pages and sensitive user data
- Use stale-while-revalidate for data that can tolerate brief staleness
- Version filenames with a content hash at build time

### Common mistakes

- Confusing no-cache with no-store
- Setting long max-age on HTML without a cache-busting mechanism
- Not sending ETag or Last-Modified when using no-cache
- Caching API responses with user-specific data using public instead of private
- Relying on browser defaults instead of setting explicit Cache-Control headers

### HTTP caching vs Redis caching

They operate at completely different layers and solve different problems. They complement each other — you will often use both.

**HTTP caching** lives between the client and the server. The browser, CDN, or reverse proxy stores a full HTTP response. No server code runs at all on a cache hit. It is stateless, automatic, and controlled purely through response headers.

**Redis caching** lives inside the server. It stores arbitrary data (query results, computed values, session state) in memory so that slow operations — database queries, third-party API calls, heavy computations — are not repeated on every request. The server still runs, receives the request, checks Redis, and returns the result.

| | HTTP caching | Redis caching |
|---|---|---|
| Where | Client / CDN / proxy | Server-side, in-memory store |
| What it avoids | Network round trip entirely | Slow internal operations (DB, API) |
| Who controls it | Response headers sent by the server | Application code |
| Granularity | Full HTTP responses | Any key-value data you choose |
| Invalidation | TTL, ETag revalidation, cache-busting URLs | Explicit key deletion or TTL expiry |
| Shared across users | Yes (with `public`) | Yes, by design |
| Per-user data | Only with `private` directive | Easily, just namespace the key |

**How they layer together**

```
Browser → (HTTP cache: serves stale asset, skip) → CDN → (HTTP cache: serves response, skip) → Server → (Redis: return cached DB result, skip) → Database
```

A request for a static JS file never reaches the server because the CDN handles it via HTTP cache. A request for an API response might reach the server but return in microseconds because Redis has the query result. Only a cache miss at both layers hits the database.

**When to use which**

- HTTP cache: public assets (JS, CSS, images), HTML pages, public API responses that are safe to share across users
- Redis: database query results, session tokens, rate limit counters, expensive computations, per-user data that must not leak between clients

**Key insight**

HTTP caching cannot help with dynamic, per-user, or private data because caching a response with `private` means only the individual browser stores it — the CDN and server still take the hit for every other user. Redis fills that gap by caching at the server level where you have full control over what gets shared and what stays isolated.
