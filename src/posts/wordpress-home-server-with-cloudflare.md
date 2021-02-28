<!--//

title: Setting up a home server for Wordpress + Cloudflare
date: 2021-02-27
image: wordpress-cloudflare-pi-server-hero.png
live: true

//-->

# Setting up Wordpress + Cloudflare on a home server

![Setting up Wordpress + Cloudflare on a home server](assets/images/wordpress-cloudflare-pi-server-hero.png)

<!-- snippet -->I always like to see if I can stand up free hosting using various services and/or hardware I have laying around. My wife has taken a recent interest in baking bread and has been diligently documenting her progress. I suggested she blog about it and here we are. Wordpress was an obvious choice and I have few (dozen) Raspberry Pis laying around. Seemed like a fun project.

**Please note:** I am no security expert but I will outline the various ways I secured this setup. It's always risky to open up your home network to the big scary world so please implement with caution.

## Overview

![Diagram of home network and Cloudflare interaction](assets/images/home-server-wp-cloudflare.svg)

I wanted to try out using docker-compose to run the wordpress/database containers, use Nginx to proxy pass the application and Cloudflare to provide secure connections. If you are unfamilar with Cloudflare they will slap an SSL cert and DDoS protection on top of your site for free. For security I chose to run end-to-end encryption from Cloudflare to my origin server since I want to be able to access the Wordpress admin via basic authentication. The server itself will use iptables to whitelist the [Cloudflare IP addresses](https://www.cloudflare.com/ips/).

### Hardware list

* Raspberry Pi 4 Model B with 8GB of RAM
* 32GB Samsung Evo Plus SD card
* Ethernet cable (CAT6)
* 2.5V power supply
* Asus RT-AC3200 Tri-Band Router
* Another computer to SSH into the pi

### Software list

* Nginx
* Docker CE
* Wordpress
* Mariadb
* iptables
* Ubuntu 20.04

### Services

* Cloudflare

## Implementation

### Setup the Raspberry Pi

* Flash Ubuntu to the SD card. Make sure you use the [ARM ISO image](https://ubuntu.com/download/server/arm). I use [balenaEtcher](https://www.balena.io/etcher/) to perform the flashing on a Mac.
* Before removing the SD card add an empty file called `ssh` in the boot directory. This will allow us to SSH into the pi after it initialzes.
* Insert SD, run an ethernet cable from the pi to your router, and plug in the power.
* Give the pi a few minutes to boot up and then you can SSH into it with username:password `ubuntu:ubuntu`. You usually can find the IP of your pi in the router admin.
* I highly recommend at this point you [disable password auth](https://askubuntu.com/questions/435615/disable-password-authentication-in-ssh) as an option for SSH and [generate a public/private keypair](https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md) for connecting to the pi.
* [Install Docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04) on the pi.
* Install Nginx on the pi:

    ```
    sudo apt update
    sudo apt install nginx
    ```

* Setup the docker-compose file. This is the one I used:

    ```yaml
    version: '3.3'

    services:
      db:
        image: mariadb:latest
        volumes:
          - db_data:/var/lib/mysql
        restart: always
        env_file:
          - .env

    wordpress:
      depends_on:
        - db
      image: wordpress:latest
      volumes:
        - ./wp-content:/var/www/html/wp-content
      ports:
        - "8000:80"
      restart: always
      env_file:
        - .env
    volumes:
      db_data:
    ```

* At this point you should create the [Cloudflare Origin CA certificates](https://support.cloudflare.com/hc/en-us/articles/115000479507-Managing-Cloudflare-Origin-CA-certificates) and upload them to the pi.
* Setup Nginx to proxy_pass the application running in Docker and encrypt traffic with the Cloudflare Origin CA certificates. In retrospect I could probably could have ran nginx in a Docker container as well. Here is the config file I used:

    ```
    server {

        listen   443 ssl;

        ssl    on;
        ssl_certificate    /etc/ssl/<site_name>.pem;
        ssl_certificate_key    /etc/ssl/<site_name>.key;

        server_name <site_name>.com;
        access_log /var/log/nginx/nginx.vhost.access.log;
        error_log /var/log/nginx/nginx.vhost.error.log;
        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header    Host                $host;
            proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
            proxy_set_header    X-Forwarded-Proto   $scheme;
            proxy_set_header    Accept-Encoding     "";
            proxy_set_header    Proxy               "";
        }

    }
    ```

    In this case I am only listening on 443 because Cloudflare will handle http->https redirects and I always want a secure connection between my pi and CF. I won't cover how to add and enable Nginx config here, the Nginx site has a [guide](https://nginx.org/en/docs/beginners_guide.html) you can check out if needed.

* Start up the Wordpress and database containers using docker-compose (you may be prompted to install docker-compose):

    ```
    sudo docker-compose up -d
    ```

* After giving a minute for everything to come to life, you should be able to access the Wordpress install at `https://<raspberry_pi_ip_address>`.
* You should still be behind your router firewall at this point so I would initialize the Wordpress install (create name, admin user, etc).

### Setup Cloudflare

Cloudflare has some [good docs](https://support.cloudflare.com/hc/en-us/articles/360027989951-Getting-Started-with-Cloudflare) to follow for setting up your domain with them. The only extra piece I did was enable strict end-to-end encryption under the SSL/TLS settings:

![Screenshot of Cloudflare SSL settings](assets/images/screenshot-of-cloudflare-ssl-settings.png)

### Setup iptables to only allow Cloudflare TCP access

The Ubuntu distro we are running already has iptables running. You can see the current firewall rules by running `sudo iptables -S`. We are going to add some rules around incoming TCP connections to port 443. We don't need to add them for port 80 since we are enforcing secure connections and will not open that port up in the router.

* Add iptable rules to only allow the [Cloudflare IP addresses](https://www.cloudflare.com/ips/):

    ```
    for ip in `curl https://www.cloudflare.com/ips-v4`; do sudo iptables -I INPUT -p tcp -s $ip --dport https -j ACCEPT; done
    ```

* To actually reject all other incoming requests to port 443 we will need a final DROP rule:

    ```
    sudo iptables -A INPUT -p tcp --dport 443 -j DROP
    ```

### Setting up the router

The last piece is to forward port 443 to your raspberry pi. This opens up your pi to the world but with iptables it should only allow the Cloudflare IP addresses access. Every router is different and you will likely need to search for port forwarding instructions if you don't already know how to do it.

**IMPORTANT:** After you have opened up the port, you will need log into the Wordpress admin at `https://<raspberry_pi_address>` and set the "Wordpress Address (URL)" and "Site Address (URL)" entries to the domain name you are using (ex. `https://<domain_name>.com`).

## Final thoughts

There is more I could do to harden this setup, such as:

* Change default `ubuntu` username.
* Run docker without `sudo`.
* Build and run the docker containers without mounting volumes.
* Change the default Wordpress admin URI.

My router rejects all traffic besides port 443 to the pi server and ip tables only allows Cloudflare traffic which is nice. I don't have remote SSH access but I'm OK with that for this project. Next non-security task will be to setup up a Github hook or some other CI/CD implementation for easy deploys.
