ID: 202603281  
Tags: #react #performance

### Core idea

Memoization stores the result of an expensive computation and returns the cached result when the same inputs occur again. In React, it prevents unnecessary re-renders and recalculations.

### Why it matters

- Reduces wasted renders in components that receive the same props
- Prevents expensive calculations from running on every render
- Stabilizes function references to avoid breaking dependency arrays
- Useful in large component trees where prop changes cascade downward

### Key concepts

1. React.memo  
   A higher-order component that wraps a component and skips re-rendering if props have not changed. Uses shallow comparison by default.

2. useMemo  
   A hook that memoizes the result of a computation. Recalculates only when the dependency array values change.

3. useCallback  
   A hook that memoizes a function reference. Returns the same function instance across renders unless dependencies change.

4. Shallow comparison  
   React.memo and useMemo compare dependencies by reference, not deep equality. A new object literal {} fails shallow comparison even if its content is identical.

5. Dependency array  
   The list of values that useMemo and useCallback watch. React recalculates when any value in the array changes.

6. Reference stability  
   Functions and objects created inside a component get a new reference on every render. This is why useCallback matters when passing callbacks to memoized children.

### Insight

Memoization adds complexity. Apply it only after profiling and identifying actual performance problems. Over-memoizing with useMemo and useCallback often slows things down because React still has to compare dependencies on every render.

### Examples

1. React.memo to skip re-renders
```javascript
const UserCard = React.memo(function UserCard({ name, email }) {
  return (
    <div>
      <p>{name}</p>
      <p>{email}</p>
    </div>
  )
})
```

2. useMemo for expensive computation
```javascript
function ProductList({ products, filterText }) {
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filterText)),
    [products, filterText]
  )

  return filtered.map(p => <div key={p.id}>{p.name}</div>)
}
```

3. useCallback to stabilize function reference
```javascript
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <MemoizedChild onClick={handleClick} />
    </div>
  )
}

const MemoizedChild = React.memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click me</button>
})
```

4. useMemo with a custom equality check via React.memo
```javascript
const Chart = React.memo(
  function Chart({ data }) {
    return <svg>{/* render data */}</svg>
  },
  (prevProps, nextProps) => prevProps.data.length === nextProps.data.length
)
```

5. Avoiding unnecessary useMemo
```javascript
// No need to memoize simple operations
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])

// Just compute it directly
const fullName = `${firstName} ${lastName}`
```

### Common patterns

- Apply React.memo to components that render frequently with stable props
- Use useCallback when passing functions to memoized child components
- Use useMemo for derived data that is expensive to compute from large arrays
- Profile with React DevTools before adding memoization
- Keep dependency arrays accurate to avoid stale closures

### Common mistakes

- Memoizing everything by default without measuring first
- Using useMemo for trivial computations where the overhead exceeds the savings
- Forgetting to add a dependency to the array, causing stale values
- Passing new object or array literals as props to React.memo components (breaks memoization)
- Using useCallback on functions that are not passed to memoized children (has no effect)


**React.memo + useCallback**

`React.memo` prevents a child from re-rendering when the parent re-renders, as long as the props didn't change.

The problem is that functions are objects in JavaScript — every render creates a new reference, so `React.memo` always sees a "new" function prop and re-renders anyway.

`useCallback` fixes that by returning the same function reference across renders.

They only make sense together when a function is passed as a prop:

```tsx
// Parent
const handleClick = useCallback(() => alert('Oi'), []);
return <SimpleButton onClick={handleClick} />;

// Child
const SimpleButton = React.memo(({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
));
```

**The rule:**
- Child re-rendering unnecessarily → `React.memo`
- Passing a function as prop to a memoized child → `useCallback`
- One without the other is usually pointless