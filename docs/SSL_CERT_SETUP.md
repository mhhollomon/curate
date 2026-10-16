# Some thoughts on getting a certificate set up

## Add a DNS record

This depends on you registrar. Set up an 'A' record pointing to your server.

## Port Forwarding

If you are behind a NAT firewall, you will need to drill a hole for the port
you put into the nginx configuration.

## Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

but see https://www.digitalocean.com/community/tutorials/how-to-acquire-a-let-s-encrypt-certificate-using-dns-validation-with-acme-dns-certbot-on-ubuntu-18-04

```bash
sudo certbot certonly --manual --manual-auth-hook /etc/letsencrypt/acme-dns-auth.py --preferred-challenges dns --debug-challenges -d your-domain
```

update the server block in nginx to specify the cert and key.