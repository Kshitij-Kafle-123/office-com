FROM node:18-alpine AS builder
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent

# build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: custom nginx config could be added here
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
