# Troubleshooting

## Error "bind: address already in use"
Users encountering:

> Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:5000 -> 0.0.0.0:0: listen tcp 0.0.0.0:5000: bind: address already in use

when running `./startup.sh init` need to update ports to available values in the `/docker/docker-compose.yml` file, under the `ports` verb.