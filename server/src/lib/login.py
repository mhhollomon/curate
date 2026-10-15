from datetime import timedelta

from fastapi_login import LoginManager

from .config import get_required_config


_SECRET = get_required_config("SECRET",
                             validate = lambda val : len(val) >= 32 )

login_manager = LoginManager(_SECRET, "/api/login", use_cookie=True,
                       use_header=False,
                       default_expiry=timedelta(days=30))
