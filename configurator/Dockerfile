FROM node:16-alpine

RUN apk add g++ make py3-pip git curl

WORKDIR /scripts/configurator

COPY ./configurator ./

RUN npm install

WORKDIR /scripts/cht-config

COPY ../cht-config ./

RUN npm install && npm install -g cht-conf && python -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic

WORKDIR /scripts

RUN echo "cd /scripts/configurator && npm run configure && cd /scripts/cht-config && npm run deploy && exit 0" > ./startup.sh

RUN chmod +x ./startup.sh

CMD ["sh", "./startup.sh"]
