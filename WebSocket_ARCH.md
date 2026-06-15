# WebSocket architecture

Overview
- Single WebSocket endpoint at `/ws` handles all realtime traffic.
- Clients send a `join` message immediately after opening the socket to register a username.

Message envelope
- All frames are JSON objects with a `type` key and additional properties.

Common types
- `join` — client -> server: `{ type: 'join', username }`.
- `presence` — server -> clients: `{ type: 'presence', users: [...], timestamp }`.
- `message` — global chat message: `{ type: 'message', from, text, timestamp }`.
- `private_message` — private chat: `{ type: 'private_message', from, to, text, timestamp }`.
- `typing` — typing indicator: `{ type: 'typing', from, to? }`.
- `heartbeat` / `heartbeat_ack` — keepalive.
- `error` — server -> client with `reason` field.

Server responsibilities
- Enforce unique usernames among active sockets.
- Broadcast presence list on connect/disconnect.
- Broadcast global messages to all connected sockets.
- Deliver private messages only to recipient and sender (echo).
- Handle simple typing indicators and heartbeat.

Client responsibilities
- Send `join` after open.
- Reconnect with exponential backoff on network blips (not on refresh).
- Not persist messages — refreshing clears local UI state (by design).
