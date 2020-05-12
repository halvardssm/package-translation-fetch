FROM node:alpine

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn --frozen-lockfile

COPY . /app

RUN yarn build
