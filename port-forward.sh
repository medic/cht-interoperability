#!/bin/bash

kubectl port-forward svc/openhim-core 8080:8080 -n health-interop > /dev/null 2>&1 &
kubectl port-forward svc/openhim-core 5001:5001 -n health-interop > /dev/null 2>&1 &
kubectl port-forward svc/openhim-console 9000:80 -n health-interop > /dev/null 2>&1 &
kubectl port-forward svc/api 5988:5988 -n health-interop > /dev/null 2>&1 &
kubectl port-forward svc/mediator 6000:6000 -n health-interop > /dev/null 2>&1 &

echo "Port forwarding setup complete!"
echo "OpenHIM Console: http://localhost:9000"
echo "OpenHIM Core API: https://localhost:8080"
echo "OpenHIM Router: http://localhost:5001"
echo "CHT API: http://localhost:5988"
echo "Mediator: http://localhost:6000"
echo ""
echo "To stop all port forwards, run: pkill -f 'kubectl port-forward'"
