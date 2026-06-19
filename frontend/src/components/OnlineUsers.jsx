import React from 'react'

export default function OnlineUsers({ users, onSelect, current, connectionStatus, unread = {} }) {
  return (
    <div className="online-users">
      <div className="users-header">
        <strong>Online</strong>
        <div className={`status ${connectionStatus}`}>{connectionStatus}</div>
      </div>
      <ul>
        {users.map((u) => (
          <li key={u} className={u === current ? 'me' : ''} onClick={() => onSelect(u)}>
            <span className="user-name">{u}</span>
            {unread[u] ? <span className="badge">{unread[u] > 9 ? '9+' : unread[u]}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
