import { useEffect, useState } from "react"

interface User {
  id: number
  name: string
  email: string
}

const useFetch = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true);
    fetch(`http://localhost:3001/users/${userId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [userId])

  return { loading, error, user }
}

export default function App() {
  // The component below mixes fetch logic with rendering.Extract a useFetch(url) hook that returns { data, loading, error }. After the refactor, the component must have zero fetch logic.
  const { loading, error, user } = useFetch("1")

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error</div>

  // GET http://localhost:3001/users/1

  // 34. Extract useFetch(url) returning { data, loading, error } 35. UserProfile must have zero fetch logic after the refactor
  // 36. Cancel in -flight requests with AbortController when userId changes

  return (
    <>
      User: {user?.name}
    </>
  )
}