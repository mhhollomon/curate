#!/usr/bin/env bash
set -e

code_home=${0%/*}
app_dir=${code_home}/..

. ${app_dir}/.venv/bin/activate

uvicorn --app-dir ${app_dir} src.main:app