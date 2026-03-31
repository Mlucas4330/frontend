ID: 202603273  
Tags: #security #http #browser

### Core idea

CORS (Cross-Origin Resource Sharing) is a browser security mechanism that controls how resources on a web server can be requested from a different origin than the one that served the page.

### Why it matters

- Protects users from malicious cross-site requests
- Allows controlled sharing of resources between different domains
- Essential for APIs consumed by frontend applications on different domains
- Prevents unauthorized data access from untrusted origins

### Key concepts

1. Origin  
   An origin is defined by protocol, domain, and port. http://example.com:3000 and https://example.com are different origins.

2. Same-Origin Policy  
   Browsers restrict requests between different origins by default. This prevents unauthorized access to resources.

3. CORS headers  
   Servers explicitly allow cross-origin requests using HTTP headers like Access-Control-Allow-Origin.

4. Preflight request  
   For certain requests, the browser sends an OPTIONS request first to check permissions before sending the actual request.

5. Simple vs non-simple requests  
   Simple requests (GET, POST with basic headers) do not trigger preflight. Non-simple requests do, usually because of custom headers or methods like PUT or DELETE.

6. Credentials  
   Cookies and authorization headers are not sent cross-origin by default. You must opt in with credentials: 'include' on the client and a matching header on the server.

### Insight

CORS is enforced by the browser, not the server. The server only signals what it permits. The browser decides whether to allow access based on those signals.

### Examples

1. Simple request with wildcard origin
```javascript
fetch('https://api.example.com/data')

// Server response header:
// Access-Control-Allow-Origin: *
```

2. Restricting to a specific origin
```http
Access-Control-Allow-Origin: https://myapp.com
```

3. Preflight request and response
```http
// Browser sends:
OPTIONS /data
Origin: https://myapp.com
Access-Control-Request-Method: PUT

// Server responds:
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type
```

4. Fetch with custom headers triggers preflight
```javascript
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
})
```

5. Sending credentials cross-origin
```javascript
fetch('https://api.example.com/user', {
  credentials: 'include'
})

// Server must include both:
// Access-Control-Allow-Origin: https://myapp.com
// Access-Control-Allow-Credentials: true
```

6. Express.js CORS middleware
```javascript
const express = require('express')
const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://myapp.com')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
```

7. Using the cors npm package
```javascript
const cors = require('cors')

app.use(cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}))
```

### Common patterns

- Use a dedicated CORS middleware instead of setting headers manually
- Set specific origins instead of wildcard when using credentials
- Handle OPTIONS preflight requests explicitly in your server
- Keep allowed methods and headers as narrow as possible
- Use environment variables to configure allowed origins per environment

### Common mistakes

- Assuming CORS is a server-side security feature (it is browser-enforced)
- Using Access-Control-Allow-Origin: * with credentials: true (browsers block this)
- Forgetting to handle OPTIONS preflight requests on the server
- Setting CORS headers in the wrong middleware order
- Configuring CORS on the client side instead of the server
