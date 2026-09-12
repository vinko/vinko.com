---
title: "Coding Standards"
description: "Many of you who knows me, knows that I am a strong proponent of standards (W3C) when comes to web development. I will not go into what W3C is, because I had wrote a post here…"
pubDate: 2008-10-14
---

Many of you who knows me, knows that I am a strong proponent of standards ([W3C](http://w3c.org "W3C web site")) when comes to web development. I will not go into what W3C is, because I had wrote a post here almost 4 years ago called, *[Compatibility](http://blog.vinko.com/2004/10/31/compatibility/ "Permanent Link: Compatibility")*.

Since then Microsoft has publicly acknowledge its mistake of trying to impose its own way of doing things as the “standard”, rather than adhering to the W3C Standards, which they are a member of.

What Microsoft did in the past 10 years or so was horrible. Leveraging on the unquestionable prevalent of the Windows OS, Microsoft made it easy for web developers to adopt Microsoft’s proprietary technologies and tools to create web applications that only adhere to Microsoft’s way of doing things.

To make things worst Microsoft’s browser Internet Explorer (IE) would interpret the non-standards compliant code for the developer, in effect placing the browser into a “quirky mode”. IE went as far as ignoring HTML mistakes within the code and presents what the developer had intended.

As a result creating sloppy web applications that are not W3C compliant, not future prove and worst of all lazy developers. The latter is not just my opinion, it is from years of observations of Windows based web developer code.

The most common situation I encounter is, when these Windows web developers write codes that test the userAgent of the DOM Navigator object, to determine the name of the browser; assuming brand of browser, and version number, to offer a logical decision on the usage of certain features. In worst case, these developers only test for the version number, making the Microsoft assumption that there are no other browser accept Microsoft’s Internet Explorer.

Not only does this totally goes against my principal of “Test for features instead of browsers”, which I impose upon any developers I manage. You can see that these Windows web developers’ approach is not future proof, as no one knows how many types of browsers there are to come, how many different platforms these browsers will be used in, and whether these browsers will introduce features in future versions of their browsers; this latter point includes IE. I won’t even get into the problem with just checking for the version number of the browser. My informed readers will know how stupid this can be.

This is another issue with the end-user not well informed enough, as a result not demanding enough of the product s/he uses, which further propagates the laziness of web developers. I will try to address the source of the issue by presenting the browser choices available:

**Windows OS**:

- [Firefox](http://www.getfirefox.com/ "Download Firefox")
- [Safari](http://www.apple.com/safari/ "Download Safari")
- [Opera](http://www.opera.com/download/ "Download Opera")
- [Flock](http://flock.com/ "Download Flock")

**Macintosh OS**:

- [Firefox](http://www.getfirefox.com/ "Download Firefox")
- [Safari](http://www.apple.com/safari/ "Download Safari")
- [Opera](http://www.opera.com/download/ "Download Opera")
- [Flock](http://flock.com/ "Download Flock")

**Linux OS**:

- [Firefox](http://www.getfirefox.com/ "Download Firefox")
- [Opera](http://www.opera.com/download/ "Download Opera")
- [Flock](http://flock.com/ "Download Flock")
- [KDE](http://www.kde.org/download/ "Download KDE")

All of the above browsers are W3C standards compliant.

As for Microsoft’s IE, after their admittance of their wrong approach in the past 10 years, they began by releasing a new version of IE that starts to comply to the W3C standards. Although, this compliance is at the tip of the iceberg compared to all the mature browsers mentioned above. This version of IE is IE7. Several months ago Microsoft released the beta version of IE8, which started to pass W3C and Web Standards Project’s “Acid 2 Test”. In the mean time the other browsers are already releasing version of their respective browsers that passes the “Acid 3 Test”.

Since IE is the only non-W3C complaint browser and Microsoft themselves are moving towards W3C compliancy, it is obvious that web developers should stop coding to IE standards. Any web page or web applications should first be tested on the compliant browsers then conditions should be placed in the code to make the web page display and behave properly within IE. NOT the other way around!
