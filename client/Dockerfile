FROM node:20-alpine AS build

WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client

COPY client ./client
COPY shared ./shared

ARG VITE_API_URL=
ARG VITE_HERO_VIDEO=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_HERO_VIDEO=$VITE_HERO_VIDEO

RUN npm run build --prefix client

FROM nginx:1.27-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
