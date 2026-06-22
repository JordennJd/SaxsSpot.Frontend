FROM node:alpine AS build

RUN npm install -g yarn@1.22.22 \
 && yarn --version

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --ignore-scripts
RUN yarn add -D esbuild@0.25.5 && yarn install --frozen-lockfile

COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./

COPY src ./src
COPY public ./public
COPY . .
COPY .env.devspot .env

RUN yarn run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
