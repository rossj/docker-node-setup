#!/bin/bash

CPID=0
KILLED=false

trap "kill -SIGINT $CPID" SIGUSR2
trap "KILLED=true && trap - SIGTERM && kill -- -$$" SIGINT SIGTERM

echo "Restarter: Starting main process..."

while [ "$KILLED" = false ]
do
  "$@" &
  CPID=$!

  wait $CPID
  CODE=$?

  # Check if code indicates we got a SIGUSR2
  if [ "$KILLED" = true ]; then
    echo 'Restarter: exiting...'
    break
  elif [ $CODE -eq 140 ]; then
    echo "Restarter: Restarting main process..."
    wait $CPID
  else
    echo "Restarter: Main process exited with code $CODE"
    echo "Restarter: Waiting for code change..."

    # stall... don't exit
    sleep inf > /dev/null 2>&1 &
    CPID=$!

    wait
  fi
done
