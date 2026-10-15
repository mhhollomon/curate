import json

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from fastapi_login.exceptions import InvalidCredentialsException
from pwdlib import PasswordHash
from ..lib.database import db, dbUser
from playhouse.shortcuts import model_to_dict

from ..lib.login import login_manager

password_hash = PasswordHash.recommended()

DUMMY_PASS = "SOMETHING funky Here"
DUMMY_HASH = password_hash.hash(DUMMY_PASS)

@login_manager.user_loader()
def query_user(user_id: str) -> dict | None:
    """
    Get a user from the db
    :param user_id: user id
    :return: None or the user object
    """
    with db:
        user = dbUser.select().where(dbUser.id == user_id).get_or_none()
        if user :
            user = model_to_dict(user)

    return user


auth_router = APIRouter()

@auth_router.post("/login")
def login(response: Response, data: OAuth2PasswordRequestForm = Depends()):
    user_id = data.username
    password = data.password

    user = query_user(user_id)
    if not user:
        # useless compare to thwart timing attacks
        password_hash.verify(DUMMY_PASS, DUMMY_HASH)
        raise InvalidCredentialsException

    elif not password_hash.verify(password, user['hash']) :
        raise InvalidCredentialsException

    access_token = login_manager.create_access_token(data={"sub": user_id})
    login_manager.set_cookie(response, access_token)
    response.status_code = 200
    response.body = json.dumps({"message" : "Login successful"}).encode()
    response.media_type = 'application/json'
    return response
