#!/bin/bash

set -eo pipefail

build() {
    docker build --no-cache --force-rm -t "${1}" -t "${2}" --build-arg RELEASE_NUMBER="${3}" .
}


echo Release file: $RELEASE_FILE
echo Tag         : "${IMAGE}:latest"
echo Tag         : "${IMAGE}:${CE_TAG}"

echo "Build image"
build "${IMAGE}:latest" "${IMAGE}:${CE_TAG}" "${CE_TAG}"
