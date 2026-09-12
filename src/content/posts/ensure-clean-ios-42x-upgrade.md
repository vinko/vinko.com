---
title: "How to Ensure You Have a Clean iOS 4.2.x Upgrade?"
description: "This morning (Nov. 22 PDT US time) Apple made the latest version (v4.2.1) of iOS available through iTunes. It is one of the highly anticipated upgrade for the iPad and other…"
pubDate: 2010-11-23
---

![How to Ensure You Have a Clean iOS 4.2.x Upgrade?](/wp-content/uploads/2009/08/apple_blue_logo.png)

![iOS4.2-ipad-upgrade](/wp-content/uploads/2010/11/ios4-2-ipad-upgrade.png)This morning (Nov. 22 PDT US time) Apple made the latest version (v4.2.1) of iOS available through iTunes. It is one of the highly anticipated upgrade for the iPad and other iOS devices. Not only because this version brings [features](http://thenextweb.com/apple/2010/11/22/ios-4-2-is-now-live-in-the-app-store-heres-what-you-need-to-know/) to the iPad that had been enjoyed by other iOS devices, it is also the first version of the OS to align all iOS devices to the same iOS version.

As a result many iOS device users rushed to download and upgrade their devices, causing slow downs to the iTunes upgrade servers. If you have trouble downloading the new update you can try the following direct download links [compliments of [MacStories](http://www.macstories.net/news/breaking-ios-4-2-now-available-for-download/)]

- [iPad](http://appldnld.apple.com/iPad/061-9857.20101122.VGthy/iPad1,1_4.2.1_8C148_Restore.ipsw)
- [iPhone 4](http://appldnld.apple.com/iPhone4/061-9858.20101122.Er456/iPhone3,1_4.2.1_8C148_Restore.ipsw)
- [iPhone 3GS](http://appldnld.apple.com/iPhone4/061-9895.20101122.Cdew2/iPhone2,1_4.2.1_8C148a_Restore.ipsw)
- [iPhone 3G](http://appldnld.apple.com/iPhone4/061-9853.20101122.Vfgt5/iPhone1,2_4.2.1_8C148_Restore.ipsw)
- [iPod Touch (4th generation)](http://appldnld.apple.com/iPhone4/061-9859.20101122.$erft/iPod4,1_4.2.1_8C148_Restore.ipsw)
- [iPod Touch (3rd generation)](http://appldnld.apple.com/iPhone4/061-9860.20101122.Xsde3/iPod3,1_4.2.1_8C148_Restore.ipsw)
- [iPod Touch (2nd generation)](http://appldnld.apple.com/iPhone4/061-9855.20101122.Lrft6/iPod2,1_4.2.1_8C148_Restore.ipsw)

Before you upgrading your iOS device you should always back it up by performing a synchronization using iTunes. I cannot reiterate enough how important it is to do this on a daily bases. Since these devices are mobile and you carry it around, so there is a high possibility of the device being stolen or damage resulting in losing your stored data on them.

The other thing you may need to do if you fall into one of the following groups of users:

- Users who have hacked (jailbroken or self carrier unlocked) the iOS device.
- Attempt to save your SHSH to future proof your iOS device’s abilities to be “carrier unlock”.

In both cases you should restore your device to a clean version of the iOS prior to downloading and upgrading to version 4.2.1.

Note: it is important you attempts to restore the device to a previous version of the iOS before you check for or download version 4.2.1. Because doing either of this steps will cause iTunes to delete any previous iOS versions. If this happened to you, you can try to download the [previous versions of the iOS](http://modmyi.com/forums/dlcat-firmware-6/) from ModMyi.com.

One other important thing to check is your computer’s [“hosts” file](http://en.wikipedia.org/wiki/Hosts_file), to ensure Apple’s authentication server can be reached prior to restoring your iOS device.

[![hosts](/wp-content/uploads/2010/11/hosts.png)](/wp-content/uploads/2010/11/hosts.png)
*Correct Mac OS X Hosts File*

### Modify “Hosts” File in Mac OS X

1. From Finder go to the Go menu and select “Go to Folder…” menu item.
2. In the resulting dialog type in “/private/etc/” without the quotes.
3. Locate the “hosts” file in the folder and open it with TextEdit.
4. You may want to save a copy of the original “hosts” file just incase.
5. Perform a “Save As…” from within TextEdit ensuring the “If no extension is provide, use .txt” checkbox is unchecked. Saving the file on the Desktop.
6. Drag the modified “hosts” file back into the /private/etc/ folder to replace the original file.
7. Enter the appropriate credentials when asked.

### Modify “Hosts” File in Windows

1. From the Start menu navigate to All Programs -> Accessories -> Notepad.
2. Right click on Notepad and choose the “Run as Administrator” menu item.
3. With Notepad running browse to the path C:WindowsSystem32driversetc.
4. Ensure the last line “74.208.10.249 gs.apple.com” or any other pointing to “gs.apple.com” is removed.
5. Now save the “hosts” file.

This change to the “hosts” file will ensure iTunes is directed to Apple’s servers to verify the iOS device’s [ECID](http://theiphonewiki.com/wiki/index.php?title=ECID), otherwise you will receive an error while restoring or upgrading your iOS device.
