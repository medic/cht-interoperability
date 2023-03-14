# Troubleshooting

## Error "bind: address already in use"
Users encountering:

> Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:5000 -> 0.0.0.0:0: listen tcp 0.0.0.0:5000: bind: address already in use

when running `./startup.sh init` need to update ports to available values in the `/docker/docker-compose.yml` file, under the `ports` verb.


## Error "Preset ts-jest is invalid:" when running `npm test`
Users encountering the error below when running `npm test`: 

> Preset ts-jest is invalid:
> The "id" argument must be of type string. Received null
> TypeError [ERR_INVALID_ARG_TYPE]: The "id" argument must be of type string. Received null

need to run `npm i --save-dev ts-jest` before running `npm test`. 

## **Error "unsucceeful npm install**
Users encoutering the error when running `npm install`:

> npm ERR! code EACCES
> npm ERR! syscall unlink
> npm ERR! path /Users/phil/interoperability/cht-config/node_modules/.package-lock.json

need to run `npm install` as root user


## TK
