ID: 202604071  
Tags: #react #component-identity

### Core idea

The `key` prop is React's way of identifying component instances. When the key changes, React destroys the old instance and mounts a new one from scratch, resetting all local state, refs, and effects.

### Why it matters

- Lets you reset a component's state without lifting it up or adding imperative logic
- Prevents React from reusing the wrong instance when list items are reordered
- Makes component identity explicit and predictable
- Eliminates the need for `useEffect` cleanup logic just to reset state on a prop change

### Key concepts

1. Component identity  
   React tracks each component instance by its position in the tree and its key. Two elements with different keys are treated as completely separate instances, even if they have the same type.

2. Reconciliation  
   When React re-renders, it compares the previous and next trees. If a key changes, React skips diffing and unmounts the old instance, then mounts a fresh one.

3. Forced reset via key  
   Passing a changing value as `key` to a component is the idiomatic way to reset all internal state. No `useEffect`, no `ref.reset()` — just change the key.

4. List rendering  
   Keys in lists tell React which item corresponds to which DOM node across renders. Without stable keys, React reuses DOM nodes incorrectly when items are added, removed, or reordered.

5. Unstable keys  
   Using array index as a key causes bugs when the list order changes. React maps index 0 to the first DOM node, so reordering items will reuse the wrong state.

6. Key scope  
   Keys only need to be unique among siblings. They do not need to be globally unique across the entire tree.

### Insight

The key prop is a reset hatch. When a child component manages state you need to clear in response to a parent change, the cleanest solution is almost always to give it a new key. No imperative refs, no effect cleanup, no extra state in the parent.

### Examples

1. Resetting form state when the selected user changes
```tsx
export default function App() {
  const users = [
    { id: 1, name: "Ana", email: "ana@email.com" },
    { id: 2, name: "Bruno", email: "bruno@email.com" },
    { id: 3, name: "Carla", email: "carla@email.com" },
  ]
  const [selectedId, setSelectedId] = useState(users[0].id)

  return (
    <UserForm key={selectedId} users={users} onSelect={setSelectedId} />
  )
}
```

2. Stable key in a list
```tsx
users.map(user => (
  <UserCard key={user.id} name={user.name} email={user.email} />
))
```

3. Unstable key — avoid this
```tsx
// Buggy: index-based key breaks when items are reordered or removed
items.map((item, index) => (
  <Item key={index} value={item.value} />
))
```

4. Key-based reset without lifting state
```tsx
function ProfileEditor({ userId }: { userId: number }) {
  // All useState inside here resets automatically when userId changes
  const [draft, setDraft] = useState('')

  return <textarea value={draft} onChange={e => setDraft(e.target.value)} />
}

// Parent just changes the key
<ProfileEditor key={userId} userId={userId} />
```

### Common patterns

- Use `key={entityId}` on a form or editor component to reset it when the selected entity changes
- Always use a stable, unique identifier (database ID, UUID) as the key in lists
- Use key to remount a component after a successful submit instead of manually clearing each field
- Keep keys consistent between renders — avoid generating them with `Math.random()` or `Date.now()`

### Common mistakes

- Using array index as key in dynamic lists (causes state mismatches on reorder or deletion)
- Expecting the same key to persist state across different parent components
- Adding a `useEffect` to reset state on prop change when a key change would be simpler
- Generating a new key on every render (e.g., `key={Math.random()}`), causing unnecessary unmounts
- Omitting keys in lists entirely, causing React DevTools warnings and potential rendering bugs
