#!/usr/bin/env bash

# Update the git repository and rebuild
# the client assets.
# will still need to call supervisorctl to
# pick up the changes.
#
# Assumes `uv` and `npm` are on the path.

set -e
set -x

script_home=${0%/*}
app_dir=$(dirname "${script_home}")

cd "${app_dir}"

git pull

(
    cd server
    uv sync
)

(
    cd client
    npm install
    npm run build
)

find .  -name '__pycache__'  -prune  -o -print0 | xargs -0 chmod o-rwx,g-w
