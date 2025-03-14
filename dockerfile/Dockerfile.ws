FROM node:23-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm 

COPY ./packages ./packages
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json

COPY ./apps/chalk-websocket ./apps/chalk-websocket

RUN pnpm install
RUN pnpm run db:generate
RUN pnpm run build

EXPOSE 8081

CMD [ "pnpm", "run", "start:ws"]
