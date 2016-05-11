#!/bin/bash

printf 'Start of monitor-services.sh script on host...\n'
trap 'echo monitor-services.sh exiting!' EXIT

BASENAME=`basename "${PWD}"`
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$BASENAME}"

watch_and_print () {
  ./scripts/host/watch.sh | while read FILE
  do
    printf '\rFile changed: %s\n' "$FILE"
  done
}

watch_and_print &

./scripts/host/watch.sh | ./scripts/host/file-to-service.sh "$@" | while read SERVICE
do
  printf '\rNotifying %s of change\n' "$SERVICE"
  # We don't know the actual container name... so guess a couple
  printf '\r'
  docker exec -t "${COMPOSE_PROJECT_NAME}_${SERVICE}_1" bash -c 'kill -SIGUSR2 1' 2>&1
  printf '\r'
  docker exec -t "${COMPOSE_PROJECT_NAME}_${SERVICE}_run_1" bash -c 'kill -SIGUSR2 1' 2>&1
done
