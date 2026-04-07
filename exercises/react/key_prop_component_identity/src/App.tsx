import { useState } from "react";

interface User {
  id: number
  name: string
  email: string
}

const UserForm = ({ users, onSelect }: { users: User[], onSelect: (id: number) => void }) => {
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')

  return (
    <>
      <input value={editedName} onChange={e => setEditedName(e.target.value)} />
      <input value={editedEmail} onChange={e => setEditedEmail(e.target.value)} />
      {
        users.map(user => (
          <div key={user.id} onClick={() => onSelect(user.id)}>
            {user.email} - {user.name}
          </div>
        ))
      }
    </>
  );
}

export default function App() {
  const users = [
    { id: 1, name: "Ana", email: "ana@email.com" },
    { id: 2, name: "Bruno", email: "bruno@email.com" },
    { id: 3, name: "Carla", email: "carla@email.com" },
  ];
  const [selectedId, setSelectedId] = useState(users[0].id);


  // 26. Render a <UserForm> that manages its own local state	    
  // 27. Show the user list and let the user select one
  // 28. Achieve the reset using only the key prop on the parent
  // 29. Explain what React does internally when the key changes
  // When the key changes, React treats it as a completely different component instance. It doesn't update the existing one — it destroys it and creates a new one from scratch. That means all useState, useRef, and effects inside it reset to their initial values. It's React's way of saying "this is not the same thing anymore.

  return (
    <UserForm key={selectedId} users={users} onSelect={setSelectedId} />
  );
}