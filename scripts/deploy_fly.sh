#!/usr/bin/env bash
set -euo pipefail

# Simple helper to deploy backend to Fly.io
# Requirements: `flyctl` installed and you're logged in: `flyctl auth login`

APP_NAME=${1:-temp-chat-backend}
REGION=${2:-ord}

echo "Launching or updating Fly app: $APP_NAME (region: $REGION)"

if ! flyctl apps list | grep -q "^${APP_NAME}\b"; then
  echo "Creating app $APP_NAME in region $REGION..."
  flyctl apps create "$APP_NAME" --region "$REGION"
fi

echo "Setting secrets and deploying..."
# Example: set allowed origins secret (adjust as needed)
flyctl secrets set ALLOW_ORIGINS="https://your-frontend-domain"

# Deploy using Dockerfile in backend/
pushd backend >/dev/null
flyctl deploy --app "$APP_NAME"
popd >/dev/null

echo "Deployed. Get status with: flyctl status --app $APP_NAME"
