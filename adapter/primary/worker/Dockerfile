FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY . .

FROM base as builder

WORKDIR /usr/src/app/adapter/primary/worker/

RUN yarn

RUN yarn build


FROM node:20-alpine

WORKDIR /usr/src/app

COPY adapter/primary/worker/package.json ./
COPY adapter/primary/worker/yarn.lock ./

RUN yarn --production

COPY --from=builder /usr/src/app/adapter/primary/worker/dist/ ./

ENTRYPOINT ["node","./app.js"]
