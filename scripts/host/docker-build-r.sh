#!/bin/bash -e
# Run from root dir

get_deps () {
  docker run --rm -v "$PWD:/mount" docker-compose-helper \
    get-deps "$1"
}

copy_build_deps () {
  local P1="${1}"
  local P2="${2}"
  local DEST="${P2}/node_jsons/${P1}"

  mkdir "$DEST"

  if [ -f "${P1}/package.json" ]
  then
    cp "${P1}/package.json" "$DEST"
  fi

  if [ -f "${P1}/preinstall.sh" ]
  then
    cp "${P1}/preinstall.sh" "$DEST"
  fi
}

docker_build_r () {
  local NAME="$1"
  shift
  local FILE="$1"

  # Split the image at period
  IFS='.' read -ra IMG <<< "$NAME"
  local PROJECT="${IMG[0]}"

  # If no image file was specified, try to resolve it
  # based on image output name
  if [ -z "$FILE" ]
  then
    echo "Resolving image $NAME"

    # Two possible variations for local images...
    if [ ${#IMG[@]} = 1 ]
    then
      FILE="${IMG[0]}/Dockerfile"
    else
      FILE="${IMG[0]}/Dockerfile.${IMG[1]}"
    fi
  else
    # Shift off FILE arg
    shift
  fi

  if [ -f "$FILE" ]
  then
    echo "$NAME is made from $FILE"

    # Build any FROM dependencies depth-first
    LINES=`grep FROM "$FILE"`
    IFS=' ' read -ra PARTS <<< "$LINES"
    FROM="${PARTS[1]}"
    echo "$NAME depends on $FROM"
    docker_build_r "$FROM"

    # Check if image needs files
    if grep -q COPY "$FILE"
    then
      # For node projects, we want to copy all local deps to the
      # folder itself, along with any package.jsons and preinstall.sh
      rm -rf "${PROJECT}/node_modules" "${PROJECT}/node_jsons"
      mkdir "${PROJECT}/node_modules" "${PROJECT}/node_jsons"

      # Copy this projects own package.json
      copy_build_deps "$PROJECT" "$PROJECT"

      # Get a list of all dependent projects
      local OUTPUT=$(get_deps "$PROJECT")

      IFS=' ' read -ra DEPS <<< "$OUTPUT"

      # Iterate through each dependency, copying locally
      for dep in "${DEPS[@]}"
      do
        cp -R "$dep" "${PROJECT}/node_modules"
        copy_build_deps "$dep" "$PROJECT"
      done

      echo "Building $NAME with context $OUTPUT"
      docker build -t "$NAME" -f "$FILE" "$@" "$PROJECT"

      rm -rf "${PROJECT}/node_modules" "${PROJECT}/node_jsons"
    else
      echo "Building $NAME with no context"
      docker build -t "$NAME" "$@" - < "$FILE"
    fi
  else
    echo "$NAME might be from Docker hub"
  fi
}

docker_build_r "$@"
