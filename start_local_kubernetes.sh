#!/bin/bash

# Delete the previous cluster
kind delete cluster --name health-interop

# Create a fresh cluster
kind create cluster --name health-interop

# Reload your custom images
kind load docker-image configurator:local --name health-interop
kind load docker-image mediator:local --name health-interop

# Deploy everything again (in order)
kubectl apply -f kubernetes/01-namespace.yaml
kubectl apply -f kubernetes/02-configmap.yaml
kubectl apply -f kubernetes/03-secrets.yaml
kubectl apply -f kubernetes/04-persistent-volumes.yaml
kubectl apply -f kubernetes/05-databases.yaml

# Wait for databases to be ready, then continue
kubectl get pods -n health-interop -w

# Once databases are running, deploy the rest
kubectl apply -f kubernetes/06-openhim-core.yaml
kubectl apply -f kubernetes/07-openhim-console.yaml
kubectl apply -f kubernetes/08-hapi-fhir.yaml
kubectl apply -f kubernetes/09-cht-services.yaml
kubectl apply -f kubernetes/10-mediator-services.yaml

# OpenHIM Core - Management API (HTTPS)
kubectl port-forward svc/openhim-core 8080:8080 -n health-interop &

# OpenHIM Core - HTTP Router (routes to mediators)
kubectl port-forward svc/openhim-core 5001:5001 -n health-interop &

# OpenHIM Console - Management interface
kubectl port-forward svc/openhim-console 9000:80 -n health-interop &

# CHT - Community Health Toolkit (via Nginx)
kubectl port-forward svc/nginx 8081:80 -n health-interop &
kubectl port-forward svc/nginx 8444:443 -n health-interop &
