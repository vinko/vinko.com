---
title: "Problem with Mozy [July 6 Update]"
description: "Mozy support replies to me asking me to send them the log file. They first tells me to go to “C:”, which was silly as that was terminologies for a Windows OS computer."
pubDate: 2007-07-06
---

![Mozy Error Message](http://www.vinko.com/images/temp/mozy_logo.png)

Mozy support replies to me asking me to send them the log file. They first tells me to go to “C:”, which was silly as that was terminologies for a Windows OS computer.

I had to send them an email reminding them that I was using Mac OS X. So now they tells me that the Mozy log file can be found within the Mac OS X file system

> /var/log/mozy.log

So I quickly found the file and sent it to them.

A few hours later they tell me that i am encountering error “ConnectionError0?. Which I was not surprise, as that was what I told them in my original bug report back in July 1.

In the same email, they tells me that “ConnectionError0? means that Mozy is having problems accessing port 443 and asked me to open this port within my Mac OS X Firewall.

So, I replied back to Mozy technical support, asking why does Mozy need to access port 443 and asked whether port 443 is the default port of HTTPS access. Plus none of my other programs have problems accessing ports 443.

Up until now they [Mozy Technical Support] still have not given me any explanations as to why Mozy needs me to open port 443 in my Mac OS X Firewall.

I am guessing that Mozy is setting up a HTTPS server on my Mac to allow Mozy’s own server to retrieve data from my Mac OS X system. Is this a good idea? As I am not a network expert so I cannot tell.

Please see my original article “[Problem with Mozy](http://www.vinko.com/php/blog/2007/04/27/problem-with-mozy-updated/)” for background.
