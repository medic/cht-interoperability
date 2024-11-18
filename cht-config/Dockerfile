FROM node:16-slim

RUN apt update \
    && apt install --no-install-recommends -y \
      curl \
      git \
      python3-pip \
      python3-setuptools \
      python3-wheel \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic

WORKDIR /scripts/cht-config

COPY ./ ./

RUN npm install --ignore-scripts && npm install -g --ignore-scripts cht-conf 

CMD ["npm", "run", "deploy"]
