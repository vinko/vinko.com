---
title: "MMS With iPhone 3.0 On iPhone 3G [Updated]"
description: "When I the create the post, To iPhone 3G S or Not?, I was not able to enable the MMS function on my iPhone 3G."
pubDate: 2009-06-15
---

![iPhone 3G With 3.0](/wp-content/uploads/2009/06/iphone3g30.jpg)When I the create the post, *[To iPhone 3G S or Not?](http://blog.vinko.com/2009/06/12/to-iphone-3g-s-or-not/ "To iPhone 3G S or Not? post")*, I was not able to enable the MMS function on my iPhone 3G.

Before I explain how to enable MMS on an iPhone 3G running the iPhone 3.0 firmware, let me explain my context.

My iPhone 3G is the officially “SIM unlocked” version of the iPhone 3G directly from Apple Online Store Hong Kong. It capacity happens to be a 16GB version. I installed the iPhone 3.0 firmware “Golden Master” version onto my iPhone.

The following applies to any carrier situations, no matter whether the carrier in question is an official carrier partner with Apple in the country.

**[Update: 12:10, June 18, 2009]**  
Added MMS settings for PCCW. Please note that these settings had not been tested on the iPhone. Please leave a note in the Comment section if you’re a PCCW customer and tried it on your iPhone 3G.

**[Update: 13:01, June 18, 2009]**  
Thanks to reader Jon for pointing out the typo in the MMSC for Smartone-Vodafone.

**[Update: 14:01, June 18, 2009]**  
I just received some news from Smartone-Vodafone that contradicts the information I received from them in two separate occasions, which is the fact that they do not charge their customers for receiving MMS.

The latest information is that they will charge HKD0.04/KB; a maximum of HKD12.00/MMS, to receive MMS.

This comes back to my original point I always had with MMS, the technology will not get wide adoptions and acceptances by consumers until the carriers remove these ridiculous pricing.

I for one will not use it!

I encourage all to not use it and ensure you do not pay the fees to show our disgust.

**[Update: 17:11, June 18, 2009]**  
Thanks to reader Karay who pointed to a person calling himself “markmall_hk” on UWants.com, I have now updated the MMS settings for all mobile carriers in Hong Kong.

**[Update: 01:10, June 20, 2009]**  
Added settings for CTM in Macau.

**[Update: 01:20, June 20, 2009]**  
Thanks to reader Niels for the China Unicom 3G settings in mainland China.

**[Update: 01:30, June 20, 2009]**  
Thanks to reader Ju for confirming the settings for PEOPLE.

**[Update: 15:10, June 20, 2009]**  
Thanks to reader Todd for confirming the settings for CSL

**[Update: 22:00, June 23, 2009]**  
Thanks to the folks at [iPhoneHacks.com](http://www.iphonehacks.com "iPhoneHacks.com web site") we now have [a set of instructions](http://www.iphonehacks.com/2009/06/hack-to-enable-mms-on-iphone-os-30.html "Enabling MMS on AT&T instructions") for our US friends who are stuck with AT&T.

**[Update: 12:15, June 24, 2009]**  
Thanks to reader Filipe for supplying the settings for CTM Macau non-prepaid SIM card customers.

**[Update: 16:00, June 25, 2009]**  
I just double checked [Smartone-Vodafone’s web site](http://www.smartone-vodafone.com/jsp/mobile/prices/messaging_price_plan/english/charges3.jsp) and it clearly states that “3G SmarTone-Vodafone customers” can receive MMS for FREE.

So I do not understand why the previous Customer Service representative claims that I have to pay the HKD0.04/KB when I clearly told her that I was on a 3G plan, plus she had my account opened in front of her.

**[Update: 12:00, June 26, 2009]**  
Added the instructions to enable to the “Cellular Data Network” option within the Network settings pane.

### How to Enable MMS on iPhone 3.0

1. Ensure you have a 3G plan with your mobile carrier. A data plan is not necessary with regards to MMS.
2. Ensure the carrier had not blocked the MMS function from your account. In Hong Kong most carriers would not do so, unless you request them to do so.
3. On your iPhone go to the Settings -> General -> Network -> Cellular Data Network settings and input the MMS settings specific for your carrier. *The exact values for each of the fields will depends on your carrier. Do not worry if your carrier representative tells you that they do not support the iPhone. Be assertive and obtain the MMS settings: APN, Username, Password and MMSC. Most carriers would not have a Username or Password.*

   If you do not see the “Cellular Data Network” option within the Settings -> General -> Network settings you can do one of the following depending on which OS you’re on.

   | Operating System | Steps |
   | --- | --- |
   | OS X | 1. Close iTunes. 2. Start the Terminal (found in the /Applications/Utilities folder). 3. Execute the command: defaults write com.apple.iTunes carrier-testing -bool TRUE |
   | Windows 32-bit | 1. Close iTunes. 2. Go to Start then Run and type CMD. 3. Execute the command: “C:Program FilesiTunesiTunes.exe” /setPrefInt carrier-testing 1 |
   | Windows 64-bit | 1. Close iTunes. 2. Go to Start then Run and type CMD. 3. Execute the command: “C:Program Files (x86)iTunesiTunes.exe” /setPrefInt carrier-testing 1 |

   The following are the settings. Note that the APN is case sensitive.

   | Carrier | Settings |
   | --- | --- |
   | Smartone-Vodafone | APN = smartone-vodafone  MMSC = http://mms.smartone-vodafone.com/server  MMS Proxy = 10.9.9.9 |
   | PCCW 3G | APN = pccw  MMSC = http://3gmms.pccwmobile.com:8080/was  MMS Proxy = 10.140.14.10:8080 |
   | PCCW 2G | APN = pccwmms  MMSC = http://mmsc.mms.pccwmobile.com:8002  MMS Proxy = 10.131.2.8:8080 |
   | 3 HK | APN = mobile.three.com.hk  MMSC = http://172.20.99.240:10021/mmsc  Username = 3  Password = 1234  MMS Proxy = 172.020.097.116:8799 |
   | CSL | APN = hkcsl  MMSC = http://192.168.58.171:8002  MMS Proxy = 192.168.59.51:8080 |
   | New World | APN = mms  MMSC = http://mmsc.nwmobility.com:8002  MMS Proxy = 192.168.111.1 |
   | Peoples | APN = peoples.mms  MMSC = http://mms.peoples.com.hk/mms  MMS Proxy = 172.031.031.036:8080 |
   | CTM Macau | APN = ctmprepaid  MMSC = http://mms.wap.ctm.net:8002  MMS Proxy = 192.168.99.3:8080 |
   | CTM Macau  (non-prepaid SIM) | APN = ctmmms  MMSC = http://mms.wap.ctm.net:8002  MMS Proxy = 192.168.99.3:8080  MMS Max Message Size = 307200 |
   | China Unicom 3G (China) | APN = uniwap  MMSC = http://mmsc.myuni.com.cn  MMS Proxy = 10.0.0.172 |

   - *The “MMS Max Message Size” settings is optional but Smartone-Vodafone has a size limit of 307200 (300KB) where they charge HKD3.00/MMS.*
   - *For the PCCW settings you may want to try it first without the MMS Proxy settings.*
4. After these information are entered, you will need to restart your iPhone. Hold the Power button until the slider comes up asking you to slide to the right to shutdown the iPhone. Go ahead and shutdown your iPhone and then restart it.
5. When the iPhone had restarted, on your iPhone go to the Settings -> Messages settings and ensure MMS is turned on. You can optionally turn on “Show Subject Field” if you like.

You should see an extra Camera icon when you compose a message in the Messages (previously known as “SMS”) application.

In the Photo album application you will see an extra option to share your photo via MMS.

Please feel free to leave settings for your respective carriers in the comments and I will update the table above.
