#!/bin/bash

if [ "$1" == "init" ]; then
  # start up docker containers
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml up -d --build
elif [ "$1" == "up" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml up -d
elif [ "$1" == "up-dev" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml up -d --build
elif [ "$1" == "down" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml  -f ./docker/docker-compose.cht-core.yml -f ./docker/docker-compose.openmrs.yml stop
elif [ "$1" == "destroy" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml  -f ./docker/docker-compose.cht-core.yml -f ./docker/docker-compose.openmrs.yml down -v
elif [ "$1" == "up-test" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml  -f ./docker/docker-compose.cht-core.yml -d --build
elif [ "$1" == "up-openmrs" ]; then
  docker compose -p chis-interop -f ./docker/docker-compose.yml -f ./docker/docker-compose.mediator.yml  -f ./docker/docker-compose.cht-core.yml -f ./docker/docker-compose.openmrs.yml up -d --build
else 
  echo "Invalid option $1
  
  Help:

  init        starts the docker containers and configures OpenHIM
  up          starts the docker containers
  up-dev      starts the docker containers with updated files.
  up-test     starts the docker containers with updated files, including CHT Core
  up-openmrs  starts the docker containers with updated files, including CHT Core and OpenMRS
  down        stops the docker containers
  destroy     shutdown the docker containers and deletes volumes
  "
fi

echo "

   Possible URLs after startup:
   -----------
   OpenMRS         http://localhost:8090/
   OpenMRS MySQL   localhost:3306
   CHT Core        https://localhost:8843/
   OpenHIM Console http://localhost:9000/

"
