# Backend deployment guide (Render / Railway / Fly.io)

Render

- Create a new Web Service on Render.
- Connect your repo and choose the `backend/` folder as the root.
- Build & Start commands:
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Ensure `PORT` env var is set (Render provides one).
- Set `ALLOW_ORIGINS` to your frontend origin (e.g. `https://your-frontend.vercel.app`) for production.

Notes: Render supports WebSockets on web services; make sure your plan and service settings allow connections.

Railway

- Create a new project and link the repo.
- Set the root to `backend/` and the start command same as Render.

Fly.io

- `fly launch` inside `backend/` and configure the start command to run uvicorn.
- Set environment variables via `fly secrets set PORT=8080 ALLOW_ORIGINS='https://...'`.
