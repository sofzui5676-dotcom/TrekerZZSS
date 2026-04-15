FROM nginx:alpine

# Копируем ВСЁ в root
COPY public/ /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY public/manifest.json /usr/share/nginx/html/manifest.json
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# ВРЕМЕННО: пингуй бэкенд при старте чтобы проверить доступность
RUN apk add --no-cache curl

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]