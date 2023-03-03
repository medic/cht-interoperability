FROM node:18-alpine

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

CMD npm start

EXPOSE 6000
