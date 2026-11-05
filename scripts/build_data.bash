#!/usr/bin/env bash

# Generate the data from the configured directory.
# By default, it reads the .env file and takes the input directory
# and the name of the database file from there.
# However, you can pass any of the recognized parameters to override.
#

set -e

script_home=${0%/*}
app_dir=$(dirname "${script_home}")

cd "${app_dir}/server"
. .venv/bin/activate
python -m src.gen_data "$@"
