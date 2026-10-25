#!/usr/bin/env bash
set -e

code_home=${0%/*}
app_dir=${code_home}/..

. ${app_dir}/.venv/bin/activate

gunicorn src.main:app -w 1 -k uvicorn.workers.UvicornWorker --chdir ${app_dir}