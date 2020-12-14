FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --prod --frozen-lockfile

COPY ./src ./src
COPY ./api-docs.yaml ./

EXPOSE 8080
CMD [ "node", "src/index.js" ]
