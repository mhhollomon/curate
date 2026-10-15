import os
from pathlib import Path

from .lib.database import (db)
from fastapi import FastAPI

from .lib.config import get_required_config, get_config

from .routes.auth import auth_router
from .routes.music import music_router

######################################################
# SETUP CODE
######################################################

CACHE_PATH = Path(get_config('CACHE_PATH', "./cache/"))
DB_FILE = get_required_config("DB_FILE")

os.makedirs(CACHE_PATH, exist_ok=True)
os.makedirs(CACHE_PATH / 'full', exist_ok=True)
os.makedirs(CACHE_PATH / 'thumb', exist_ok=True)

db.init(DB_FILE, pragmas={'foreign_keys': 1})

app = FastAPI()
app.include_router(auth_router, prefix="/api")
app.include_router(music_router, prefix="/api")

######################################################
# END SETUP CODE
######################################################

# Uprotected route to act has health check
@app.get("/api/hello")
async def root():
    return {"message": "Hello World"}
