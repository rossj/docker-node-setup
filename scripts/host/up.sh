#!/bin/bash -e
# Run from root dir

YMLS="$1"
shift

BUILD=true
WATCH=true

# Clean linked containers on exit
trap "trap - SIGTERM && echo Cleaning linked containers... \
  && docker-compose $YMLS stop \
  && docker-compose $YMLS rm -f \
  && kill -- -$$" SIGINT SIGTERM EXIT

up () {
  if [ "$WATCH" = true ]; then
    echo 'Setting up file monitors...'
    ./scripts/host/monitor-services.sh $YMLS &
  fi

  docker-compose $YMLS up
}

if [ ! -d "scripts" ]
then
  echo 'Please execute in root repo directory'
else
  for arg in "$@"
  do
    case "$arg" in
    --no-build) BUILD=false
                ;;
    --no-watch) WATCH=false
                ;;
    esac
  done

  # Build helper image
  if [ "$BUILD" = true ] || [ "$WATCH" = true ] ; then
    echo 'Building docker-compose-helper image'
    docker build -t docker-compose-helper docker-compose-helper/
  fi

  if [ "$BUILD" = true ]; then
    ./scripts/host/build-service-images.sh $YMLS :all:
  fi

  up
fi
