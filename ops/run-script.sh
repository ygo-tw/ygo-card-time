#!/bin/bash
set -e
MONGODB_URI="$1"
script_path="$2"

if [ -z ${script_path} ]; then
	echo "Please provide script path"
	exit 1
fi

if [ -z ${MONGODB_URI} ]; then
    echo "Please provide MONGODB_URI"
    exit 1
fi

echo "Run script "
    mongosh "${MONGODB_URI}" --quiet --norc < ${script_path}