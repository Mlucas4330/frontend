ID: 202603289  
Tags: #testing #react

### Core idea

Testing verifies your application behaves correctly. In React, you write tests at three levels: unit (individual functions), integration (component behavior), and end-to-end (full user flows). Each level catches different types of bugs.

### Why it matters

- Catches regressions before they reach production
- Documents expected behavior alongside the code
- Lets you refactor with confidence
- Reduces manual QA time for repeated scenarios

### Key concepts

1. Unit test  
   Tests a single function or hook in isolation. Fast and precise. Does not render components.

2. Integration test  
   Tests one or more components working together. Renders components, fires events, asserts on output. The most useful type for React applications.

3. End-to-end (E2E) test  
   Runs the full application in a real browser. Tests complete user flows. Slow but catches issues that unit and integration tests miss.

4. Testing Library  
   The standard library for testing React components. Encourages testing from the user's perspective: find elements by role, label, or text rather than by class or id.

5. Vitest / Jest  
   Test runners. Vitest is recommended for Vite projects. Jest works well with Create React App and older setups.

6. Playwright / Cypress  
   Tools for E2E testing. Playwright is faster and supports multiple browsers. Cypress has a better developer experience for debugging.

7. Test doubles  
   Mocks, stubs, and spies. Use them to replace external dependencies like APIs and timers in unit and integration tests.

8. Coverage  
   Measures what percentage of code is executed by tests. High coverage does not equal good tests. Focus on testing behavior, not lines.

### Insight

Write tests at the level closest to your code's interface. For React, integration tests with Testing Library give the most confidence for the least effort. E2E tests are expensive; use them for critical paths only.

### Examples

1. Integration test with React Testing Library
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'

test('increments count on button click', () => {
  render(<Counter />)

  const button = screen.getByRole('button', { name: /increment/i })
  fireEvent.click(button)

  expect(screen.getByText('1')).toBeInTheDocument()
})
```

2. Testing async data fetching
```javascript
import { render, screen, waitFor } from '@testing-library/react'
import UserProfile from './UserProfile'

test('displays user name after loading', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ name: 'Alice' })
  })

  render(<UserProfile userId="1" />)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
```

3. Unit test for a utility function
```javascript
import { formatPrice } from './utils'

test('formats price with two decimal places', () => {
  expect(formatPrice(10)).toBe('$10.00')
  expect(formatPrice(9.9)).toBe('$9.90')
})
```

4. Testing a custom hook
```javascript
import { renderHook, act } from '@testing-library/react'
import useCounter from './useCounter'

test('increments counter', () => {
  const { result } = renderHook(() => useCounter())

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

5. Mocking a module
```javascript
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'Bob' })
}))
```

6. E2E test with Playwright
```javascript
import { test, expect } from '@playwright/test'

test('user can log in', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'user@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
})
```

### Common patterns

- Query elements by accessible role or label, not by CSS class or test-id
- Use userEvent instead of fireEvent for more realistic interaction simulation
- Group setup in beforeEach and teardown in afterEach
- Test the component's output, not its internal state
- Write E2E tests only for the most critical user flows

### Common mistakes

- Testing implementation details instead of observable behavior
- Using getByTestId for everything instead of accessible queries
- Mocking too much and testing code that never runs in production
- Writing tests after the code, skipping coverage for edge cases
- Treating high coverage as a goal instead of a side effect of good tests
