#!/bin/bash -e
export COMPOSE_PROJECT_NAME=dockernodedev
YMLS='-f docker-compose.yml -f docker-compose.dev.yml'
exec ./scripts/host/up.sh "$YMLS" "$@"
