ID: 202604021
Tags: #seo #react #frontend #metadata

### Core idea

SEO in React requires special attention because React apps are often single-page applications (SPAs) where content is rendered by JavaScript. Search engines can struggle to index JS-rendered content, and each route needs its own distinct metadata (title, description, canonical URL, Open Graph). The solution depends on the rendering strategy and the tooling you use.

### Why it matters

- Search engines rank pages, not apps — every route needs unique, descriptive metadata
- Social platforms (Twitter, LinkedIn, Facebook) use Open Graph tags to generate link previews
- Crawlers cannot always wait for JS execution — server-rendered or static HTML is safer
- Core Web Vitals (LCP, CLS, FID/INP) directly affect Google ranking

### Rendering strategies and SEO impact

| Strategy | SEO friendliness | Notes |
|---|---|---|
| CSR (Create React App, Vite SPA) | Poor by default | Bots see an empty HTML shell |
| SSR (Next.js, Remix) | Excellent | Full HTML with metadata served on first byte |
| SSG (Next.js static, Astro) | Excellent | Pre-rendered at build time |
| Streaming SSR (React 18 + Next.js) | Excellent | Sends critical HTML first |

### react-helmet-async (SPA / CSR)

The standard library for managing `<head>` tags in a React SPA. Injects title, meta, link, and script tags from any component in the tree.

```bash
npm install react-helmet-async
```

```jsx
// main.jsx — wrap the app once
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
```

```jsx
// SEO.jsx — reusable SEO component
import { Helmet } from 'react-helmet-async'

export function SEO({ title, description, canonical, image }) {
  const siteName = 'My Site'
  const fullTitle = title ? `${title} | ${siteName}` : siteName

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  )
}
```

```jsx
// Usage in any page component
import { SEO } from '../components/SEO'

export function BlogPost({ post }) {
  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`https://mysite.com/blog/${post.slug}`}
        image={post.coverImage}
      />
      <article>{/* ... */}</article>
    </>
  )
}
```

Note: Use `react-helmet-async` not `react-helmet` — the async version is safe for SSR and concurrent mode.

### Next.js Metadata API (App Router)

Next.js 13+ App Router has a built-in `metadata` export. No library needed.

```jsx
// app/layout.tsx — site-wide defaults
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'My Site',
    template: '%s | My Site',  // page titles become "Page Title | My Site"
  },
  description: 'Default site description',
  metadataBase: new URL('https://mysite.com'),
  openGraph: {
    siteName: 'My Site',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

```jsx
// app/blog/[slug]/page.tsx — per-page dynamic metadata
import type { Metadata } from 'next'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}
```

### Next.js sitemap and robots

```javascript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts()

  return [
    { url: 'https://mysite.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://mysite.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map(post => ({
      url: `https://mysite.com/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
```

```javascript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://mysite.com/sitemap.xml',
  }
}
```

### Structured data (JSON-LD)

Helps Google understand content type and enables rich results (star ratings, breadcrumbs, FAQs).

```jsx
// components/JsonLd.jsx
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

```jsx
// Usage: Article schema
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  author: { '@type': 'Person', name: post.author },
  datePublished: post.publishedAt,
  image: post.coverImage,
}} />

// Usage: BreadcrumbList
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mysite.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://mysite.com/blog' },
    { '@type': 'ListItem', position: 3, name: post.title },
  ],
}} />
```

### Core Web Vitals

Google uses CWV as a ranking signal. The three metrics to watch:

| Metric | What it measures | Good threshold |
|---|---|---|
| LCP (Largest Contentful Paint) | Load time of largest visible element | < 2.5s |
| CLS (Cumulative Layout Shift) | Unexpected layout movement | < 0.1 |
| INP (Interaction to Next Paint) | Responsiveness to user input | < 200ms |

**React-specific fixes:**

```jsx
// LCP: add priority to above-the-fold images in Next.js
<Image src="/hero.jpg" alt="Hero" priority width={1200} height={600} />

// CLS: always set width/height on images to prevent layout shift
<img src="/photo.jpg" alt="..." width={800} height={450} />

// CLS: reserve space for async content
<div style={{ minHeight: '200px' }}>
  {data ? <Content data={data} /> : null}
</div>
```

### Canonical URLs

Prevents duplicate content penalties when the same page is accessible at multiple URLs.

```jsx
// react-helmet-async
<Helmet>
  <link rel="canonical" href="https://mysite.com/blog/my-post" />
</Helmet>

// Next.js App Router
export const metadata = {
  alternates: {
    canonical: '/blog/my-post',
  },
}
```

### Common patterns

- Always set a unique `<title>` and `<meta name="description">` per route
- Keep descriptions between 120–160 characters — longer gets truncated in SERPs
- Use absolute URLs in Open Graph tags — relative URLs are not valid
- Provide og:image at 1200×630px for best social preview rendering
- Add `hreflang` alternates for multi-language sites
- Use Next.js App Router metadata API or react-helmet-async — do not manipulate `document.title` directly

### Common mistakes

- Using a SPA without SSR/SSG for content that needs to rank — bots see a blank page
- Setting the same title and description on every page
- Forgetting `metadataBase` in Next.js — causes og:image to resolve as a relative URL
- Not including a sitemap or blocking the crawler in robots.txt
- Missing canonical tags on paginated routes or filtered URL variants
- Using `react-helmet` (deprecated) instead of `react-helmet-async`
