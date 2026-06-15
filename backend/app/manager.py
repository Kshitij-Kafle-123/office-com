from typing import Dict, Optional, List
from fastapi import WebSocket
import asyncio
from datetime import datetime


def utc_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


class ConnectionManager:
    """Manage connected WebSocket clients and provide helpers for messaging.

    - active: maps username -> WebSocket
    - lock: protect concurrent updates
    """

    def __init__(self):
        self.active: Dict[str, WebSocket] = {}
        self.lock = asyncio.Lock()

    async def connect(self, username: str, websocket: WebSocket) -> bool:
        """Try to register a username. Returns False if username already taken."""
        async with self.lock:
            if username in self.active:
                # Username already connected
                await websocket.send_json({"type": "error", "reason": "username_taken"})
                await websocket.close()
                return False
            self.active[username] = websocket
        # notify presence after release
        await self.broadcast_presence()
        return True

    async def disconnect(self, username: str) -> None:
        async with self.lock:
            if username in self.active:
                try:
                    # try closing gracefully
                    await self.active[username].close()
                except Exception:
                    pass
                del self.active[username]
        await self.broadcast_presence()

    async def send_to(self, username: str, message: dict) -> None:
        ws = self.active.get(username)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                # ignore send errors; cleanup occurs on disconnect
                pass

    async def broadcast(self, message: dict) -> None:
        # copy values to avoid runtime changes
        conns: List[WebSocket] = list(self.active.values())
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def broadcast_presence(self) -> None:
        users = sorted(list(self.active.keys()))
        payload = {"type": "presence", "users": users, "timestamp": utc_iso()}
        await self.broadcast(payload)
