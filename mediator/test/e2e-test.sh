#!/bin/bash
set -e
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && cd .. && pwd )"
MEDIATORDIR="${BASEDIR}/mediator"

export NODE_ENV=integration
export NODE_TLS_REJECT_UNAUTHORIZED=0

export OPENMRS_HOST=openmrs
export OPENMRS_USERNAME=admin
export OPENMRS_PASSWORD=Admin123

echo 'Cleanup from last test, in case of interruptions...'
cd $BASEDIR
./startup.sh destroy

echo 'Pulling Docker images with retry mechanism...'
services=("haproxy" "healthcheck" "api" "sentinel" "nginx" "couchdb")
max_retries=3
retry_delay=10  # seconds

# Retry pulling the images
for service in "${services[@]}"; do
  attempt=1
  success=false
  while [[ $attempt -le $max_retries ]]; do
    echo "Pulling service: $service (Attempt $attempt of $max_retries)"

    # Attempt to pull the image for the specific service
    if docker compose -f ./docker/docker-compose.cht-core.yml pull $service; then
      echo "$service pulled successfully!"
      success=true
      break
    else
      echo "Failed to pull $service. Retrying in $retry_delay seconds..."
      sleep $retry_delay
    fi
    attempt=$(( attempt + 1 ))
  done

  # Check if we exhausted all retries without success
  if [[ $success == false ]]; then
    echo "ERROR: Failed to pull $service after $max_retries attempts."
    exit 1  # Exit the script if pulling the image fails after retries
  fi
done

echo 'Starting the interoperability containers...'
./startup.sh up-test

echo 'Waiting for configurator to finish...'
docker container wait chis-interop-cht-configurator-1

cd $MEDIATORDIR
export OPENHIM_API_URL='https://localhost:8080'
export FHIR_URL='http://localhost:5001'
export CHT_URL='http://localhost:5988'
export OPENHIM_USERNAME='interop@openhim.org'
export OPENHIM_PASSWORD='interop-password'
export FHIR_USERNAME='interop-client'
export FHIR_PASSWORD='interop-password'
export CHT_USERNAME='admin'
export CHT_PASSWORD='password'
export OPENMRS_CHANNEL_URL='http://localhost:5001/openmrs'
export OPENMRS_CHANNEL_USERNAME='interop-client'
export OPENMRS_CHANNEL_PASSWORD='interop-password'

echo 'Waiting for OpenMRS to be ready'
sleep 280
echo 'Executing mediator e2e tests...'
npm run test -t workflows.spec.ts

echo 'Cleanup after test...'
unset NODE_ENV
unset NODE_TLS_REJECT_UNAUTHORIZED
unset OPENMRS_HOST
unset OPENMRS_USERNAME
unset OPENMRS_PASSWORD
unset OPENHIM_API_URL
unset FHIR_URL
unset CHT_URL
unset OPENHIM_USERNAME
unset OPENHIM_PASSWORD
unset FHIR_USERNAME
unset FHIR_PASSWORD
unset CHT_USERNAME
unset CHT_PASSWORD
unset OPENMRS_CHANNEL_URL
unset OPENMRS_CHANNEL_USERNAME
unset OPENMRS_CHANNEL_PASSWORD
cd $BASEDIR
./startup.sh destroy
