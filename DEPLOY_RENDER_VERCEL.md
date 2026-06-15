# Deploying Backend to Render and Frontend to Vercel

This document walks through connecting the repository to Render (backend) and Vercel (frontend) and configuring required environment variables and secrets.

Prereqs
- A GitHub repository with this project pushed.
- Accounts on Render and Vercel.

Frontend (Vercel)
1. Create a new project in Vercel and import your GitHub repository.
2. When asked for the root directory, choose `frontend/`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add Environment Variable in Vercel project settings:
   - `VITE_WS_URL` -> `wss://<YOUR_BACKEND_HOST>/ws`
6. Get Vercel Project ID and Org ID from project settings and add them to your GitHub repository secrets:
   - `VERCEL_TOKEN` (create a personal token in Vercel)
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
7. Push to `main` — the GitHub Action `.github/workflows/deploy_frontend_vercel.yml` will run (if enabled).

Backend (Render)
1. Create a new Web Service on Render and connect your GitHub repository.
2. Set the root directory to `backend/`.
3. Use the build command: `pip install -r requirements.txt`.
4. Use the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. In Environment, add:
   - `ALLOW_ORIGINS` -> `https://<your-frontend-domain>` (for production)
6. Optionally add the provided `render.yaml` at root so Render can automatically detect and configure the service.

Triggering deploys from GitHub (CI)

You can automate backend deploys from GitHub using Render's Deploys API. The repo includes `.github/workflows/deploy_backend_render.yml` which will POST to the Render API to create a new deploy on every push to `main`.

Required GitHub Secrets (set in repository Settings -> Secrets):
- `RENDER_API_KEY` — create an API key in Render: Dashboard → Account → API Keys → New API Key. Copy and paste it into GitHub Secrets.
- `RENDER_SERVICE_ID` — the ID of your service. Find it in Render Dashboard: open the service, go to Settings → General → click "View Service JSON" or check the URL. The service ID is a UUID you can paste into GitHub Secrets.

Notes:
- The GitHub Action simply triggers a deploy; Render will run your build and start commands from the service configuration.
- If you prefer full control, create the service manually in Render first (so you have the `RENDER_SERVICE_ID`), or use `render.yaml` and Render's UI to import.


Notes and secrets
- For the frontend GitHub Action to deploy automatically to Vercel you must set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in GitHub Secrets.
- For Render, use the render dashboard to connect GitHub for automatic deploys.

Testing after deploy
- Frontend should be available at `https://<your-vercel-domain>`.
- Backend should be available at `https://<your-render-domain>/` and WebSocket at `wss://<your-render-domain>/ws`.
- Ensure `VITE_WS_URL` is set to the `wss://` URL.

Troubleshooting
- If WebSocket fails, check that `ALLOW_ORIGINS` includes the exact frontend origin and that `wss://` is used.
- Check service logs on Render and deployment logs on Vercel.
