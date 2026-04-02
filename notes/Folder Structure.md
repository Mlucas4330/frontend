ID: 202604021
Tags: #architecture #frontend #react

### Core idea

Frontend folder structure defines how code is organized across files and directories. The two main approaches are **type-based** (group by technical role: components, hooks, services) and **feature-based** (group by domain: everything for a feature lives together). Feature-based scales better as the app grows.

### Why it matters

- Determines how fast developers can find and change code
- Affects how easy it is to delete, extract, or hand off a feature
- Shapes coupling: bad structure causes unrelated features to depend on each other
- Becomes a bottleneck at scale if chosen poorly early on

### Key concepts

1. Type-based structure  
   Files are organized by what they are. All components in one folder, all hooks in another. Simple to start with but breaks down as the app grows because all features are mixed together.

2. Feature-based structure  
   Files are organized by what they belong to. Each feature is a self-contained directory with its own components, hooks, and services. High cohesion, low coupling between features.

3. Colocation  
   Keep files as close as possible to where they are used. If a component is only used inside one feature, it belongs inside that feature, not in a global folder. Only move it up when it is actually reused somewhere else.

4. Barrel files (`index.ts`)  
   Each feature exposes a public API through an `index.ts`. Other features import from `features/auth`, not from internal paths like `features/auth/components/LoginForm`. Enforces loose coupling and makes refactoring internals safe.

5. `shared/` layer  
   The place for code that is genuinely reused across multiple unrelated features. Promote something to `shared/` only when it is actually shared — premature promotion creates hidden coupling.

6. Path aliases (`@/`)  
   A compiler/bundler alias that maps `@/` to the `src/` directory. Eliminates `../../../` relative imports. Configured once in the build tool and TypeScript, then used everywhere. The `@` convention is the most common but the alias name is arbitrary.

### Examples

1. Type-based structure (classic)
```
src/
├── components/       ← all components from all features mixed together
├── pages/
├── hooks/
├── services/
├── utils/
├── store/
├── types/
├── assets/
└── styles/
```

2. Feature-based structure (recommended)
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authApi.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── types.ts
│   │   └── index.ts           ← public API
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   └── index.ts
│   └── settings/
│       ├── components/
│       │   └── ProfileForm.tsx
│       └── index.ts
├── shared/
│   ├── components/            ← generic UI with no business logic
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   ├── utils/
│   │   └── formatDate.ts
│   └── types/
│       └── common.ts
├── pages/                     ← thin route entry points, just compose features
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
└── app/                       ← app bootstrap: router, providers, global store
    ├── App.tsx
    ├── router.tsx
    └── providers.tsx
```

3. Barrel file (feature public API)
```typescript
// features/auth/index.ts
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'
export { useAuth } from './hooks/useAuth'
export type { User, AuthState } from './types'

// ✅ correct — imports from the feature's public API
import { LoginForm, useAuth } from '@/features/auth'

// ❌ wrong — reaches into internals, breaks if auth is refactored
import { LoginForm } from '@/features/auth/components/LoginForm'
```

4. Path alias setup — Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

5. Path alias setup — TypeScript (required alongside the bundler config)
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

6. Path alias setup — Next.js (built-in, just enable it)
```json
// tsconfig.json — Next.js reads this automatically
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

7. Using aliases vs relative imports
```typescript
// ❌ relative — breaks when files are moved, hard to read
import { Button } from '../../../shared/components/Button'
import { useAuth } from '../../auth/hooks/useAuth'

// ✅ alias — always resolves from src/, survives refactoring
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/features/auth'
```

8. Thin page component
```tsx
// pages/DashboardPage.tsx — no business logic, just composition
import { DashboardLayout, useStats } from '@/features/dashboard'
import { useAuth } from '@/features/auth'

export function DashboardPage() {
  const { user } = useAuth()
  const { stats } = useStats()

  return <DashboardLayout user={user} stats={stats} />
}
```

### Common patterns

- Keep pages thin — they compose features but contain no business logic
- Avoid nesting deeper than 3–4 levels; deep nesting makes imports verbose
- Configure `@/` alias in both the bundler (`vite.config.ts`) and TypeScript (`tsconfig.json`) — both are needed
- Name feature folders after domain concepts (`billing`, `auth`) not UI concepts (`sidebar`, `modal`)
- Use `shared/components/` only for truly generic UI (Button, Input, Modal) with no business logic

### Common mistakes

- Treating `components/` as a global dumping ground — it grows unmanageable fast
- Putting everything in `shared/` preemptively instead of colocating first
- Coupling features by importing directly from each other's internals instead of through `index.ts`
- Using a feature-based structure in a small project where type-based is simpler and sufficient
- Configuring the alias only in `vite.config.ts` but not in `tsconfig.json` — TypeScript will show errors even though the bundler resolves correctly
