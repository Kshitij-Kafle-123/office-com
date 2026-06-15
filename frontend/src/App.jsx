import React, { useState } from 'react'
import Login from './components/Login'
import Chat from './components/Chat'

export default function App() {
  const [username, setUsername] = useState(null)

  return (
    <div className="app-root">
      {!username ? (
        <Login onJoin={(name) => setUsername(name)} />
      ) : (
        <Chat username={username} onLogout={() => setUsername(null)} />
      )}
    </div>
  )
}
