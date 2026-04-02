ID: 202604020
Tags: #design-system #react #frontend #ui

### Core idea

A design system is a collection of reusable components, tokens, and guidelines that enforce visual and behavioral consistency across a product. In React, it is implemented as a component library driven by design tokens (colors, spacing, typography, shadows) and composed into a coherent UI.

### Why it matters

- Eliminates inconsistent UI across teams and features
- Speeds up development by removing per-component style decisions
- Creates a shared language between designers and engineers
- Enforces accessibility and interaction standards in one place

### Key concepts

1. Design tokens  
   The primitive values of your design: colors, spacing scale, font sizes, border radii, shadows. Everything else is built from them. Stored as CSS custom properties or JS constants and consumed by all components.

2. Component library  
   Atomic UI components (Button, Input, Modal, etc.) that accept well-defined props and are styled exclusively using tokens. No magic numbers or one-off hex values.

3. Theming  
   The mechanism for swapping token sets at runtime, usually via React context. Used for dark mode, brand variants, or white-labeling.

4. Storybook  
   The standard tool for developing and documenting components in isolation. Each component gets stories covering all its states and variants. Serves as the living style guide.

### Popular libraries

| Library | Best for |
|---|---|
| shadcn/ui | Copy-paste components built on Radix + Tailwind, full control |
| Radix UI | Unstyled, accessible primitives — bring your own styles |
| MUI (Material UI) | Full-featured, opinionated Material Design system |
| Mantine | Full-featured with great DX, hooks included |
| Chakra UI | Utility props, good accessibility defaults |
| Headless UI | Tailwind-native unstyled components from the Tailwind team |
| Ariakit | Accessible composable primitives |

### Token setup

```javascript
// tokens.js — define once, use everywhere
export const tokens = {
  color: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
  },
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
}
```

```css
/* Alternatively as CSS custom properties */
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --space-4: 16px;
  --radius-md: 8px;
}
```

### Theming with React context

```jsx
// ThemeContext.jsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

```css
/* CSS handles the token swap */
[data-theme='light'] {
  --color-surface: #ffffff;
  --color-text: #0f172a;
}

[data-theme='dark'] {
  --color-surface: #0f172a;
  --color-text: #f8fafc;
}
```

### Component example

```jsx
// Button.jsx — built only on tokens
import styles from './Button.module.css'
import clsx from 'clsx'

export function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={clsx(styles.base, styles[variant], styles[size])}
      {...props}
    >
      {children}
    </button>
  )
}
```

```css
/* Button.module.css */
.base {
  font-family: inherit;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color 150ms ease;
}

.primary {
  background: var(--color-primary);
  color: #fff;
}

.primary:hover {
  background: var(--color-primary-hover);
}

.md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-base);
}
```

### shadcn/ui setup (most common approach)

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input dialog card
```

shadcn copies component source into `components/ui/`. You own the code — edit it freely. It uses Tailwind CSS variables and Radix UI under the hood.

```jsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button>Sign in</Button>
      </CardContent>
    </Card>
  )
}
```

### Storybook setup

```bash
npx storybook@latest init
npm run storybook
```

```jsx
// Button.stories.jsx
import { Button } from './Button'

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export const Primary = { args: { variant: 'primary', children: 'Click me' } }
export const Secondary = { args: { variant: 'secondary', children: 'Click me' } }
export const Disabled = { args: { variant: 'primary', children: 'Disabled', disabled: true } }
```

### Folder structure

```
src/
  components/
    ui/           ← primitive components: Button, Input, Badge, etc.
    layout/       ← layout components: Stack, Grid, Container
    patterns/     ← composed patterns: LoginForm, DataTable, etc.
  styles/
    tokens.css    ← CSS custom properties
    globals.css   ← resets and base styles
    themes/
      light.css
      dark.css
```

### Common patterns

- Keep token names semantic (`color-primary`) not literal (`color-blue-600`) so themes can swap values without name changes
- Use CSS custom properties for tokens so theming works without JS
- Build components bottom-up: tokens → primitives → patterns → pages
- Export a single barrel file (`components/ui/index.ts`) for clean imports
- Co-locate component styles with the component file using CSS modules or a CSS-in-JS solution

### Common mistakes

- Using raw hex values or spacing numbers inside components instead of tokens
- Over-abstracting too early — build the component three times before abstracting
- Not testing components in isolation with Storybook before composing them
- Skipping accessibility — use Radix UI or Headless UI primitives for interactive elements (Dialog, Menu, Tooltip) to get ARIA for free
- Letting the theme context re-render the entire tree on change — memoize theme values
