#!/bin/bash
exec docker run -i --rm \
  -v "$PWD:/mount" \
  docker-compose-helper \
  watch-helper.js "$PWD" "$@"
