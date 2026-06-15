#!/usr/bin/env python3
"""Small test: connect two websocket clients to the local backend and exercise global/private messages.

Run from the backend venv: python tools/test_ws_clients.py
"""
import asyncio
import json
import sys

try:
    import websockets
except Exception:
    print("websockets package required. Install with: pip install websockets")
    raise


async def client(name, send_queue):
    uri = 'ws://localhost:8000/ws'
    print(f"[{name}] connecting -> {uri}")
    try:
        async with websockets.connect(uri) as ws:
            # join
            await ws.send(json.dumps({"type": "join", "username": name}))

            async def receiver():
                try:
                    async for msg in ws:
                        try:
                            data = json.loads(msg)
                        except Exception:
                            data = msg
                        print(f"[{name}] RECV: {data}")
                except asyncio.CancelledError:
                    pass

            recv_task = asyncio.create_task(receiver())

            # send queued messages
            for item in send_queue:
                await asyncio.sleep(item.get('delay', 1))
                payload = item['msg']
                print(f"[{name}] SEND: {payload}")
                await ws.send(json.dumps(payload))

            # wait a bit to receive
            await asyncio.sleep(2)
            recv_task.cancel()
    except Exception as exc:
        print(f"[{name}] error: {exc}")


async def main():
    msgs_a = [
        {"delay": 1, "msg": {"type": "message", "text": "Hello from A"}},
        {"delay": 1, "msg": {"type": "private_message", "to": "B", "text": "Private hi from A"}},
    ]

    msgs_b = [
        {"delay": 2, "msg": {"type": "message", "text": "B says hi"}},
    ]

    await asyncio.gather(client('A', msgs_a), client('B', msgs_b))


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
