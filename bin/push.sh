#!/bin/bash

set -eo pipefail

push() {
    echo "Push the image ${1}"
    docker push ${1}
    echo "Push the image ${2}"
    docker push ${2}
}

echo Tag         : "${IMAGE}:latest"
echo Tag         : "${IMAGE}:${CE_TAG}"

echo "Push the image ${CE_TAG}"
push "${IMAGE}:${CE_TAG}" "${IMAGE}:latest"
