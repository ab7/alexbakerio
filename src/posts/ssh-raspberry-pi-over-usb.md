<!--//

title: SSH to a Raspberry Pi Zero over USB
date: 2018-06-18
image: raspberry-pi-zero-ssh-usb.jpg
live: true

//-->

# SSH to a Raspberry Pi Zero over USB

![Raspberry Pi Zero connected to mac](assets/images/raspberry-pi-zero-ssh-usb.jpg)

<!-- snippet -->This guide will enable you to SSH to a Raspberry Pi over USB. This is useful for Pi Zeros or when you you don't have access to the network router to grab the pi IP address.

## Prepare the SD card

1. Download a copy of [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/).
1. Flash the image using [Etcher](https://etcher.io/).
1. Once the card is flashed, re-insert SD card to mount.

## Configuring the boot drive

Add the following line to end of the file named `config.txt`:

    dtoverlay=dwc2

You will need to add `modules-load=dwc2,g_ether` to the `cmdline.txt` file. This can be added after the `rootwait` part. Example:

    ... rootwait modules-load=dwc2,g_ether quiet ...

**IMPORTANT:** Do not add a newline to this file! Otherwise it won't boot.

Add an empty file named `ssh` to the root directory of the boot drive.

## SSHing into the Pi Zero

Plug the USB cable into the Pi Zero and your computer. Make sure you use the data port on the zero and not the power port. The power port does not facilitate data transfer. The USB cable also needs to support data transfer. Some cheap ones only provide power.

![Close up of Raspberry Pi Zero USB port](assets/images/raspberry-pi-zero-usb-port.jpg)

Once the Pi has had a minute or two to boot up, you should be able to SSH into it:

    ssh pi@raspberrypi.local
