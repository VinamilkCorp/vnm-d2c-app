#!/usr/bin/env bash

set -eo pipefail

version="1.0.0"
GIT_VERSION=`git log -n1 --format="%h"`
echo -n "${version}.${GIT_VERSION}"
