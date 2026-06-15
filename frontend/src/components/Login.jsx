import React, { useState } from 'react'

export default function Login({ onJoin }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Enter a display name')
    setError(null)
    onJoin(trimmed)
  }

  return (
    <div className="login-screen">
      <form className="login-box" onSubmit={submit}>
        <h2>Join Chat</h2>
        <input
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Join</button>
        <p className="muted">Refreshing clears local chat state.</p>
      </form>
    </div>
  )
}
