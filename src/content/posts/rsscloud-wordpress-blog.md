---
title: "RSSCloud in Your WordPress Blog"
description: "If you have a blog you will agree that RSS is one of the most important piece of technology to help disseminate your blog content through out the Interweb."
pubDate: 2009-09-08
---

If you have a blog you will agree that [RSS](http://en.wikipedia.org/wiki/Rss "Definition of RSS") is one of the most important piece of technology to help disseminate your blog content through out the Interweb.

Unfortunately this RSS (protocol) is a pull technology where subscriber to the feed must poll the source of the RSS feed for new content. Often this polling iteration is every 15 minutes or so. In the current realtime world of Twitter, FriendFeed and Facebook timelines, this method of requesting information seems old and out-dated. This is why one of the pioneer for RSS, Dave Winer, came up with rssCloud, a new element that was added to the RSS protocol in January 2001 as part of RSS 0.92 and later in [RSS 2.0](http://cyber.law.harvard.edu/rss/rss.html "RSS 2.0 Specifications").

With rssCloud the newsfeed readers will no longer have to poll the source of the feed for content periodically. Instead as soon as new content is available from the source it is pushed (sent) to all subscribers of the feed. This lends to more timely conversation on the content and serves our realtime web much better.

Prior to [Automattic’s](http://automattic.com/ "Automattic web site") adoption of rssCloud the only reader that recognize the <cloud> element was Winer’s River2 RSS reader, this created a chicken-and-egg problem where RSS reader developers were not eager to add the rssCloud feature to their reader and site owners did not bother with adding the element into their RSS feed.

WordPress.com supports for rssCloud had basically eliminated this stalemate, and gave the developers of RSS readers a potential of 7.5 million blogs with support for this feature. Now it will be up the the developers of RSS readers to make their move to get the momentum flowing.

Fortunately, [Joseph Scott](http://josephscott.org/ "Joseph Scott web site") was kind enough to help with this drive, he released a [WordPress plugin](http://wordpress.org/extend/plugins/rsscloud/ "RSSCloud WordPress plugin") to help self-hosted WordPress blogs add the rssCloud support to their own feeds.

Also on the RSS reader front, the cool up and coming web service, [LazyFeed](http://www.lazyfeed.com/ "LazyFeed web site") is [announcing](http://blog.lazyfeed.com/2009/09/lazyfeed-will-integrate-rsscloud-and.html "LazyFeed rssCloud Announcement") support for rssCloud.

I suggest all WordPress blog owners; no matter self-hosted or one residing on WordPress.com, enable this features, so we can add to the excitement and trend of this realtime web evolution.
