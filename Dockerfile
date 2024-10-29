FROM node:18-alpine

ENV NODE_ENV=production
ARG NPM_BUILD="npm install --omit=dev"
EXPOSE 8080/tcp

LABEL maintainer="Paxton Warin"
LABEL summary="Helium Image"
LABEL description="Example app of Helium which could be deployed in production."

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
RUN apk add --upgrade --no-cache python3 make g++
RUN $NPM_BUILD

COPY . .

ENTRYPOINT [ "node" ]
CMD ["src/index.js"]