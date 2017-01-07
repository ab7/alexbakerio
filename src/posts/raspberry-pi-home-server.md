<!--//

title: How to set up a home server using a Raspberry Pi
date: 2014-10-28
image: placeholder.png
live: false

//-->

######################################################
SET THE PARTS USER NEEDS TO CHANGE TO A DIFERENT COLOR
######################################################


# How to setup a Raspberry PI as a nginx server serving flask applications using Mac.

Disclaimer
If you're not comfortable with the command line, I recommend checking out this tutorial instead.

??? Disable and router port forwarding
<!-- snippet -->??? I personnaly have been using my pi to experiment with other things, so I question the security of its current state. I think wiping the SD for the purpose of making a server is an excellent idea!

## Items needed:

* Raspberry PI B+ Model (case?)
* Raspbian / debian wheezy image
* SD card (min 4 gigs)
* USB Keyboard
* Monitor with HDMI input || TV RCA input
* LAN cable
* wireless router


## Setting up the SD Card

* The first step is preparing the SD card. Using the mac utility, format the disk to FAT32.
* Unzip raspbian disk image
* Run to find disk location of SD card
        diskutil list to find sd card disk number
* Then unmount disk so we can load Raspbian
        diskutil unmountDisk /dev/disk{# of sd card}
* Load image onto SD card
        sudo dd bs=1m if=2014-09-09-wheezy-raspbian.img of=/dev/disk1

    VERY important to note that the m in 'bs=1m' needs to be lower case or this error will be thrown:
        'dd: bs: illegal numeric value'
* After Raspbian has been loaded onto the SD card, its time to move to the pi.


## Setting up the Raspberry Pi

* Plug in moniter/keyboard/SD card and power on
* Don't plug in LAN cable until we set up the PI with a new user
* Wait for the bootloader
* Expand file system
* change timezone
* keyboard layout
    the generic option should work fine in most cases, but change to the keyboard listed if you want.
    If youre not in the UK, I highly recommend you select other on the next screen.
    Choose English(US)
    Choose English(US) again
    Default
    No compose key
    no
* advanced layout
    Memory split to 16
    Ensssure ssh is enabled
* finish reboot


## Remove root user

* Once the pi reboots, you'll need to enter the default user and password
        raspberry pi login: pi
        password: raspberry
* Add new user
        sudo adduser {your desired user name}
    I leave all the info fields blank
* Give the user admin privlages
        sudo usermod -a -G sudo exampleuser
    Research command flags
* GET PI IP ADDRESS
* Shutdown (might need -h flag)
* Unplug pi/keyboard/monitor
* Plug in LAN cable
* Login into pi from Mac terminal
* If you've logged into the pi before, you may have a problem in which it denies you access
        IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
    Just delete the `known_hosts` folder in your `.ssh/` directory
* Now delete the default pi user
        sudo deluser --remove-all-files pi
* Now is a great time to update the Raspbian package
        sudo apt-get update && sudo apt-get upgrade


## Setting up SSH Key-Pair Auth

MAC
* On your Mac Create the keygen
        ssh-keygen
* Press enter to let it put the key in the default location in .ssh dir
* Leave passphrase empty
    This is so you dont have to enter
* Transfer the public key to the pi
        scp ~/.ssh/id_rsa.pub {user_name}@{pi IP address}:

PI
* Create directory for auth key
        sudo mkdir .ssh
* Move key into .ssh directory
        sudo mv id_rsa.pub .ssh/authorized_keys
* Change ownership of .ssh directory to your user_name
        sudo chown -R {user_name}:{user_name} .ssh
        chmod 700 .ssh
        chmod 600 .ssh/authorized_keys
   Research whats happening here
* Disable root login and password auth
        sudo nano /etc/ssh/sshd_config
   Uncomment PasswordAuthentication and set to no
   Set PermitRootLogin to no
   Make sure AuthorizedKeysFile is not commented out

## Setting up the firewall

https://www.linode.com/docs/security/securing-your-server/
* Check firewall settings to confirm nothing is set up
        sudo iptables -L
* Create file for with firewall settings
        sudo nano /etc/iptables.firewall.rules
* Activate new firewall settings
        sudo iptables-restore < /etc/iptables.firewall.rules
* Make sure it sets on startup
        sudo nano /etc/network/if-pre-up.d/firewall
* Change permissions
        sudo chmod +x /etc/network/if-pre-up.d/firewall


## Setting up Nginx




