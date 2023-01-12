#!/bin/bash

if [ "$1" == "init" ]; then
  # start up docker containers
  docker compose -p chis-interop -f ./docker/docker-compose.yml up -d

  # configuring OpenHIM instance
  cd configurator && npm i && npm start && cd ..

  docker compose -p chis-interop -f ./mediator/docker-compose.yml up -d
elif [ "$1" == "up" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml up -d
elif [ "$1" == "down" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml stop
elif [ "$1" == "destroy" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml down -v
else 
  echo "Invalid option $1
  
  Help:

  init      starts docker containers and configures OpenHIM
  up        starts docker containers
  down      stops docker containers
  destroy   stops docker containers and deletes volumes
  "
fi