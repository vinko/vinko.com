---
title: "How-to Enable the APN Settings on iPhone"
description: "Ever since iPhone firmware 2.x Apple had allowed the carriers to disable the ability to edit the APN settings on the iPhone."
pubDate: 2000-07-23
---

Ever since iPhone firmware 2.x Apple had allowed the carriers to disable the ability to edit the APN settings on the iPhone.

Fortunately, there is a way around this issue. The are perfectly justified reasons for any iPhone users wanting to change the APN settings. One reason, is to enable data service at a foreign country with a local SIM card.

There are two different methods of accomplishing this. One is for iPhone that are factory SIM-unlocked (ie. iPhones from Australia, Belgium, Canada [iPhone 4], France, Hong Kong and UK [iPhone 4]), the other is for iPhone that had been jailbroken or unlocked using one of the many 3rd party hacks available.

#### iPhone that are factory SIM-unlocked

1. Download the [iPhone Configuration Utility](http://www.apple.com/support/iphone/enterprise/).
2. Create a new Configuration Profile by clicking on the New button in the Toolbar.
3. In the General tab enter the required profile Name and Identifier (ie. “com.vinko.profile”).
4. Go to the Advanced tab click on the Configure button to enter the edit pane.
5. Enter the APN information for the carrier in question.
6. Click the Share button in the Toolbar to send the configuration file to an email address that you can receive on your iPhone.
7. Open the email on your iPhone, double click on the attached configuration file and follow the instructions to install it. Trust and/or Allow if it ask you about the configuration file.

#### iPhone that are jailbroken or unlocked using 3rd party hacks

1. SSH to your phone
2. Edit the carrier.plist file in /System/Library/Carrier Bundles/. In my case “SmarTone_hk.Bundles”. Add the following snippet  
   > <key>AllowEDGEEditing</key>  
   > <true/>

   right after the code block

   > <?xml version=”1.0″ encoding=”UTF-8″?>
   >
   > <!DOCTYPE plist PUBLIC “-//Apple Computer//DTD PLIST 1.0//EN” “http://www.apple.com/DTDs/PropertyList-1.0.dtd”>
   >
   > <plist version=”1.0″>
   >
   > <dict>

After you made the necessary APN changes. You should be able to access the Cellular Data Network settings within Settings → General → Network → Cellular Data Network

If you do not see this settings in Network you may have to restart your iPhone.

For APN settings in Hong Kong please see my post, *[MMS With iPhone 3.0 On iPhone 3G](http://blog.vinko.com/2009/06/15/mms-with-iphone-30-on-iphone-3g/)*.
