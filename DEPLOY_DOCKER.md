# Docker & Docker Compose deployment

This guide helps you run the chat app in containers for local testing or simple deployments.

Build and run locally (Docker required)

```bash
# from repo root
docker-compose build
docker-compose up
```

- Backend will be available at: http://localhost:8000/
- Frontend will be available at: http://localhost:3000/

Notes about WebSocket URL
- The example `docker-compose.yml` sets `VITE_WS_URL=ws://host.docker.internal:8000/ws` for the frontend container to reach the backend on macOS. If you run on Linux, replace `host.docker.internal` with the host IP or a docker network alias.

Production considerations
- For production, build images and push to a container registry and run behind a reverse proxy that terminates TLS (Traefik, nginx, cloud provider load balancer).
- When serving frontend over HTTPS, configure `VITE_WS_URL` to use `wss://<your-backend-domain>/ws`.
- Remember: the app uses in-memory presence/messages. Multiple backend replicas will not share state unless you introduce a shared store or broker.

Troubleshooting
- If frontend cannot reach backend websockets, verify `VITE_WS_URL` value and that backend port is reachable from the frontend container.
- Check container logs:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```
