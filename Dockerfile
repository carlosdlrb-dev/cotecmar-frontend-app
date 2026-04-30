# Multi-stage build para producción eficiente
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json primero (mejor caché)
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de producción
RUN npm run build

# Stage 2: Servir con nginx
FROM nginx:alpine

# Copiar la build de Vite al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración custom de nginx si existe
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
