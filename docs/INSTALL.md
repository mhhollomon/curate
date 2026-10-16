# Install on ubuntu server.

**NOTE** This is only for Home LAN use. More info on getting
things secured for the Wicked World Web to follow.

THere are other ways I'm sure.

This will use `nginx` to serve the client and as the `https`
 termination for the server.

`nginx` will listen on port 9956 and proxy things like `/api/...` to the server.

## Install needed system software

```bash
sudo apt install nginx supervisor ffmpeg uvicorn

# If these aren't already installed
sudo apt install nodejs npm
```

For comfort, add a group that can run `supervisorctl` without root. This will
make it easier to start/stop/monitor things.

```bash
addgroup supv
```

Edit the file `/etc/supervisor/supervisord.conf` and add the following line
```
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0770      ; <---- CHANGE THIS LINE 0700 -> 0770
chown=root:supv ; <---- ADD THIS LINE
```

Add your userid to the group
```bash
usermod -aG supv $userid
```

Restart the system (or learn the horror that is `systemctl`).

## Clone Curate

As a general rule, I have one account own the files and a separate account
that actually runs the process. This give a little more assurance that the running
process cannot modify the files. In particular, the runner account will not be
able to update the `.env` file and other configuration.

### Create accounts

```bash
sudo useradd -d /home/appowner -m -U -s /bin/bash appowner
sudo useradd -d /home/apprunner -m -U -s /bin/bash apprunner

sudo usermod -aG appowner apprunner
```

### Install uv
Ubuntu does not have a `uv` apt package. So we will need to install this as
the `appowner` account.

```bash
sudo su - appowner
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Clone curate
```bash
sudo su - appowner
git clone https://github.com/mhhollomon/curate.git
```

## Build the client
```bash
sudo su - appowner
cd curate/client
npm install
npm run build
```

The files will be placed in the `dist` directory.

## Prep the server

### Install python modules in virtual environment
```bash
sudo su - appowner
cd curate/server
uv sync
```

### Create .env file
Copy the .env.template file to .env and edit to taste.

For `SECRET`, use something like the following to generate the string.
```bash
python -c "import secrets; print(secrets.token_hex(24))"
```

This will generate a random string using sources of true randomness on you server.

### Lock things down

```bash
chmod -R o-rwx,g-w curate
```

### Generate the database

Create the database file and populate it based on what it finds in the
configured `MUSIC_DIRECTORY`. Depending on how big your music collection is,
this can take a while.

_Note_ : This must be done as the `apprunner` account since the db file needs to writable
by that account.

```bash
sudo su - apprunner
cd ~appowner/curate/server
. .venv/bin/activate
python -m src.gen_data --out ~/curate/curate.db
```

### Create User

Since there is no user admin functionality in the frontend UI, this must be done
from here. Add a user and password:

```bash
sudo su - apprunner
cd ~appowner/curate/server
. .venv/bin/activate
python -m src.user_admin add $username $password
```

## Configure Nginx

### site configuration

```bash
NGINX_USER=`ps -ef | grep nginx | grep worker | head -1 | cut -w -f1`

# Add the user that nginx runs as to the appowner group
# so it can read the static files.
sudo chmod -a -G appowner $NGINX_USER

# Create the site configuration
sudo cat > /etc/nginx/sites-available/curate <<_EOF_
upstream curate_api_server {
    # Talk to the server port 8000
    server 127.0.0.1:8000;
}

server {
    # change as needed.
    listen 9956;

    server_name _;

    # Serve the client static files.
    location / {
        root /home/appowner/curate/client/dist;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # Handle the client side routing when reloading
    location ^~ /album {
        return 301 /#$request_uri;
    }

    location ^~ /artist {
        return 301 /#$request_uri;
    }

    # Hand API calls off to the backend.
    location ^~ /api/ {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        expires -1;
        add_header Cache-Control no-store;


        proxy_pass http://curate_api_server;
        proxy_redirect off;
        }
}
_EOF_

# Make it enabled
sudo ln -s /etc/nginx/sites-available/curate /etc/nginx/sites-enabled/curate
```

Restart `nginx` to make sure things are okay.

```bash
sudo systemctl restart nginx.service
```

### Quick test to see if things are okay
Start the server (we'll make this automatic in a bit)

```bash
~appowner/curate/server/scripts/start-server.bash
```
Now you should be able to get replies from the following :
```bash
# Server responds through nginx
curl http://localhost:9956/api/hello

# nginx is serving the client static files
curl http://localhost:9956/
```
## Configure supervisor
```bash
sudo cat > /etc/supervisor/conf.d/curate-server.conf <<_EOF_
[program:curate-server]
user=apprunner
command=/home/appowner/curate/server/scripts/start-server.bash
directory=/home/apprunner/curate
_EOF_

# Force supervisor to read the new config
sudo supervisorctl reload

# Start the server
sudo supervisorctl start curate-server
```

And you should be good to go!

