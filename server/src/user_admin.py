import sys
from pwdlib import PasswordHash

from .lib.config import get_required_config
from .lib.database import db, dbUser

DB_FILE = get_required_config('DB_FILE')

password_hash = PasswordHash.recommended()

def open_db() -> None :
    db.init(DB_FILE, pragmas={'foreign_keys': 1})

def add_user(username : str, password : str) -> int :
    user = dbUser.select().where(dbUser.id == username).get_or_none()

    if user :
        print(f"User '{username}' already exists", file=sys.stderr)
        return 1

    hash = password_hash.hash(password)

    dbUser.insert({'id' : username, 'hash' : hash}).execute()

    return 0

def change_password(username : str, password : str) -> int :
    user = dbUser.select().where(dbUser.id == username).get_or_none()

    if not user :
        print(f"User '{username}' does not exist", file=sys.stderr)
        return 1

    hash = password_hash.hash(password)

    user.update({'hash' : hash}).execute()

    return 0


##########################################################
def main() :
    if len(sys.argv) < 4 :
        print("Not enough parameters", file=sys.stderr)
        exit(1)

    (_, operation, username, password) = sys.argv

    open_db()

    if operation.lower() == 'add' :
        retval = add_user(username, password)
    elif operation.lower() == 'change' :
        retval = change_password(username, password)


    return retval

##########################################################
if __name__ == '__main__' :

    retval = main()

    exit(retval)
