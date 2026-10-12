# Install on ubuntu server.

THere are other ways I'm sure.

This will use `nginx` to serve the client and as the `https` termination for
the server.

`nginx` will listen on port 8080 and proxy things like `/api/...` to the server.

## Install needed system software

```bash
# Nginx and supervisor
sudo apt install nginx supervisor ffmpeg

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

usermod -aG appowner apprunner
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
chmod -r o-rwx,g-w curate
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
```bash
sudo su - appowner
cd curate/server
uv sync
```