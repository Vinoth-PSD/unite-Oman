#!/bin/bash
# Activate venv and start the server
unset __PYVENV_LAUNCHER__
unset VIRTUAL_ENV
source "$(dirname "$0")/venv/bin/activate"
uvicorn main:app --reload
