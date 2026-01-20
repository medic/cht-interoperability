#!/bin/bash

set -e # Exit on any error

echo "CHT Interoperability Stack Deployment (k3d)"
echo ""

# Check if cluster exists
CLUSTER_EXISTS=$(k3d cluster list | grep -w "cht-interop" || echo "")

if [[ -n "$CLUSTER_EXISTS" ]]; then
  echo "k3d cluster 'cht-interop' already exists."
  read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting existing k3d cluster..."
    k3d cluster delete cht-interop
    CREATE_CLUSTER=true
  else
    echo "Keeping existing cluster..."
    CREATE_CLUSTER=false
  fi
else
  echo "No existing cluster found."
  CREATE_CLUSTER=true
fi

# Create cluster if needed
if [[ "$CREATE_CLUSTER" == true ]]; then
  echo "Creating fresh k3d cluster with port mappings..."
  k3d cluster create cht-interop --agents 1 \
    --port "8080:30081@loadbalancer" \
    --port "9000:30900@loadbalancer" \
    --port "6000:30600@loadbalancer" \
    --port "5001:30501@loadbalancer" \
    --port "80:30080@loadbalancer" \
    --port "443:30443@loadbalancer"
  if [[ $? -ne 0 ]]; then
    echo "Failed to create k3d cluster"
    exit 1
  fi
fi

# Build and load custom images
echo ""
echo "Building and loading custom images..."

# Build configurator
if [[ -d "./configurator" ]]; then
  echo "Building configurator image..."
  docker build -f configurator/Dockerfile -t configurator:local .
  if [[ $? -ne 0 ]]; then
    echo "Failed to build configurator image"
    exit 1
  fi
  k3d image import configurator:local -c cht-interop
else
  echo "Configurator directory not found, skipping build"
fi

# Build mediator
if [[ -d "./mediator" ]]; then
  echo "Building mediator image..."
  docker build -t mediator:local ./mediator
  if [[ $? -ne 0 ]]; then
    echo "Failed to build mediator image"
    exit 1
  fi
  k3d image import mediator:local -c cht-interop
else
  echo "Mediator directory not found, skipping build"
fi

# Check if Helm release exists
RELEASE_EXISTS=$(helm list -n cht-interop | grep -w "cht-interop" || echo "")

if [[ -n "$RELEASE_EXISTS" ]]; then
  echo ""
  echo "Helm release 'cht-interop' already exists."
  read -p "Do you want to upgrade it? (Y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Upgrading Helm release..."
    helm upgrade cht-interop ./charts
    if [[ $? -ne 0 ]]; then
      echo "Failed to upgrade Helm release"
      exit 1
    fi
  else
    echo "Skipping Helm deployment..."
  fi
else
  # Deploy using Helm
  echo ""
  echo "Deploying with Helm..."
  helm install cht-interop ./charts
  if [[ $? -ne 0 ]]; then
    echo "Failed to install Helm release"
    exit 1
  fi
fi

# Wait for pods to be ready
echo ""
echo "Waiting for pods to be ready..."
echo "You can monitor progress with: kubectl get pods -n cht-interop -w"
echo "Or use K9s: k9s --context k3d-cht-interop"

# Wait for critical services with timeout
echo ""
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n cht-interop --timeout=300s || echo "MongoDB not ready yet"
kubectl wait --for=condition=ready pod -l app=couchdb -n cht-interop --timeout=300s || echo "CouchDB not ready yet"
kubectl wait --for=condition=ready pod -l app=hapi-db -n cht-interop --timeout=300s || echo "PostgreSQL not ready yet"

echo "Waiting for OpenHIM Core to be ready..."
kubectl wait --for=condition=ready pod -l app=openhim-core -n cht-interop --timeout=300s || echo "OpenHIM Core not ready yet"

echo ""
echo "Deployment complete!"

echo ""
echo "CHT Interoperability Stack is ready!"
echo ""
echo "Access services at (via k3d port mappings - no port-forward needed):"
echo "   OpenHIM Console: http://localhost:9000"
echo "   OpenHIM Core API: https://localhost:8080"
echo "   OpenHIM Router: https://localhost:5001"
echo "   CHT: http://localhost:80 or https://localhost:443"
echo "   Mediator: http://localhost:6000"
echo ""
echo "Default credentials:"
echo "   OpenHIM: root@openhim.org / openhim-password"
echo "   CHT: medic / password"
echo ""
echo "Useful commands:"
echo "   View pods: kubectl get pods -n cht-interop"
echo "   View logs: kubectl logs <pod-name> -n cht-interop"
echo "   Use K9s: k9s --context k3d-cht-interop"
echo "   Helm status: helm status cht-interop"
echo ""
