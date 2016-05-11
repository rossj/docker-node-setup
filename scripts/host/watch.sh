#!/bin/bash
EXCLUDE='--exclude \.git/ --exclude \.idea/ --exclude \.lein-failures'
OS=`uname`

if [ "$OS" = "Linux" ]
then
  exec inotifywait $EXCLUDE -r -m -q -e modify --format '%w%f' "$PWD"
else
  exec fswatch $EXCLUDE -r "$PWD"
fi
