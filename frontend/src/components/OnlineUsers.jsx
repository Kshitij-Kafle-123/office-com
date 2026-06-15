import React from 'react'

export default function OnlineUsers({ users, onSelect, current, connectionStatus }) {
  return (
    <div className="online-users">
      <div className="users-header">
        <strong>Online</strong>
        <div className={`status ${connectionStatus}`}>{connectionStatus}</div>
      </div>
      <ul>
        {users.map((u) => (
          <li key={u} className={u === current ? 'me' : ''} onClick={() => onSelect(u)}>
            {u}
          </li>
        ))}
      </ul>
    </div>
  )
}
