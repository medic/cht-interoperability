FROM node:22-alpine

WORKDIR /scripts/configurator

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY ./ ./

CMD ["npm", "run", "configure"]
