ID: 202603274  
Tags: #react #state

### Core idea

State management is the process of handling and synchronizing data within an application so the UI stays consistent with the underlying data.

### Why it matters

- Keeps UI predictable and consistent
- Avoids bugs caused by unsynchronized data
- Improves maintainability as applications grow
- Manages complex interactions between components

### Key concepts

1. State  
   Data that changes over time and affects what the UI renders.

2. Local state  
   State managed inside a single component. Use useState or useReducer.

3. Global state  
   State shared across multiple components. Lives outside individual components.

4. Server state  
   Data fetched from an external source. Has its own lifecycle: loading, error, stale, fresh. Tools like React Query or SWR handle this separately from UI state.

5. Prop drilling  
   Passing data through multiple component levels even when intermediate components do not need it.

6. Derived state  
   A value computed from existing state. Do not store it; compute it on render.

7. Single source of truth  
   Each piece of state has one authoritative location. Duplicate state causes inconsistencies.

8. Colocation  
   State should live as close as possible to the components that use it.

### Insight

Good state management is less about tools and more about deciding where state should live and how it flows through the application. Most complexity comes from state that is in the wrong place, not from missing libraries.

### Examples

1. Local state with useState

```javascript
import { useState } from 'react'

function Counter() {
    const [count, setCount] = useState(0)

    return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

2. Lifting state up

```javascript
function Parent() {
    const [value, setValue] = useState('')

    return <Child value={value} onChange={setValue} />
}

function Child({ value, onChange }) {
    return <input value={value} onChange={e => onChange(e.target.value)} />
}
```

3. Global state with Context API

```javascript
import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

function AppProvider({ children }) {
    const [user, setUser] = useState(null)

    return <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>
}

function useApp() {
    return useContext(AppContext)
}
```

4. Consuming context to avoid prop drilling

```javascript
function Profile() {
    const { user } = useApp()
    return <div>{user?.name}</div>
}
```

5. Derived state instead of stored state

```javascript
function Cart({ items }) {
    const total = items.reduce((sum, item) => sum + item.price, 0)
    return <div>Total: {total}</div>
}
```

6. External state management with Zustand

```javascript
import { create } from 'zustand'

const useStore = create(set => ({
    count: 0,
    increase: () => set(state => ({ count: state.count + 1 }))
}))

function Counter() {
    const { count, increase } = useStore()
    return <button onClick={increase}>{count}</button>
}
```

7. Server state with React Query

```javascript
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json())
    })

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading user</div>

    return <div>{data.name}</div>
}
```

8. useReducer for complex local state

```javascript
function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 }
        case 'decrement':
            return { count: state.count - 1 }
        case 'reset':
            return { count: 0 }
        default:
            return state
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0 })

    return (
        <div>
            <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
            <span>{state.count}</span>
            <button onClick={() => dispatch({ type: 'increment' })}>+</button>
        </div>
    )
}
```

### Common patterns

- Keep state as close as possible to where it is used
- Lift state up only when two components need the same data
- Prefer derived state over duplicated state
- Use Context for low-frequency global state like theme or auth
- Use Zustand or Redux for complex, high-frequency shared state
- Use React Query or SWR for server state, not useState + useEffect
- Separate UI state from server state

### Common mistakes

- Storing computed values in state instead of deriving them on render
- Putting everything in global state when local state would work
- Using useState + useEffect to fetch data instead of a dedicated library
- Mutating state directly instead of returning new values
- Mixing unrelated concerns in the same state object
- Prop drilling when lifting state or restructuring components would solve it
- Syncing state between two sources instead of having one source of truth
- Initializing state with props and never updating it when props change
