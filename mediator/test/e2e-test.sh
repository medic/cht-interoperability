#!/bin/bash
set -e
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && cd .. && pwd )"
MEDIATORDIR="${BASEDIR}/mediator"
DOCKERRDIR="${BASEDIR}/docker"


export NODE_ENV=integration
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Cleanup from last test, in case of interruptions
cd $BASEDIR
sh ./startup.sh destroy
cd $DOCKERRDIR
rm -rf srv

# Starting the interoperability containers
cd $BASEDIR
sh ./startup.sh init

# Waiting for configurator to finish
docker container wait chis-interop-configurator-1

# Executing mediator e2e tests
cd $MEDIATORDIR
npm test ltfu-flow.spec.ts

# Cleanup
unset NODE_ENV
unset NODE_TLS_REJECT_UNAUTHORIZED
cd $BASEDIR
sh ./startup.sh destroy
cd $DOCKERRDIR
rm -r srv

