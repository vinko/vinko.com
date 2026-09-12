---
title: "Problem with Mozy [July 19 Update]"
description: "When the set up and scanning of my Mac went some what smoothly I thought Mozy has finally corrected all the problems for this “Alpha class” software for the Mac."
pubDate: 2007-07-19
---

![Mozy Error Message](http://www.vinko.com/images/temp/mozy_logo.png)

When the set up and scanning of my Mac went some what smoothly I thought Mozy has finally corrected all the problems for this “Alpha class” software for the Mac.

After numerous attempts of the background Mozy application trying to back up my 2.2GB of data to Mozy server. I spent some time looking at the mozy.log (/var/log/) file that Mozy support and pointed me to previously. What I found was very disturbing. I see many many occurance of error:

> 2007-08-19 05:12:41.651 MozyBackup[7590] (triton) NSCFInputStream error: NSError “POSIX error: Operation timed out” Domain=NSPOSIXErrorDomain Code=60  
> 2007-08-19 05:12:41.651 MozyBackup[7590] (triton) disconnecting…  
> 2007-08-19 05:12:41.653 MozyBackup[7590] (send) Batch failed: NSError “Error com.berkeleydata.Backup.ErrorDomain -2147483648? Domain=com.berkeleydata.Backup.ErrorDomain Code=-2147483648 UserInfo={  
> ErrorCodeNameKey = ConnectionError0;  
> ErrorMessageKey = “Unable to connect to backup servers”;  
> }

Over the 2 hours that the backup had ran so far, it encountered this error 8 times. The most disturbing part is that after each occurrence the backup would continue from an arbitrary spot.

Although, I have yet to find out from Mozy support what these errors means, but it is not making me feel secure that Mozy is a reliable backup mechanism.

My recommendation is still… DO NOT RELY ON Mozy on the Mac at the current version.

Hopefully more to come after I receive some responds from Mozy support.

Please see my original article “[Problem with Mozy](http://www.vinko.com/php/blog/2007/04/27/problem-with-mozy-updated/)” for background.
