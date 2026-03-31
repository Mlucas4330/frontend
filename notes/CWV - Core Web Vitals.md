ID: 202603278  
Tags: #performance #browser

### Core idea

Core Web Vitals are three metrics Google uses to measure real-world page experience: loading performance, interactivity, and visual stability. They directly affect search rankings and user satisfaction.

### Why it matters

- Poor scores correlate with higher bounce rates and lower conversions
- Google uses CWV as a ranking signal in search results
- They surface real performance problems that synthetic benchmarks miss
- Improving them often means improving the user experience for everyone

### Key concepts

1. LCP (Largest Contentful Paint)  
   Measures how long it takes for the largest visible element to render. Target: under 2.5 seconds. Largest elements are usually hero images, background images, or large text blocks.

2. INP (Interaction to Next Paint)  
   Measures the delay from user input to the next visual update. Replaced FID in 2024. Target: under 200ms. Covers all interactions, not just the first.

3. CLS (Cumulative Layout Shift)  
   Measures unexpected layout shifts during page load. Target: under 0.1. Caused by images without dimensions, late-loading fonts, or dynamically injected content.

4. TTFB (Time to First Byte)  
   Not an official CWV but closely related to LCP. Measures server response time. A slow TTFB makes all other metrics worse.

5. FCP (First Contentful Paint)  
   Time until the browser renders the first piece of content. Not a CWV but useful for diagnosing slow initial render.

6. Field data vs lab data  
   Field data comes from real users via Chrome User Experience Report (CrUX). Lab data comes from tools like Lighthouse. Field data is what Google uses for rankings.

### Insight

LCP is usually the most impactful to fix. It often comes down to one element: a hero image or a large text block. Optimizing that single resource often moves the score significantly.

### Examples

1. Fixing LCP: preload the hero image
```html
<link rel="preload" as="image" href="/hero.jpg" />
```

2. Fixing LCP: set explicit image dimensions to avoid layout recalculation
```html
<img src="/hero.jpg" width="1200" height="600" alt="Hero" />
```

3. Fixing CLS: reserve space for images
```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

4. Fixing CLS: use font-display to avoid text shifting
```css
@font-face {
  font-family: 'MyFont';
  src: url('/font.woff2');
  font-display: swap;
}
```

5. Fixing INP: move heavy work off the main thread
```javascript
// Bad: blocks the main thread
button.addEventListener('click', () => {
  const result = expensiveComputation()
  updateUI(result)
})

// Good: defer non-critical work
button.addEventListener('click', () => {
  updateUI(immediateResult)
  setTimeout(() => expensiveComputation(), 0)
})
```

6. Measuring CWV in the browser
```javascript
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP(metric => console.log('LCP:', metric.value))
onINP(metric => console.log('INP:', metric.value))
onCLS(metric => console.log('CLS:', metric.value))
```

7. Checking field data via PageSpeed Insights
```
https://pagespeed.web.dev/?url=https://yoursite.com
```

### Common patterns

- Preload LCP images using link rel="preload"
- Use next/image or similar components that enforce width, height, and lazy loading
- Avoid inserting content above the fold after initial render
- Run Lighthouse in CI to catch regressions before deployment
- Prioritize fixing LCP first, then CLS, then INP

### Common mistakes

- Using layout measurements that cause LCP to score well in Lighthouse but poorly in field data
- Loading fonts without font-display, causing invisible text during load
- Injecting ads or banners above the fold after the page renders (causes CLS)
- Not reserving space for images with dynamic dimensions
- Optimizing lab scores without checking CrUX field data
