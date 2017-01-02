<!--//

title: Testing Internet Explorer on a Mac
date: 2015-08-04
image: placeholder.png
live: true

//-->

# Testing Internet Explorer on a Mac

Testing Internet Explorer on a Mac can be tricky. Whats even more tricky is testing code from your local environment in IE on a Mac. Luckily we can do this by using a virtual machine and routing our localhost to the VM.

## Requirements

* A copy of Windows 7
* [VirtualBox](https://www.virtualbox.org/)

## Setting up the virtual machine

We will start by creating a new virtual machine.

1. Name the box whatever you'd like and select 'Microsoft Windows/Windows 7 (64-bit)'.
1. If you have enough memory on your machine, 2048MB would be ideal, 1024MB will work.
1. Create a new hard drive and select 'VDI' and dynamically allocated on the next screen.
1. You are able to change the size of the hard drive later, but I would set the size to 30GB just to be safe.

## Installing Windows 7

This section assumes you will be installing Windows 7 via ISO.

1. Start the new virtual machine.
1. Click the folder icon to the right of the drop down and select your Windows 7 ISO.
1. Follow the instructions for installing Windows 7.
1. Once installed you will need to run the Guest Additions software included with VirtualBox. In the VirtualBox application menu select 'Devices/Insert Guest Additions CD Image...'. If it does not autorun, run the 64-bit installer from the mounted CD image. Guest Editions includes drivers to make Windows a bit more compatible with your Mac.
1. Update Windows and set up to your liking.

## Routing your host machines localhost to the virtual machine

The solution for this part was found via [Stack Overflow](http://stackoverflow.com/questions/1261975/addressing-localhost-from-a-virtualbox-virtual-machine).

If you want to route custom localhost domain names to the VM, edit the hosts file in the Windows 7 VM which can be found at:

    C:\Windows\System32\drivers\etc\hosts

In order to save the changes you make to the hosts file you will need to open Notepad in admin mode which can be done by right clicking Notepad and selecting 'Run As Administrator'.

Add the following IP along with your custom domain names (the ones listed below are examples):

    10.0.2.2 my-site.local.dev my-site-2.local.dev

You should be all set to navigate to these sites. Test by changing something in the code on the host machine and reloading the page in Internet Explorer on your VM.

## Other things to note

* In VirtualBox control click the VM and select settings, up the video memory to 128MB in Display/Video and uncheck "Floppy" and "CD/DVD" boot options in System/Motherboard settings.
* Internet Explorer Edge has a backwards compatibility mode in the developer tools that you can use to test IE9+ (make sure the copy of Windows you install is updated so you have the latest version of IE).
* If you save the state of the machine after each use instead of shutting down you will probably never need to activate the copy of Windows.

