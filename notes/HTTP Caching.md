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
