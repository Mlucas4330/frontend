ID: 202604072  
Tags: #react #hooks #closures

### Core idea

A stale closure happens when a function captures a variable from an outer scope at creation time and holds onto that snapshot even after the variable has changed. In React, this commonly occurs inside `useEffect`, `useCallback`, `setInterval`, and event handlers that are not recreated when state updates.

### Why it matters

- Causes effects and callbacks to read outdated state or props silently, with no runtime error
- Leads to subtle bugs that are hard to reproduce and trace
- Breaking the dependency array is the most common way to accidentally introduce a stale closure
- Understanding it is prerequisite to using `useEffect` and `useCallback` correctly

### Key concepts

1. Closure  
   A function that retains access to the variables of its enclosing scope at the time it was created. In JavaScript, every function is a closure.

2. React render model  
   Each render produces a new snapshot of state and props. Functions defined during that render close over that snapshot. A function from render N does not see updates from render N+1.

3. Stale closure in useEffect  
   An effect that runs once (empty dependency array) closes over the initial values of all variables it references. If those variables change later, the effect still sees the original values.

4. Dependency array  
   The list of values that `useEffect` and `useCallback` watch. Including a value tells React to re-create the callback when it changes, giving it a fresh closure. Omitting a value leaves the closure stale.

5. Functional updater form  
   State setters accept a function `prev => next` instead of a direct value. This avoids needing to read current state inside the closure — React provides the latest value as the argument.

6. useRef as escape hatch  
   A ref holds a mutable value that persists across renders without triggering re-renders. Storing a value in a ref and reading `ref.current` inside a closure always gets the latest value.

### Insight

The stale closure is not a React bug — it is a consequence of how JavaScript closures work. React just makes it more visible because components re-render constantly. The fix is almost always to add the variable to the dependency array. If that causes too many re-runs, reach for the functional updater form or a ref, not an empty dependency array.

### Examples

1. Stale closure inside setInterval — broken
```tsx
useEffect(() => {
  const id = setInterval(() => {
    console.log('count:', count) // always logs initial value
  }, 1000)
  return () => clearInterval(id)
}, []) // count is stale — interval closed over render-0 value
```

2. Fixed by adding count to the dependency array
```tsx
useEffect(() => {
  const id = setInterval(() => {
    console.log('count:', count)
  }, 1000)
  return () => clearInterval(id)
}, [count]) // effect re-runs when count changes, getting a fresh closure
```

3. Avoiding stale state with the functional updater form
```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1) // always uses latest value, no closure needed
  }, 1000)
  return () => clearInterval(id)
}, []) // safe because setCount itself is stable
```

4. Stale closure in useCallback
```tsx
// Broken: handleSave always sends the initial draft value
const handleSave = useCallback(() => {
  api.save(draft)
}, []) // draft missing from deps

// Fixed
const handleSave = useCallback(() => {
  api.save(draft)
}, [draft])
```

5. useRef to read latest value without re-creating the callback
```tsx
function Timer({ onTick }: { onTick: () => void }) {
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  })

  useEffect(() => {
    const id = setInterval(() => {
      onTickRef.current() // always calls the latest version
    }, 1000)
    return () => clearInterval(id)
  }, [])
}
```

### Common patterns

- Add all variables read inside an effect to the dependency array
- Use the functional updater `setState(prev => ...)` when updating state inside a long-lived callback
- Store frequently-changing callbacks in a ref when you want a stable interval or listener
- Use the eslint-plugin-react-hooks `exhaustive-deps` rule to catch missing dependencies automatically

### Common mistakes

- Using an empty dependency array to "run the effect once" when the effect actually reads changing values
- Suppressing the exhaustive-deps lint warning without understanding why it fired
- Assuming that adding a dependency causes too many re-renders without profiling first
- Mutating a ref instead of using state when the UI needs to react to the change
- Fixing a stale closure by reading from a module-level variable instead of component state
