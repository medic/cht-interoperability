#!/bin/bash
set -e
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && cd .. && pwd )"
MEDIATOR_DIR="${BASEDIR}/mediator"
MEDIATOR_ENV_FILE="${MEDIATOR_DIR}/.env"
CONFIGURATOR_ENV_FILE="${BASEDIR}/configurator/.env"

export NODE_ENV=integration
export NODE_TLS_REJECT_UNAUTHORIZED=0

retry_startup() {
  max_attempts=5
  count=0
  until ./startup.sh init || [ $count -eq $max_attempts ]; do
    echo "Attempt $((count+1)) of $max_attempts to start containers failed, retrying in 30 seconds..."
    count=$((count+1))
    sleep 30
  done

  if [ $count -eq $max_attempts ]; then
    echo "Failed to start containers after $max_attempts attempts."
    exit 1
  fi
}

file_check_and_create() {
    local filename="$1"
    if [ ! -f "$filename" ]; then
        touch "$filename"
        echo true
    else
        echo false
    fi
}

echo 'Cleanup from last test, in case of interruptions...'
cd $BASEDIR
# ensure .env file exists, this won't overwrite an existing file
# .env is required when destroying the containers
MEDIATOR_ENV_FILE_CREATED=$(file_check_and_create "$MEDIATOR_ENV_FILE")
CONFIGURATOR_ENV_FILE_CREATED=$(file_check_and_create "$CONFIGURATOR_ENV_FILE")
./startup.sh destroy

echo 'Starting the interoperability containers...'
cd $BASEDIR
# Only write to .env file if it doesn't exist
if [ "$MEDIATOR_ENV_FILE_CREATED" = true ]; then
    # Write environment variables to .env file for mediator container
    cat > "$MEDIATOR_ENV_FILE" << EOF
NODE_ENV=${NODE_ENV}
NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}
OPENHIM_USERNAME=interop@openhim.org
OPENHIM_PASSWORD=interop-password
OPENHIM_API_URL=https://openhim-core:8080
PORT=6000
FHIR_URL=http://openhim-core:5001/fhir
FHIR_USERNAME=interop-client
FHIR_PASSWORD=interop-password
CHT_URL=https://nginx
CHT_USERNAME=admin
CHT_PASSWORD=password
EOF
    echo "Created mediator/.env file with test environment variables"
else
    echo "Using existing mediator/.env file"
fi

if [ "$CONFIGURATOR_ENV_FILE_CREATED" = true ]; then
    # Write environment variables to .env file for configurator container
    cat > "$CONFIGURATOR_ENV_FILE" << EOF
COUCHDB_USER=admin
COUCHDB_PASSWORD=password
OPENHIM_API_URL=https://openhim-core:8080
OPENHIM_PASSWORD=openhim-password
OPENHIM_USERNAME=root@openhim.org
OPENHIM_CLIENT_PASSWORD=interop-password
OPENHIM_USER_PASSWORD=interop-password
EOF
    echo "Created configurator/.env file with test environment variables"
else
    echo "Using existing configurator/.env file"
fi
retry_startup

echo 'Waiting for configurator to finish...'
docker container wait chis-interop-configurator-1

echo 'Executing mediator e2e tests...'
cd $MEDIATOR_DIR
export OPENHIM_API_URL='https://localhost:8080'
export FHIR_URL='http://localhost:5001'
export CHT_URL='http://localhost:5988'
export OPENHIM_USERNAME='interop@openhim.org'
export OPENHIM_PASSWORD='interop-password'
export FHIR_USERNAME='interop-client'
export FHIR_PASSWORD='interop-password'
export CHT_USERNAME='admin'
export CHT_PASSWORD='password'
export PORT=6000
export OPENHIM_CLIENT_PASSWORD='interop-password'
export OPENHIM_USER_PASSWORD='interop-password'
jest --config ./jest.e2e.config.js

echo 'Cleanup after test...'
unset NODE_ENV
unset NODE_TLS_REJECT_UNAUTHORIZED
unset OPENHIM_API_URL
unset FHIR_URL
unset CHT_URL
unset OPENHIM_USERNAME
unset OPENHIM_PASSWORD
unset FHIR_USERNAME
unset FHIR_PASSWORD
unset CHT_USERNAME
unset CHT_PASSWORD
unset PORT
unset OPENHIM_CLIENT_PASSWORD
unset OPENHIM_USER_PASSWORD
cd $BASEDIR
./startup.sh destroy

if [ "$MEDIATOR_ENV_FILE_CREATED" = true ]; then
    echo "Deleting the mediator env file we created: $MEDIATOR_ENV_FILE"
    rm "$MEDIATOR_ENV_FILE"
fi

if [ "$CONFIGURATOR_ENV_FILE_CREATED" = true ]; then
    echo "Deleting the configurator env file we created: $CONFIGURATOR_ENV_FILE"
    rm "$CONFIGURATOR_ENV_FILE"
fi

echo 'Finish'
