FROM node:18-alpine

RUN apk add g++ make py3-pip git

WORKDIR /scripts

COPY ./configurator /scripts

RUN npm install

RUN mkdir cht-config

COPY ../cht-config ./cht-config

RUN cd cht-config && npm install -g cht-conf && python -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic

CMD ["sh", "./scripts/setup.sh"]