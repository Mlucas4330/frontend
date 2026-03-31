ID: 202603279  
Tags: #performance #http

### Core idea

Content negotiation lets the client and server agree on the format and encoding of a response. Compression reduces the size of that response before it travels over the network. Together they minimize transfer size and improve load time.

### Why it matters

- Compressed responses transfer faster, especially on mobile networks
- Content negotiation allows the same endpoint to serve different formats
- Brotli compression reduces text response sizes by 15-25% compared to gzip
- Smaller responses improve TTFB and LCP scores

### Key concepts

1. Accept header  
   Sent by the client. Tells the server what MIME types it understands. Example: Accept: application/json, text/html.

2. Content-Type header  
   Sent by the server. Tells the client the format of the response body. Example: Content-Type: application/json.

3. Accept-Encoding header  
   Sent by the client. Lists the compression algorithms it supports. Example: Accept-Encoding: gzip, br, deflate.

4. Content-Encoding header  
   Sent by the server. Tells the client which compression was applied. Example: Content-Encoding: br.

5. gzip  
   A widely supported compression format. Good compression ratio and fast decompression. Supported by all browsers.

6. Brotli (br)  
   A newer compression format with better compression ratios than gzip, especially for text. Supported by all modern browsers.

7. Transfer-Encoding: chunked  
   Sends the response body in chunks without knowing the total size upfront. Enables streaming.

8. Vary header  
   Tells CDNs and proxies which request headers were used for content negotiation. Example: Vary: Accept-Encoding. Prevents serving the wrong cached version.

### Insight

Enable Brotli on your server or CDN. It is supported by over 96% of browsers and compresses text assets better than gzip with no cost to the client. Static text files (HTML, CSS, JS) benefit most from pre-compression.

### Examples

1. Client sends content negotiation headers
```http
GET /api/data HTTP/1.1
Accept: application/json
Accept-Encoding: gzip, br
Accept-Language: en-US
```

2. Server responds with compressed Brotli
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br
Vary: Accept-Encoding
```

3. Enabling gzip and Brotli in Express
```javascript
const express = require('express')
const compression = require('compression')

const app = express()
app.use(compression())
```

4. Brotli in Node.js manually
```javascript
const zlib = require('zlib')
const { pipeline } = require('stream')

app.get('/data', (req, res) => {
  const acceptEncoding = req.headers['accept-encoding'] || ''

  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br')
    res.setHeader('Vary', 'Accept-Encoding')
    pipeline(dataStream, zlib.createBrotliCompress(), res, () => {})
  } else {
    dataStream.pipe(res)
  }
})
```

5. Nginx compression configuration
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

6. Serving pre-compressed static files
```javascript
// Build step: compress assets ahead of time
// app.bundle.js -> app.bundle.js.br, app.bundle.js.gz

// Nginx serves pre-compressed files automatically with:
// gzip_static on;
// brotli_static on;
```

7. Checking compression in the browser
```javascript
// In DevTools Network tab, check response headers:
// Content-Encoding: br  -> Brotli compressed
// Content-Encoding: gzip -> gzip compressed
// (no header)           -> uncompressed
```

### Common patterns

- Enable Brotli at the CDN or reverse proxy level for automatic compression
- Set Vary: Accept-Encoding so CDNs cache compressed and uncompressed versions separately
- Pre-compress static assets at build time for maximum performance
- Compress responses over ~1KB; smaller responses are not worth the overhead
- Use Transfer-Encoding: chunked for large streamed responses

### Common mistakes

- Compressing already-compressed formats like JPEG, PNG, or WebP (no gain, just CPU cost)
- Forgetting the Vary: Accept-Encoding header, causing CDNs to serve wrong cached versions
- Enabling compression in application code instead of at the reverse proxy (wastes CPU)
- Not testing whether compression is actually applied in production
- Compressing very small responses under 200 bytes where the headers cost more than the saving
