# Stage 1: Build the React app
FROM node:alpine AS build

WORKDIR /app

# 1. Копируем файлы зависимостей
COPY package.json package-lock.json ./

# 2. Устанавливаем зависимости (включая devDependencies для Vite)
RUN yarn install --no-audit --prefer-offline \
    --omit=optional \
    --ignore-scripts
RUN yarn add -D esbuild@0.25.5 && yarn install

# 3. Копируем конфигурационные файлы Vite
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./

# 4. Копируем остальные файлы
COPY src ./src
COPY public ./public
COPY . .
COPY .env.Docker .env

# 5. Собираем проект
RUN yarn run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]