from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from .manager import ConnectionManager, utc_iso
import os
import json

app = FastAPI()
manager = ConnectionManager()

# Allow origins configurable via env for simple deployment. For local dev allow all.
allow_origins = os.getenv("ALLOW_ORIGINS", "*")

if allow_origins == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in allow_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root(request: Request):
    return {"status": "ok", "msg": "Temporary chat server"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept the WebSocket connection before reading messages
    await websocket.accept()
    # Note: ConnectionManager.connect no longer calls accept()
    username: str = ""
    try:
        # wait for join payload first
        data = await websocket.receive_text()
        payload = json.loads(data)
        if payload.get("type") != "join" or not payload.get("username"):
            await websocket.accept()
            await websocket.send_json({"type": "error", "reason": "must_join_with_username"})
            await websocket.close()
            return
        username = payload.get("username").strip()
        if not username:
            await websocket.accept()
            await websocket.send_json({"type": "error", "reason": "empty_username"})
            await websocket.close()
            return

        ok = await manager.connect(username, websocket)
        if not ok:
            return

        # Announce join
        await manager.broadcast({"type": "join", "username": username, "timestamp": utc_iso()})

        # message receive loop
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except Exception:
                continue

            mtype = msg.get("type")
            # Global chat message
            if mtype == "message":
                text = msg.get("text", "")
                payload = {
                    "type": "message",
                    "from": username,
                    "text": text,
                    "timestamp": utc_iso(),
                }
                await manager.broadcast(payload)

            # Private message
            elif mtype == "private_message":
                to = msg.get("to")
                text = msg.get("text", "")
                if to and to in manager.active:
                    payload = {
                        "type": "private_message",
                        "from": username,
                        "to": to,
                        "text": text,
                        "timestamp": utc_iso(),
                    }
                    # send to recipient and echo to sender
                    await manager.send_to(to, payload)
                    await manager.send_to(username, payload)
                else:
                    await websocket.send_json({"type": "error", "reason": "user_offline_or_missing"})

            # Typing indicators
            elif mtype == "typing":
                to = msg.get("to")
                payload = {"type": "typing", "from": username, "to": to, "timestamp": utc_iso()}
                if to:
                    # private typing
                    if to in manager.active:
                        await manager.send_to(to, payload)
                else:
                    # global typing
                    await manager.broadcast(payload)

            # heartbeat: clients can send to keep connection alive
            elif mtype == "heartbeat":
                await websocket.send_json({"type": "heartbeat_ack", "timestamp": utc_iso()})

    except WebSocketDisconnect:
        pass
    except Exception:
        # swallow other errors
        pass
    finally:
        if username:
            await manager.disconnect(username)
            await manager.broadcast({"type": "leave", "username": username, "timestamp": utc_iso()})
