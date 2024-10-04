#!/bin/bash
set -e
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && cd .. && pwd )"
MEDIATORDIR="${BASEDIR}/mediator"

export NODE_ENV=integration
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Cleanup from last test, in case of interruptions
cd $BASEDIR
./startup.sh destroy

# Starting the interoperability containers
cd $BASEDIR
./startup.sh up-test

# Waiting for configurator to finish
echo 'Waiting for configurator to finish...'
docker container wait chis-interop-cht-configurator-1

# Executing mediator e2e tests
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
export OPENMRS_URL='http://openhim-core:5001/openmrs'
export OPENMRS_USERNAME='interop-client'
export OPENMRS_PASSWORD='interop-password'
npm run test -t workflows.spec.ts

# Cleanup
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
unset OPENMRS_URL
unset OPENMRS_USERNAME
unset OPENMRS_PASSWORD
cd $BASEDIR
./startup.sh destroy

