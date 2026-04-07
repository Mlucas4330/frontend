import React, { useCallback, useMemo, useState } from "react"

// For each use of React.memo, useMemo, and useCallback below, decide: necessary, unnecessary, or harmful. Justify each answer.

const Parent = () => {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  // Necessary, for not computing the calculation again for the same count
  const doubled = useMemo(() => count * 2, [count]);

  // Stabilize function reference
  const greet = useCallback(() => alert('Hello'), []);

  // Unecessary, the calculation is not expensive
  const label = useMemo(() => `User: ${name}`, [name]);

  return (
    <>
      <input onChange={e => setName(e.target.value)} />
      <HeavyChart data={expensiveData} />
      <p>{label}</p>
      <SimpleButton onClick={greet} label='Hi' />
    </>
  );
};

// Components that render frequently with stable props
const HeavyChart = React.memo(({ data }) => { /* heavy render */ });

// Not necessary, maybe some useCallback for the function, but in this case, there's no expensive that being rendered
const SimpleButton = React.memo(({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
));

// 37. Evaluate: const doubled = useMemo(...)
// 38. Evaluate: const greet = useCallback(...)
// 39. Evaluate: const label = useMemo(...)
// 40. Evaluate: React.memo on HeavyChart
// 41. Evaluate: React.memo on SimpleButton

// 37. doubled = useMemo ❌ Unnecessary
// count * 2 is a multiplication — it takes nanoseconds. useMemo has its own overhead (storing the previous value, comparing dependencies). You're paying more than you're saving. useMemo is only worth it for genuinely expensive computations like sorting 10,000 items or complex calculations.
// 38. greet = useCallback ⚠️ Depends
// Your justification "stabilize function reference" is correct, but it only matters if greet is passed to a memoized component. On its own, useCallback does nothing useful. In this case it's passed to SimpleButton which is wrapped in React.memo — so it's necessary here. If SimpleButton weren't memoized, useCallback would be pointless.
// 39. label = useMemo ✅ Unnecessary
// Correct. Template literals are cheap. The memo overhead costs more than the computation it's avoiding.
// 40. React.memo on HeavyChart ✅ Necessary
// Correct. If the chart is expensive to render and data is stable, memo prevents it from re-rendering every time name or count changes in the parent.
// 41. React.memo on SimpleButton ❌ Unnecessary without useCallback
// You got the conclusion right but the reasoning backwards. The issue is: even with React.memo, if onClick is an inline arrow function like () => setOpen(true), it's a new reference on every render and memo never prevents the re-render. In this specific case greet is stabilized with useCallback, so React.memo on SimpleButton actually works. But it's still a lot of complexity for a button that renders in microseconds — the cost/benefit doesn't justify it.
// The general rule to remember: React.memo only works when all props are stable references. useCallback and useMemo only matter when passed to memoized components. They're a package deal — one without the other is usually pointless.

export default function App() {
  return (
    <></>
  )
}