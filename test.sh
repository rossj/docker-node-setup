#!/bin/bash -e

YMLS='-f docker-compose.yml -f docker-compose.test.yml'
exec ./scripts/host/test.sh "$YMLS" "$@"
