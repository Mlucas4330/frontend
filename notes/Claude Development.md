ID: 202603291  
Tags: #claude #workflow

### Core idea

Claude Development is the practice of using Claude as an active collaborator in your development workflow. Instead of writing code in isolation, you work with Claude to plan, implement, review, and debug faster.

### Why it matters

- Reduces time spent on boilerplate and repetitive tasks
- Provides a second perspective on architecture and design decisions
- Surfaces edge cases and bugs before code review
- Accelerates learning by explaining unfamiliar code in context

### Key concepts

1. Prompting for code  
   Describe the problem, not the solution. Include context: what the file does, what constraints exist, what the expected input and output are.

2. Iterative refinement  
   Treat Claude's first output as a draft. Review it, ask for changes, and iterate. Do not accept the first response if it misses requirements.

3. Context window  
   Claude works best when you provide relevant context: existing code, error messages, file structure. Paste what matters.

4. Code review assistance  
   Ask Claude to review a diff or a function for bugs, edge cases, security issues, or style inconsistencies.

5. Debugging with Claude  
   Share the error message, the stack trace, and the relevant code. Describe what you expected versus what happened.

6. Generating tests  
   Describe the function's behavior and ask Claude to generate unit or integration tests. Verify the tests are correct and cover the right cases.

### Insight

Claude works best when you are specific. "Fix this code" produces generic results. "This function should return an empty array when the input is null, but it throws a TypeError. Fix it." produces a targeted solution.

### Examples

1. Prompting for a specific function
```
Context: I have a React hook that fetches user data using React Query.
Task: Add error retry logic with exponential backoff, limited to 3 retries.
Constraint: Use the existing useQuery setup. Do not add new dependencies.
```

2. Debugging with error context
```
Error: TypeError: Cannot read properties of undefined (reading 'map')
Stack: at UserList (UserList.jsx:12)
Code: const items = data.users.map(u => <li>{u.name}</li>)
What I expected: A list of user names
What happened: Error on initial render before data loads
```

3. Code review prompt
```
Review this function for:
1. Edge cases that are not handled
2. Security issues
3. Performance problems

[paste function here]
```

4. Generating tests
```
Here is a utility function that validates email addresses.
Write unit tests that cover:
- Valid emails
- Missing @ symbol
- Missing domain
- Empty string input
- Null input

[paste function here]
```

5. Architecture question
```
I have a React app with 3 pages that all need access to the current user.
Currently I fetch the user in each page component separately.
What is the best way to share this data without prop drilling?
Constraints: No Redux, prefer built-in React tools.
```

### Common patterns

- Provide error messages, stack traces, and relevant code in debugging prompts
- State constraints explicitly (no new libraries, keep the existing API, match the current code style)
- Ask Claude to explain the code it wrote, not just to write it
- Use Claude for code review before submitting a PR
- Break large tasks into smaller prompts instead of asking for everything at once

### Common mistakes

- Giving vague prompts without context or constraints
- Accepting code without reading and understanding it
- Not testing generated code before committing
- Asking Claude to generate large amounts of code at once without reviewing each piece
- Using Claude as a replacement for understanding the problem instead of a tool to solve it faster
