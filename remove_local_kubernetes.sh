#!/bin/bash

set -e # Exit on any error

echo "CHT Interoperability Stack Cleanup (k3d)"
echo ""

# Check if cluster exists
CLUSTER_EXISTS=$(k3d cluster list | grep -w "cht-interop" || echo "")

if [[ -z "$CLUSTER_EXISTS" ]]; then
  echo "No k3d cluster 'cht-interop' found. Nothing to clean up."
  exit 0
fi

echo "This will delete:"
echo "  - k3d cluster 'cht-interop'"
echo "  - All pods, services, and data in the cluster"
echo ""
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cleanup cancelled."
  exit 0
fi

echo ""
echo "Deleting k3d cluster 'cht-interop'..."
k3d cluster delete cht-interop

if [[ $? -eq 0 ]]; then
  echo ""
  echo "Cleanup complete!"
  echo ""
  echo "The following have been removed:"
  echo "  - k3d cluster 'cht-interop'"
  echo "  - All associated containers and volumes"
  echo ""
  echo "To redeploy, run: ./start_local_kubernetes.sh"
else
  echo ""
  echo "Failed to delete cluster"
  exit 1
fi
