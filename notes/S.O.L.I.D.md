ID: 202603276  
Tags: #react #architecture

### Core idea

SOLID is a set of five design principles for writing maintainable, reusable, and testable code. Applied to React, they guide how you design components, hooks, and data flow.

### Why it matters

- Makes components reusable and independently testable
- Reduces coupling between different parts of the app
- Encourages predictable and maintainable data flow
- Minimizes bugs caused by mixed responsibilities

### Key concepts

1. Single Responsibility Principle (SRP)  
   Each component does one thing. Avoid mixing UI rendering, data fetching, and business logic in the same component.

2. Open/Closed Principle (OCP)  
   Components are open for extension but closed for modification. Extend behavior through props, composition, or hooks without changing the original component.

3. Liskov Substitution Principle (LSP)  
   You should be able to replace a component with a different implementation without breaking the consumers. A mock and a real API component should be interchangeable.

4. Interface Segregation Principle (ISP)  
   Pass only the data a component needs. Avoid sending large objects with unrelated fields through props.

5. Dependency Inversion Principle (DIP)  
   High-level components depend on abstractions (hooks, context, interfaces), not on concrete implementations like a specific API client or library.

### Insight

React naturally encourages SOLID through functional components, hooks, and unidirectional data flow. Violations appear most often as monolithic components that fetch, transform, and render all at once.

### Examples

1. SRP: Split UI from logic
```javascript
// Bad: one component does everything
function UserProfile() {
  const [user, setUser] = useState(null)
  useEffect(() => { fetch('/api/user').then(r => r.json()).then(setUser) }, [])
  return <div>{user?.name}</div>
}

// Good: separate the fetching from the rendering
function useUser() {
  const [user, setUser] = useState(null)
  useEffect(() => { fetch('/api/user').then(r => r.json()).then(setUser) }, [])
  return user
}

function UserProfile() {
  const user = useUser()
  return <div>{user?.name}</div>
}
```

2. OCP: Extend without modification
```javascript
function Button({ label, onClick, style }) {
  return <button style={style} onClick={onClick}>{label}</button>
}

function PrimaryButton(props) {
  return <Button {...props} style={{ background: 'blue', color: 'white' }} />
}

function DangerButton(props) {
  return <Button {...props} style={{ background: 'red', color: 'white' }} />
}
```

3. LSP: Substitute implementations
```javascript
function UserProfile({ userService }) {
  const user = userService.getUser()
  return <div>{user.name}</div>
}

const realService = { getUser: () => fetchUserFromAPI() }
const mockService = { getUser: () => ({ name: 'Test User' }) }
```

4. ISP: Pass only what is needed
```javascript
// Bad: passes the entire user object
function WelcomeMessage({ user }) {
  return <div>Welcome, {user.name}</div>
}

// Good: passes only what the component uses
function WelcomeMessage({ userName }) {
  return <div>Welcome, {userName}</div>
}
```

5. DIP: Depend on abstractions
```javascript
// Bad: component directly imports a specific auth library
import { authClient } from './firebase'

function Dashboard() {
  const user = authClient.getCurrentUser()
  return <div>{user.name}</div>
}

// Good: component depends on a hook abstraction
function Dashboard() {
  const { user } = useAuth()
  return <div>{user.name}</div>
}
```

### Common patterns

- Extract data fetching into custom hooks, keep components pure renderers
- Use composition to extend components instead of conditional rendering inside them
- Accept service or API abstractions as props or via context for easy testing
- Keep props interfaces narrow and focused on what the component renders
- Use context to inject dependencies like auth, theme, or API clients

### Common mistakes

- Combining fetching, transformation, and rendering in one component
- Adding new conditional behavior inside existing components instead of composing
- Passing entire data objects through props when only one field is used
- Importing concrete dependencies directly inside components instead of injecting them
- Writing components that are impossible to test without mocking specific modules
