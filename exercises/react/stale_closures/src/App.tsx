import { useEffect, useState } from "react"

export default function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      console.log('count:', count)
    }, 1000)
    return () => clearInterval(id)
  }, [count])


  // 23. Identify exactly why count is always 0 inside the interval
  //  Because the setInterval doesn't change the state of count, just renders it.
  // 24. Fix it without removing the useEffect
  //  The solution is adding count to the dependency array.
  // 25. Write a plain - English explanation of what a stale closure is
  //  In React, a stale closure happens when a function inside a component "captures" outdated state or props because of how JavaScript closures work. This is common in hooks (especially useEffect, useCallback, and event handlers) when the function is created once but references variables from an old render.

  return (
    <div onClick={() => setCount(count => count + 1)}>
      {count}
    </div>
  );
}