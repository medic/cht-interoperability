#!/bin/bash

set -e # Exit on any error

echo "🚀 CHT Interoperability Stack Deployment"
echo ""

# Check if cluster exists
CLUSTER_EXISTS=$(kind get clusters | grep -w "cht-interop" || echo "")

if [ -n "$CLUSTER_EXISTS" ]; then
  echo "⚠️  KIND cluster 'cht-interop' already exists."
  read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting existing KIND cluster..."
    kind delete cluster --name cht-interop
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
if [ "$CREATE_CLUSTER" = true ]; then
  echo "Creating fresh KIND cluster..."
  kind create cluster --name cht-interop
  if [ $? -ne 0 ]; then
    echo "❌ Failed to create KIND cluster"
    exit 1
  fi
fi

# Build and load custom images
echo ""
echo "Building and loading custom images..."

# Build configurator
if [ -d "./configurator" ]; then
  echo "Building configurator image..."
  docker build -f configurator/Dockerfile -t configurator:local .
  if [ $? -ne 0 ]; then
    echo "❌ Failed to build configurator image"
    exit 1
  fi
  kind load docker-image configurator:local --name cht-interop
else
  echo "⚠️  Configurator directory not found, skipping build"
fi

# Build mediator
if [ -d "./mediator" ]; then
  echo "Building mediator image..."
  docker build -t mediator:local ./mediator
  if [ $? -ne 0 ]; then
    echo "❌ Failed to build mediator image"
    exit 1
  fi
  kind load docker-image mediator:local --name cht-interop
else
  echo "⚠️  Mediator directory not found, skipping build"
fi

# Check if Helm release exists
RELEASE_EXISTS=$(helm list -n cht-interop | grep -w "cht-interop" || echo "")

if [ -n "$RELEASE_EXISTS" ]; then
  echo ""
  echo "Helm release 'cht-interop' already exists."
  read -p "Do you want to upgrade it? (Y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Upgrading Helm release..."
    helm upgrade cht-interop ./charts
    if [ $? -ne 0 ]; then
      echo "❌ Failed to upgrade Helm release"
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
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install Helm release"
    exit 1
  fi
fi

# Wait for pods to be ready
echo ""
echo "Waiting for pods to be ready..."
echo "You can monitor progress with: kubectl get pods -n cht-interop -w"
echo "Or use K9s: k9s --context kind-cht-interop"

# Wait for critical services with timeout
echo ""
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n cht-interop --timeout=300s || echo "⚠️  MongoDB not ready yet"
kubectl wait --for=condition=ready pod -l app=couchdb -n cht-interop --timeout=300s || echo "⚠️  CouchDB not ready yet"
kubectl wait --for=condition=ready pod -l app=hapi-db -n cht-interop --timeout=300s || echo "⚠️  PostgreSQL not ready yet"

echo "Waiting for OpenHIM Core to be ready..."
kubectl wait --for=condition=ready pod -l app=openhim-core -n cht-interop --timeout=300s || echo "⚠️  OpenHIM Core not ready yet"

echo ""
echo "✅ Deployment complete!"

# Setup port forwarding
echo ""
echo "Setting up port forwarding..."

# Kill any existing port forwards
pkill -f "kubectl port-forward.*cht-interop" 2>/dev/null || true

kubectl port-forward svc/openhim-core 8080:8080 -n cht-interop >/dev/null 2>&1 &
kubectl port-forward svc/openhim-core 5001:5001 -n cht-interop >/dev/null 2>&1 &
kubectl port-forward svc/openhim-console 9000:80 -n cht-interop >/dev/null 2>&1 &
kubectl port-forward svc/api 5988:5988 -n cht-interop >/dev/null 2>&1 &
kubectl port-forward svc/mediator 6000:6000 -n cht-interop >/dev/null 2>&1 &

sleep 2 # Give port forwards time to establish

echo ""
echo "🎉 CHT Interoperability Stack is ready!"
echo ""
echo "📍 Access services at:"
echo "   OpenHIM Console: http://localhost:9000"
echo "   OpenHIM Core API: https://localhost:8080"
echo "   OpenHIM Router: http://localhost:5001"
echo "   CHT API: http://localhost:5988"
echo "   Mediator: http://localhost:6000"
echo ""
echo "🔑 Default credentials:"
echo "   OpenHIM: root@openhim.org / openhim-password"
echo ""
echo "🛠️  Useful commands:"
echo "   View pods: kubectl get pods -n cht-interop"
echo "   View logs: kubectl logs <pod-name> -n cht-interop"
echo "   Use K9s: k9s --context kind-cht-interop"
echo "   Stop port forwards: pkill -f 'kubectl port-forward'"
echo "   Helm status: helm status cht-interop -n cht-interop"
echo ""
