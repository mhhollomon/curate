from typing import Callable

from dotenv import dotenv_values

CONFIG = dotenv_values()

def get_config(key : str, default : str ) -> str :
    val = CONFIG.get(key)
    if not val :
        val = default
    return val

def get_required_config (key : str, *, validate : Callable[[str], bool] | None = None) -> str :
    val = CONFIG.get(key)
    if not val :
        raise Exception(f"required configuration key `{key}` is not set")

    if validate and not validate(val) :
            raise Exception(f"configuration key `{key}` is not valid")

    return val