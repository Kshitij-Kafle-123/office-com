# Frontend deployment guide (Vercel)

Vercel

- Create a new Vercel project and point it to your repo.
- Set the project root to `frontend/`.
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable `VITE_WS_URL` set to `wss://<your-backend-host>/ws`.

Important: Use `wss://` for secure WebSocket in production when frontend served over HTTPS.

Other hosts

- You can also host the static `dist/` on Netlify, Surge, or any static host — just set `VITE_WS_URL` appropriately.
