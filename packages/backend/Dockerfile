FROM node:20 as build
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN NODE_ENV=production npm run build

FROM node:20-slim
RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
RUN apt-get install curl -y
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/yarn.lock .
RUN yarn --production

ENV NODE_ENV production

EXPOSE 3000

HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

CMD dumb-init node dist/main.js
