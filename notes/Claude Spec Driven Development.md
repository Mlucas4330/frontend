ID: 202603292  
Tags: #claude #workflow #methodology

### Core idea

Spec Driven Development with Claude means writing a detailed specification before any code. You describe the expected behavior, inputs, outputs, and edge cases in plain language or structured format. Claude implements from the spec, not from vague instructions.

### Why it matters

- Forces clarity before implementation, catching ambiguity early
- Produces code that matches the intended behavior from the first attempt
- Creates documentation alongside the code
- Reduces back-and-forth because the spec contains the answers

### Key concepts

1. Specification  
   A precise written description of what a piece of code should do. Covers inputs, outputs, side effects, and edge cases. Not a description of how it should do it.

2. Behavior-first  
   You describe what the system does from the outside, not how it works inside. This keeps the spec technology-agnostic and focused on correctness.

3. Edge cases in the spec  
   Every edge case you can think of before writing code prevents a bug later. Include null inputs, empty arrays, maximum values, concurrent requests.

4. Acceptance criteria  
   Conditions that must be true for the implementation to be considered correct. Derived directly from the spec. Used to write tests.

5. Spec as test  
   A well-written spec maps directly to test cases. Each behavior statement becomes an assertion.

6. Iterating on the spec  
   The spec is not fixed. When Claude's output reveals an ambiguity in the spec, update the spec and re-generate. The spec is the source of truth.

### Insight

The quality of the output matches the quality of the spec. A two-sentence prompt produces a guess. A ten-point spec produces a working implementation. Time spent on the spec saves more time than it costs.

### Examples

1. A basic spec for a validation function
```
Function: validateEmail(email)

Input: a string
Output: boolean - true if the email is valid, false otherwise

Rules:
- Must contain exactly one @ symbol
- Must have a non-empty local part (before @)
- Must have a domain with at least one dot
- Must not have spaces
- Empty string returns false
- Null or undefined input returns false
```

2. A spec for a React component
```
Component: Pagination

Props:
- currentPage: number (1-indexed)
- totalPages: number
- onPageChange: (page: number) => void

Behavior:
- Renders Previous and Next buttons
- Previous is disabled when currentPage is 1
- Next is disabled when currentPage equals totalPages
- Clicking Previous calls onPageChange(currentPage - 1)
- Clicking Next calls onPageChange(currentPage + 1)
- Displays current page and total: "3 / 10"
- Does not render if totalPages is 1
```

3. A spec for an API endpoint
```
POST /api/users

Request body:
- name: string, required, max 100 chars
- email: string, required, valid email format
- role: 'admin' | 'user', optional, defaults to 'user'

Success response: 201 Created
Body: { id, name, email, role, createdAt }

Error cases:
- Missing name or email: 400 Bad Request with message
- Invalid email format: 400 Bad Request with message
- Email already exists: 409 Conflict with message
- Server error: 500 Internal Server Error
```

4. Prompting Claude with a spec
```
Here is a specification for a pagination component.
Implement it in React with TypeScript.
Use Tailwind for styling.
Write the component and its unit tests.

[paste spec here]
```

### Common patterns

- Write the spec in plain language, not pseudocode
- Include all edge cases you can think of before asking for implementation
- Map each spec rule to a test case
- Keep specs short and focused on one piece of functionality
- Update the spec when requirements change, then re-generate the code

### Common mistakes

- Writing a spec that describes the implementation instead of the behavior
- Skipping edge cases in the spec and discovering them in production
- Using the spec once and discarding it instead of keeping it as documentation
- Writing overly long specs with implementation details that constrain Claude unnecessarily
- Not verifying that the generated code actually satisfies each rule in the spec
