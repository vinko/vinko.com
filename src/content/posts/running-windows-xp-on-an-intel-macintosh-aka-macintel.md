---
title: "Running Windows XP on an Intel Macintosh (aka. “Macintel”)"
description: "You can now run Windows XP on a Macintel. The solution was found with the contest that started it all 3 months ago. It ended with two individuals calling themselves “blanka”…"
pubDate: 2006-03-13
---

[![WinMac](http://www.vinko.com/images/WinMac.png)](http://wiki.onmac.net/index.php/HOWTO)

You can now run Windows XP on a Macintel. The solution was found with the [contest](http://onmac.net/) that started it all 3 months ago. It ended with two individuals calling themselves “blanka” and “narf2006” winning the final jackpot of USD13,854.00.

The full instructions can be found at the Contest site’s [How To](http://wiki.onmac.net/index.php/HOWTO) page.

[Update – 2006.03.23] there is also an excellent video steping through the instructions at [UneasySilence](http://www.uneasysilence.com/archive/2006/03/5757/)

There is also a new instruction where one can create the Windows XP On Macintosh Boot CD on a Macintosh without using a computer that runs Windows.

In this experiment I used an Intel iMac to create the Boot CD.

If you are going to follow my foot steps, there are much details in the [Fink](http://fink.sourceforge.net/) install that may not be obvious from following the instructions. The currently tested version of Fink on the Intel Mac is 0.24.12, and the “mkisofs” package is not available in the “stable” branch of the Fink install.

At the moment I am still investigating the “mkisofs” issue. One possibility is that the “mkisofs” package is in the “unstable” branch of the Fink release. If this is the case we must modify the “/sw/etc/fink.conf” file so that “unstable/main” and “unstable/crypto” in the TREE parameter. This will get Fink to look in the “unstable” tree for package’s source.

If you do not have a Windows XP Pro SP2 install CD but just a regular Windows XP Pro install CD, then you will need to create what Microsoft calls a “[Slipstream](http://kb.parallels.com/en/5446 "Creating Slipstream CD")” CD.

When the above are completed we can go back to the OnMac instructions and create the Windows XP On Macintosh Boot CD.

My first attempt to create the Boot CD failed. When attempting to use the created CD to begin the Windows XP installation, the system claims that the CD is not a valid El-Torito formated disk. II plan to try again, and when I have more information, I will announce it here. Please stay tune.

Note: Please remember that downloading the instructions and associate files is legal, but the jury is still out as to whether modifying the Windows XP install CD is legal, so be careful of the Microsoft police.
