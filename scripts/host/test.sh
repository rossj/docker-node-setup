#!/bin/bash -e
# Run from root dir

YMLS="$1"
shift

BUILD=true
WATCH=true

export COMPOSE_PROJECT_NAME=test

# Clean linked containers on exit
trap "trap - SIGTERM && printf '\nCleaning linked containers...' \
  && docker-compose $YMLS stop \
  && docker-compose $YMLS rm -f \
  && kill -- -$$" SIGINT SIGTERM EXIT

handle_option () {
  case "$1" in
  --no-build) BUILD=false
              ;;
  --no-watch) WATCH=false
              ;;
  esac
}

test_project () {
  local PROJECT="${1%/}"
  shift
  local SERVICE="${PROJECT}.test"

  if [ "$BUILD" = true ]; then
    ./scripts/host/build-service-images.sh $YMLS "$SERVICE"
  fi

  if [ "$WATCH" = true ]; then
    echo 'Setting up file monitors...'
    ./scripts/host/monitor-services.sh $YMLS &

    export DC_ENTRYPOINT_PRE='/code/scripts/client/restarter.sh'
  else
    export DC_ENTRYPOINT_PRE=''
  fi

  docker-compose $YMLS run --rm "$SERVICE" "$@"
}

if [ ! -d "scripts" ]
then
  echo 'Please execute in root directory'
else
  # Build helper image
  docker build -t docker-compose-helper docker-compose-helper/

  # Handle any args before the project name
  while true
  do
    if [[ $1 == -* ]]
    then
      handle_option "$1"
      shift
    else
      break
    fi
  done

  # If there are any args, assume we are testing just 1 project
  if [ -n "$1" ]
  then
    test_project "$@"
  else
    # Don't watch when testing everything
    WATCH=false
    for dir in *
    do
      if [ -d "$dir" ]
      then
        if grep -q "^${dir}\.test:" docker-compose.test.yml
        then
          echo "Testing ${dir}"
          test_project "$dir"
        else
          echo "Skipping ${dir}"
        fi
      fi
    done
  fi
fi
