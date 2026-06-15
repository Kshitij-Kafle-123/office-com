# Deploy Backend to Fly.io

Prereqs
- Install `flyctl`: https://fly.io/docs/hands-on/install-flyctl/
- Docker (for building the image) or let `flyctl` build for you.

Quick deploy steps

1. Login and create app

```bash
flyctl auth login
cd backend
flyctl launch --name temp-chat-backend --region ord --no-deploy
```

2. Set required secrets (from repo root)

```bash
flyctl secrets set ALLOW_ORIGINS="https://your-frontend-domain"
```

3. Deploy

```bash
cd backend
flyctl deploy --app temp-chat-backend
```

4. Update frontend env

Set `VITE_WS_URL=wss://temp-chat-backend.fly.dev/ws` in your frontend host (Vercel/Netlify) environment.

Notes
- The project includes `backend/Dockerfile` which Fly will use by default.
- When using Fly, the app URL will be `<appname>.fly.dev` by default.
- This backend stores presence/messages in memory; scaling to multiple instances requires a shared store/pubsub.

Script helper

Run the helper script from the repo root to create/apply and deploy:

```bash
./scripts/deploy_fly.sh temp-chat-backend ord
```
