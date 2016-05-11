#!/bin/bash -e

get_images () {
  docker run --rm -v "$PWD:/mount" docker-compose-helper \
    get-images "$@"
}

build () {
  local OUTPUT=$(get_images "$@")
  echo "All image dependencies: ${OUTPUT}"

  IFS=' ' read -ra IMAGES <<< "$OUTPUT"
  for image in "${IMAGES[@]}"
  do
    ./scripts/host/docker-build-r.sh "$image"
  done
}

build "$@"
