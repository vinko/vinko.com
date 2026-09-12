---
title: "Problem with Mozy [August 28 Update]"
description: "After being assigned a specific contact, Ben, from the Mozy Macintosh Support, the responses from Mozy has become much more efficient and specific. I hope this is something…"
pubDate: 2007-08-28
---

![Mozy Logo](http://www.vinko.com/images/temp/mozy_logo.png)

After being assigned a specific contact, Ben, from the Mozy Macintosh Support, the responses from Mozy has become much more efficient and specific. I hope this is something that Mozy has recognized and changed for future Mac users.

Anyway, on with my experience on this version of Mozy for Mac (0.6.2.2 (23015)) which Mozy released on August 24, but I was not able to try it out until this morning.

Since I just reinstalled the application, I have yet to confirm is my previous problems have been corrected as reported by Ben. The most noticeable difference with this latest version is that they had changed the icon for the application throughout: in Mozy Status, Mozy and MozyBackup (the latter is a background application).

Unfortunately, with this latest version some other issues with the configuration has creep up where I did not encounter in previous version.

1. The setup wizard was stuck at trying to log me onto Mozy site. I had to quit and restart the Mozy application before I was able to try again. Then when I tried again it came up with the error message:  
   > Mozy could not log you in. Please try again or contact us at macsupport@mozy.com.
   >
   > (Error: (null))

   Which is a very useless message.
2. During the attempt to configure Mozy, it keep displaying a error dialog stating that “… no backup had started.”, and this dialog is modal but did not alert me at all. It appears to come from the Mozy Status application, and the dialog is hidden behind all my other active application window including Mozy.
3. I was finally able to get pass the log in after 3 attempts, Mozy would not stop scanning my drive. The checkbox also started to jump around on the window after I clicked on the “Apple Mail” checkbox. So I quit the Mozy application and tried again. I then encounters the problem logging on again. After a few more attempts (quitting and restarting the Mozy application). It finally able to log in and successfully finish scanning the hard drive.I don’t think the Mozy application should allow the user to click on any of the Checkboxes while it is still scanning the hard drive for the different categories of files and before it finishes “Loading Account Information”.
4. For some reason the controls (Throttle Slider, the Edit Fields for the Throttle Duration in the Performance pane of the Mozy application Preferences window is very sluggish. The first time I accessed the Performance pane of the Mozy application Preferences none of the other pane (General and Scheduling) were accessible. I had to restart the Mozy application, and I was not able to reproduce this.I do not think that one should be allow to make any changes to the Mozy configurations with the Mozy application when a backup is in progress.
5. Using the Activity Monitor I see that the MozyBackup application is marked as (Not Responding). This usually happens when it is not being friendly to the other applications that are running on the Mac. This is with my Throttle settings set to 768Kb/s between 09:00 – 03:30 and the test were performed at 14:00 local time.Strangely during this time I see that the Mac does not have any network traffic, the backup is still in progress; with the status message “Communicating with server”. Speaking of the Status window. There should be a preference to keep the Status Window above all other application windows or let it go behind when another application become active.

I had never figure out the answer to this question

> Does the fact that the Apple Mail application is running and emails are coming in and out from various different accounts effect Mozy’s current backup, when the Apple Mail Messages is chosen in the Configuration and one type of content to backup?

Why does the Mozy Status Window show “Backing up 258.3MB (14,677 files)”? When I chose the categories of files to back up, the “Apple Mail Messages” alone was over 2GB plus I also chose “Application Preferences” and “Keychains”. The three categories together in the Configuration window shows 2.1GB (65,354 files). Is the Status Window only showing one category at a time?

I will report back when the backup is complete (hopefully).

Please see my original article “[Problem with Mozy](http://www.vinko.com/php/blog/2007/04/27/problem-with-mozy-updated/)” for background.
