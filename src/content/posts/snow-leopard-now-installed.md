---
title: "Snow Leopard Now Installed"
description: "As many of you know Apple released the latest version of OS X, 10.6 (aka. Snow Leopard) on Friday, August 28, 2009."
pubDate: 2009-08-30
---

As many of you know Apple released the latest version of OS X, 10.6 (aka. Snow Leopard) on Friday, August 28, 2009.

I had pre-ordered this version on Tuesday, when Apple began accepting orders on their online store for HKD238.00. Apple had originally told me that my order was going to ship on August 28 and I would not receive the shipment until Monday, August 31. Although I was a bit disappointed I was glad to have the time to prepare my Mac for the upgrade. So I was caught by surprised when Apple delivered my shipment on Saturday, August 29.

You ask, “…prepare my Mac for the upgrade”? Yes, I normally do a fresh Time Machine backup and a full image backup of the boot up drive before I attempt any OS upgrade. Since this time it is a dot release, and the amount of changes to the underlining OS, it is even more important to do so.

For the case of OS 10.6, almost all components of the system has been rewritten in 64 bit architecture. Even the kernel; underlining engine that drives the OS, boots up in 32 bit mode by default unless the user holds down the “6” and “4” keys during boot up, but all 64 bit application will run in 64 bit architecture. The reason booting up in 32 bit mode by default is for general compatibility with the early Intel based Macintosh (Intel Core Duo) which are 32 bit.

Due to this 64 bit architecture, there is also a great deal of incompatibility for Plug-ins, Extensions, and Input Managers. It is best to examine the usual locations for these items for incompatibility first before performing the upgrade. You can use the excellent crowd source list at [SnowLeopard.Wikidot.com](http://snowleopard.wikidot.com/ "Snow Leopard Compatibility list") to see if the applications, extension and plugins are Snow Leopard compatible.

The usual locations for Plug-ins, Extensions, and Input Managers are:

- /Library/Adddress Book Plug-ins/
- /Library/Contextual Menu Items/
- /Library/InputManagers/
- /Library/Internet Plug-Ins/
- /Library/iTunes/iTunes Plug-ins/
- /Library/PreferencePanes/
- /Library/QuickTime/
- /Library/StartupItems/
- /Library/Widgets/
- ~/Library/Adddress Book Plug-ins/
- ~/Library/Contextual Menu Items/
- ~/Library/Internet Plug-Ins/
- ~/Library/iTunes/iTunes Plug-ins/
- ~/Library/PreferencePanes/
- ~/Library/Widgets/

***Note**: the “~” represent the Home directory of the current User account*

Since this version of OS X is an upgrade, there was not the usual options in the Installer to do an “Archive & Install” or “Erase & Install”. I was going to do a fresh install but erasing my hard drive, install a fresh copy of 10.5.8 then upgrade it to 10.6, but I decided not to. If you want to do so, you will have to first erase your hard drive using Disk Utility, then install OS 10.6.

Apple said that the new OS has a smaller foot print, which was indeed true. I compared my hard drive’s free space (26GB) before upgrade to after the upgrade (39.3GB), which means I gain 50% more disk space after the upgrade. During the installation wizard I did choose my normal Customized install, by excluding all Language version of OS X and Printer Drivers. Although, this time the Installer had a new option for Print Drivers, which is to install only the Print Driver necessary for this Mac.

After about 12 hours of use, I find OS 10.6 to be pretty good. So far there are no incompatibilities that I can see, especially after I removed all known incompatibilities prior to the upgrade.

My main advice to all is **make sure you have a full backup before attempting the upgrade**.
