---
title: "Problem with Mozy [Updated]"
description: "Over the years I had explained to many friends who use personal computers to perform regular backups of their data. Even so, many of these friends still do not do so, pointing…"
pubDate: 2007-04-27
---

![Mozy Error Message](http://www.vinko.com/images/temp/mozy_logo.png)

Over the years I had explained to many friends who use personal computers to perform regular backups of their data. Even so, many of these friends still do not do so, pointing to reasons that doing a backup is too complicated and technical. So when I heard about this online backup tool, “Mozy”, that recently released a Macintosh client, I was excited to give it a run through, before recommending it to my friends.

Unfortunately, right after I down load the Mac OS X client, installed it and began the configuration assistance process I encounters a problem. I keep receiving the error message:

> Could not log in  
> Mozy could not log you in. Please try again or contact support (support@mozy.com).(Error code: -2)

This happened right after I entered the credentials for my account. Although, using the same credentials I was able to log into the Mozy web site using my browser.

So I thought the cryptic error code may means that the Mozy server was busy. Possibly due to all the press that it was getting for finally releasing a Mac OS client. According to these same press coverages they are the first among these service providers.

I waited a day and then retried, but with the same result. So I followed the advise of the error message and sent an email to Mozy support at their specified email address, asking them for their assistance.

I was surprise and a bit annoyed to receive the follow reply from their support;

> This means that you’re using either an invalid username or  
> password. If you have the right client version and you can’t  
> remember your password, reset it here:http://mozy.com/login/forgot

When I clearly stated that I was able to log into the Mozy web site with the same credentials and could not with the Mac OS X client.

So I had to waste time replying to their email reiterating the fact that I was able to log into the Mozy web site. I then receive the following from their support representative:

> Even though you can still log into your online account, most people can resolve this issue by resetting their password. You can reset your password at http://mozy.com/login/forgotIf you’ve already configured Mozy, you’ll have to change your password on the client. You can do this by clicking “Configure.” After loading, the configuration will prompt you for the new password.

By this time I was fair upset with their incompetence and the clear failure to read my original email.

I had already told them that the problem with the Mozy Mac OS X client was right after I installed the client application for the first time, which it began to guide me through their Configuration Assistance, and after the step where I had to enter my Mozy credentials.

So, either the support representative (“Spencer”) did not read my emails at all or he is not even familiar with their own software workflow.

What I did was again reply to their email explaining myself the third time. While at the same time gave them the benefit of the doubt and request a reset of my password through the URL they had provided me in a previous reply. Not to my surprise, the reset of the password did not work.

Therefore, aside from voicing my disapproval of their handling of my problem and their failure to recognize my problem, I included screen (included below) shots to show what I am talking about.

![Mozy Error Message](http://www.vinko.com/images/temp/mozy1.jpg)

![Mozy Error Message](http://www.vinko.com/images/temp/mozy2.jpg)

Because fo my experience I advise all Mac users to hold off in trying this software/service until Mozy resolve their issue.

[*Update: May 1, 2007*]  
Mozy support has just replied to my 4th inquiry of my problem and said the following:

> We should be releasing a new version later this week that my help with your problem.

So please stay tune.

[*Update: May 4, 2007*]  
Mozy released a new version [v0.4.1.2 (19793)] of the Mac OS X client. It did resolve my problem of the Configuration Assistant not recognizing my account. As the reader, Marcus pointed out it was a permission problem that Mozy did not adhered to. Unfortunately, one problem solved and I am able to proceed a bit further in the Configuration Assistant, but now there is another problem where the Mozy client claims to be “Scanning Backup Sets…” and never finishes. I reported this to Mozy support.

[*Update: May 5, 2007*]  
Mozy released a new version [v0.4.1.4 (19867M)] of the Mac OS X client, so I was eager to try it immediately hoping that it will resolve my problem. Unfortunately, the problem with the “Scanning Backup Sets…” is still there. Of course I immediately reported the problem to Mozy, and they replied that Mozy is a Beta software and they are making improvements constantly, and then asked me to send them my Mozy.log file.

[*Update: May 5, 2007*]  
Mozy technical support replied with the following:

> What happens if you let the configuration dialog just run for a while? It should be doing something and it may just take a few minutes.

They appear to be just shooting in the dark. Very typical of my Windows platform software developers. I replied to them saying that the “Scanning Backup Sets…” had ran for at least 5 minutes.

[*Update: May 7, 2007*]  
Another Mozy technical support reply:

> Make sure you’re running it as administrator, and make sure your clients stay up to date. This is most likely a bug, and if so, it should be fixed in the next revision.

You can probably guess what I say to them. How can any software developer / company tells the customers to be running in Administrator mode? Especially when Mozy is suppose to be running at all times in the background. I am starting to be very discourage by this company’s ability to create a good reliable product. The latter is extremely important since we are talking about a Backup Utility.

[*Update: July 1, 2007*]  
Now I am running Mozy for Mac OS X version 0.6.0.0. It no longer requires me to be in an account in Mac OS X with administrator rights. As I had pointed out previously that is definitely not a good idea.

Now when I ran Mozy on my Mac, it keeps triggering [Little Snitch](http://www.versiontracker.com/dyn/moreinfo/macosx/17642) wanting to contact various servers through port 443. Although, I am uncertain what these servers are; as it only displays the IP addresses of the servers rather than their domains, I still allowed Mozy and MobBackup access.

Shortly after Mozy ran for about 20 minutes it encountered an error “ConnectionError0”. So I reported this to Mozy Support.

> Dear Sir/Madam,
>
> I had encountered a problem while Mozy was attempting to backup my  
> Mac.
>
> 1. Mac OS 10.4.10
> 2. Mozy v0.6.0.0
> 3. Mac OS X’s built in Firewall is turned on
> 4. Internet is accessed from a Router (Apple’s Airport Extreme Base  
>    Station) via the ISP, Netviator (a service offered by PCCW in Hong  
>    Kong).
> 5. No anti-virus application running other than LittleSnitch, which  
>    had already set to allow Mozy (the entities Mozy and MobBackup)  
>    access to servers/ports that it asked for. Currently ports 443  
>    (https) for the following servers:
>    - 66.133.112.13
>    - 66.133.112.23
>    - 66.133.108.30
>    - 66.133.117.214
> 6. The error message displayed is “ConnectionError0”

[*Update: July 6, 2007*]  
Mozy support replies to me asking me to send them the log file. They first tells me to go to “C:”, which was silly as that was terminologies for a Windows OS computer.

I had to send them an email reminding them that I was using Mac OS X. So now they tells me that the Mozy log file can be found within the Mac OS X file system

> /var/log/mozy.log

So I quickly found the file and sent it to them.

A few hours later they tell me that i am encountering error “ConnectionError0”. Which I was not surprise, as that was what I told them in my original bug report back in July 1.

In the same email, they tells me that “ConnectionError0” means that Mozy is having problems accessing port 443 and asked me to open this port within my Mac OS X Firewall.

So, I replied back to Mozy technical support, asking why does Mozy need to access port 443 and asked whether port 443 is the default port of HTTPS access. Plus none of my other programs have problems accessing ports 443.

Up until now they [Mozy Technical Support] still have not given me any explanations as to why Mozy needs me to open port 443 in my Mac OS X Firewall.

I am guessing that Mozy is setting up a HTTPS server on my Mac to allow Mozy’s own server to retrieve data from my Mac OS X system. Is this a good idea? As I am not a network expert so I cannot tell.

[*Update: July 17, 2007*]  
I finally have time to try Mozy again. So I installed it again, followed the setup and allowed it to run in the background. After Mozy ran for 2.5 hours an error dialog appeared with the following message:

> Unable to connect to backup server (ConnectionError0)

The dialog has a hyperlink on the error message, when I clicked on it, it brought me to a web page on Mozy’s site telling me that this is a rare error and that I should send the following information to Mozy (support@mozy.com):

1. The operating system you use (i.e. Windows XP)
2. The version of Mozy you are using. (Right click on the orange “M” icon in the bottom right by the clock and click “status.” When that window opens you should see a version like 1.8.2.3)
3. Do you have any firewalls on your computer?
4. Who is your Internet service provider?
5. Do you have any anti-virus or spyware software?
6. Which error code is displayed? (i.e. MozyClientError2, ConnectionError1)

Of course I again reported this to Mozy Technical support (macsupport@mozy.com). So now I just have to wait for Mozy to reply.

[*Update: August 15, 2007*]  
Mozy support finally replied to me on August 1st but there were two conflicting replies from Mozy support. One tells me to try the new version and the other the other instructed me to go into command line and execute the following:

> $ cd /Library/Application Support/Mozy  
> $ sudo rm -f state.db

it is quite obvious the latter was taking the brut force approach to try to solve my long standing problems. It became apparent that “Karl” is the one who is correct, who asked me to try downloading the new version (0.6.2.0 (332))of Mozy for Mac.

I finally had a chance to reinstall Mozy today and now Mozy appears to be doing its thing. I had configured it to backup all my emails, System Preferences and Keychains. This had already cause it to reach the 2.2GB storage limit for a free account.

According to the Mozy Status window it still has another 4 hours to go. It had ran for about 10 minutes thus far, with a bitrate of approximately 80KB/s.

So what I’ve learned is that Mozy for Mac should be classified as an Alpha status software and not as beta.

One should send all technical enquiries relating to the Mozy for Mac to macsupport@mozy.com and not the regular support@mozy.com email address. You should always reply to the macsupport@mozy.com address even though emails from Mozy does not have that as their reply address.

During the backup, I quit most of the running applications, including Apple Mail, as I was asking it to backup all my emails. I wonder what would happen if I continue to use my Mac regularly and Mail keep downloading and deleting emails. Will these actions confuse Mozy backup?

More to report after the backup is complete.

BTW: some of you may notice in the comments of this article, there is a Mac user who had a great deal of problem retrieving the backup (approximately 30GB) from Mozy for a restore. Although, my backup strategy will not require me to have a large backup, but I do have emails dating back a far as 10 years ago in my Mail database. I would be interested in hearing more experience from Mac users who had tried to restore their Mozy backups.

[*Update: August 19, 2007*]  
When the set up and scanning of my Mac went some what smoothly I thought Mozy has finally corrected all the problems for this “Alpha class” software for the Mac.

After numerous attempts of the background Mozy application trying to back up my 2.2GB of data to Mozy server. I spent some time looking at the mozy.log (/var/log/) file that Mozy support and pointed me to previously. What I found was very disturbing. I see many many occurance of error:

> 2007-08-19 05:12:41.651 MozyBackup[7590] (triton) NSCFInputStream error: NSError “POSIX error: Operation timed out” Domain=NSPOSIXErrorDomain Code=60  
> 2007-08-19 05:12:41.651 MozyBackup[7590] (triton) disconnecting…  
> 2007-08-19 05:12:41.653 MozyBackup[7590] (send) Batch failed: NSError “Error com.berkeleydata.Backup.ErrorDomain -2147483648” Domain=com.berkeleydata.Backup.ErrorDomain Code=-2147483648 UserInfo={  
> ErrorCodeNameKey = ConnectionError0;  
> ErrorMessageKey = “Unable to connect to backup servers”;  
> }

Over the 2 hours that the backup had ran so far, it encountered this error 8 times. The most disturbing part is that after each occurrence the backup would continue from an arbitrary spot.

Although, I have yet to find out from Mozy support what these errors means, but it is not making me feel secure that Mozy is a reliable backup mechanism.

My recommendation is still… DO NOT RELY ON Mozy on the Mac at the current version.

Hopefully more to come after I receive some responds from Mozy support.

[*Update: August 22, 2007*]  
Today I received a reply from Moyz Support on my last report of problems with their Mozy for Mac version 0.6.2.0 (1.0). This time it only took 3 days for them to reply.

The one thing different about this, is that during the past 3 days, someone from Mozy sent me an email saying that a specific Mozy Macintosh Technical Support representative (Ben) will follow up on my issues.

Unfortunately, as in the past their tech support gave, in my opinion, a very ridiculous solution for a backup software.

> Thanks for sending us the log file. We have been seeing this with the latest version of the Mac Beta and are working to address it. For the most part it seems to be intermittent. You can still back your data up for the time being, it just wont be as convenient since you will just need to restart the backup when it happens or leave it on automatic so it re-attempts every 2 hours. The next release of the beta software will address this.

As most of you will agree, for a backup software, reliability is one of the most important thing to have, and if the user does not know if the back up is successful, or if whether it was actually done. These are not good traits for a backup software to have.

I immediately reply to the Mozy Support copying Mozy Mac Support (macsupport@mozy.com) and Ben.

I then received a reply from Ben, indicating that the new release coming out tomorrow will resolve my problem. I am eager to try and see if this next version will indeed resolve my problem.

As always more to come…

[*Update: August 28, 2007*]  
After being assigned a specific contact, Ben, from the Mozy Macintosh Support, the responses from Mozy has become much more efficient and specific. I hope that this is something that Mozy has recognized and changed for future Mac users.

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

Why does the Mozy Status Window show that “Backing up 258.3MB (14,677 files)” but when I chose the categories of files to back up, “Apple Mail Messages” alone was over 2GB and then I also chose “Application Preferences” and “Keychains”. The three categories together in the Configuration window shows 2.1GB (65,354 files). Is the Status Window only showing one category at a time?

I will report back when the backup is complete (hopefully).

[*Update: October 4, 2007*]  
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
