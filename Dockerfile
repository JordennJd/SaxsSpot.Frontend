FROM node:alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=optional --ignore-scripts
RUN npm install -D esbuild@0.25.5 --ignore-scripts

COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./

# 4. Копируем остальные файлы
COPY src ./src
COPY public ./public
COPY . .
COPY .env.devspot .env

# 5. Собираем проект
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]