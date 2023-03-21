#!/bin/bash

apiUrl=http://$COUCHDB_USER:$COUCHDB_PASSWORD@api:5988
credentialUrl="$apiUrl/api/v1/credentials/openhim1"

cht --url=$apiUrl --force

curl -X PUT -H "Content-Type: text/plain" "$credentialUrl" -d 'interop-password'
