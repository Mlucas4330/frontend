ID: 202603271  
Tags: #performance

### Core idea

A CDN is a distributed network of servers that delivers content to users based on their geographic location. Users receive files from the nearest server, not the origin.

### Why it matters

- Reduces page load time by minimizing the distance between user and server
- Reduces load on the origin server during traffic spikes
- Improves availability when the origin server has downtime
- Affects Core Web Vitals scores, which influence SEO rankings

### Key concepts

1. Edge servers  
   Servers placed close to end users. They store cached copies of assets and respond to requests without contacting the origin.

2. Origin server  
   The source of truth for your content. The CDN fetches from it when the edge cache is empty or expired.

3. Caching  
   Static assets like images, CSS, JavaScript, and fonts are stored on edge servers. TTL (time-to-live) controls how long they stay.

4. Cache invalidation  
   When content changes, the old cached version must be purged. CDNs support manual purge, versioned URLs, or TTL expiration.

5. Latency  
   Round-trip time between user and server. CDNs reduce latency by shortening the physical distance a request travels.

6. Load balancing  
   CDNs distribute traffic across multiple servers. This prevents any single server from being overwhelmed.

7. Cache-Control headers  
   The origin server tells the CDN how to cache content using headers like Cache-Control: max-age=86400.

### Insight

Most CDN performance gains come from correct caching configuration, not just geographic distribution. Without proper Cache-Control headers, edge servers fetch from origin on every request.

### Examples

1. Long-lived cache for versioned static assets
```http
Cache-Control: public, max-age=31536000, immutable
```
Use this for hashed filenames. The hash changes with each build, so the URL changes and CDN treats it as a new resource.

2. No cache for HTML pages
```http
Cache-Control: no-cache
```
Forces CDN to revalidate with origin before serving. Good for pages where freshness matters.

3. Cache invalidation via versioned URLs
```
Before: /assets/app.js
After:  /assets/app.abc123.js
```
Changing the filename bypasses the old cache without needing a manual purge.

4. Vercel CDN headers config
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

5. Cache HIT vs MISS flow
```
User in Brazil
  -> CDN edge in São Paulo (cache HIT)  -> 10ms response
  -> CDN edge in São Paulo (cache MISS) -> 200ms round trip to US origin
```

### Common patterns

- Use immutable cache headers with hashed filenames for versioned assets
- Use short TTL or no-cache for HTML pages
- Use long TTL for images, fonts, and vendor bundles
- Purge CDN cache as part of the deployment pipeline
- Enable Brotli or gzip compression on edge servers

### Common mistakes

- Setting no Cache-Control headers so CDN uses its own default behavior
- Caching HTML pages with long TTL, causing users to see stale content
- Updating assets at the same URL without invalidating the cache
- Serving user-specific or sensitive data through a shared CDN cache
- Forgetting to configure CDN to compress responses
