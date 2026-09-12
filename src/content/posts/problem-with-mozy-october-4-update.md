---
title: "Problem with Mozy [October 4 Update]"
description: "After 5 months of testing, back and forth with Mozy support and eventually being assigned a Mozy Macintosh developer to resolve my issues encountered I was finally able to…"
pubDate: 2007-10-04
---

![Mozy Logo](http://www.vinko.com/images/temp/mozy_logo.png)

After 5 months of testing, back and forth with Mozy support and eventually being assigned a Mozy Macintosh developer to resolve my issues encountered I was finally able to backup my selected files to the Mozy server automatically.

This was all accomplished with version 0.6.2.4 of Mozy Client for Macintosh.

Today Mozy informs me that there is a new version (0.6.4.0 (24503)). Strangely my Mozy client did not know there was a newer version, even though the Mozy Preference “Install updates automatically” was set. I guess and hope this is because Mozy Client for Macintosh is still in Beta.

I downloaded the new Mozy Client for Macintosh and uninstalled my copy of Mozy deleting all configuration files. This is because I want to make sure I am experiencing the new Mozy Client like all other users would.

The following is what I noticed and issues encountered:

1. It appears that Mozy have added a few more standard set of files to backup in their Configuration window. Given that Mozy Home (free version) only has 2GB of storage available, I do not believe Mozy should select the kind of files by default in the Configuration window.
2. Also in the Configuration window some of the file types did not have the correct number of files and total size calculated properly. By this I mean that some of the file type were showing -8,xxx,xxx files and ridiculous size. This cleared up after I saved the configuration, restarted the Mozy Client for Macintosh and re-enters the Configuration window.
3. I then clicked on the “Start Backup” menu item from the Mozy Menu, nothing seem to happen. The Mozy icon in the Menu Bar did not change. I then selected the “Show Status Window” from the Mozy Menu and the following is what shown.![Mozy Status Window](http://www.vinko.com/images/temp/mozy-backup-status.png)  
   This is very strange, as I cannot believe Mozy would allow this latest version to going backwards in quality. So I clicked on “View Log File…” from the Mozy Menu.

   The Console application opened showing the content of the Mozy.log file. Apparently the Mozy Client is doing something, and what it is doing appears to be related to performing a backup. So I again selected the “Show Status Window” menu item from the Mozy Menu and it still displays, “No Backup Yet”
4. A welcome change is that Mozy reorganized the Mozy Menu by grouping related functions together using a divider to separate the different groups.

I will be passing these findings to my contact at Mozy immediately and hopefully these issues require just minor tweaking.

I was about to give Mozy for Macintosh a “5 Thumbs Up” after a whole month of use, with uneventful successful backups, but now with the latest version I am reluctant to do so.

Please see my original article “[Problem with Mozy](http://www.vinko.com/php/blog/2007/04/27/problem-with-mozy-updated/)” for background.
