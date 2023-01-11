# Mediator

## Build Steps
1. Run `docker network ls` and take note or your openhim docker instance network name.

1. 
```sh
# Build the docker image.
docker build -t mediator .

# Run the docker image
docker run --network <openhim-network-name> --name mediator -rm -p 5005:5005 mediator
```