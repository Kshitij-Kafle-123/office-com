# Temporary Real-time Chat (FastAPI + React + Vite)

Lightweight, history-less chat app using FastAPI (WebSockets) and a React + Vite frontend.

Features
- Real-time messaging via WebSockets
- Global chat room and private 1:1 chats (in-memory only)
- No database, no auth, no user accounts
- Presence (online users), join/leave events, typing indicators
- Timestamps on messages
- Prevent duplicate usernames
- Handles reconnects; refreshing clears local chat state

Folder structure
- backend/ - FastAPI server
- frontend/ - React + Vite app

Local development

Prereqs: Python 3.10+, Node 18+, npm or yarn

Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend
```bash
cd frontend
npm install
npm run dev
```

Environment variables
- `FRONTEND_VITE_WS` (frontend): WebSocket URL, default `ws://localhost:8000/ws`
- `PORT` (backend): port for uvicorn in production

Deployment (overview)
- Backend: Render (web service) — use `uvicorn app.main:app --host 0.0.0.0 --port $PORT` as start command. Allow websockets.
- Frontend: Vercel — build with `npm run build`, set `FRONTEND_VITE_WS` to `wss://<backend-host>/ws`.

See backend/.env.example and frontend/.env.example for configuration examples and the full deployment guide in the `backend` and `frontend` folders.

WebSocket architecture
- Single WebSocket endpoint: `/ws`.
- Client sends `join` message with `username` to register.
- Server enforces unique usernames among active connections.
- Message envelope (JSON): `{ type, from, to?, text?, timestamp?, extra? }`.
- Types: `join`, `leave`, `presence`, `message` (global), `private_message`, `typing`, `error`, `heartbeat`.

Notes
- No persistence: messages only live in memory and in the client's session.
- Refresh clears local UI state intentionally.
