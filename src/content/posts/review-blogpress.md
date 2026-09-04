---
title: "Review: BlogPress for iPad, iPhone and iPod Touch [Updated]"
description: "[](<http://blog.vinko.com/link/blogpress/>)If you are a blogger you are most likely using a blogging platform to host your blog. These blogging platforms will c"
pubDate: 2011-01-08
---

[![](https://www.vinko.com/wp-content/uploads/2010/09/blogpress-logo.png)](<http://blog.vinko.com/link/blogpress/>)If you are a blogger you are most likely using a blogging platform to host your blog. These blogging platforms will come with web based interfaces for users to compose blog posts. When these web based interfaces are accessed from a browser on the computer this works well, but may not be the case from mobile devices like the iPod Touch, iPhone or iPad. Of course there are exceptions, which I will discuss later.

It is hard to find an app that takes advantage of the capabilities of these mobile devices while supports the functionalities of the blogging platforms. There are two blogging platform specific apps for the iOS devices: WordPress and SquareSpace. The former is the first of its kind and its functionalities are fairly complete, but there are bugs that will sometimes cause the lost of blog posts. The latest version (2.6.3) is even worst, so this is not an app that I will recommend. On the other hand the offering from SquareSpace is very well designed. It has set the standards for all blogging apps in the iTunes App Store.

Then there are blogging apps that support multiple platforms, like [BlogPress](<http://blog.vinko.com/link/blogpress/>). It supports the following blogging platform/services:

  * Blogger
  * MSN Live Spaces
  * WordPress
  * Movable Type
  * TypePad
  * LiveJournal
  * Drupal
  * Joomla
  * Tumblr
  * Squarespace

Since my blog is hosted with a WordPress backend I will only be discuss the functionality of BlogPress with a WordPress blog.

Due to BlogPress’ multi-platform support the author tells me that the app cannot support all the functionalities of a WordPress blog. Even though this may be a good reason, this app has some work to do to get the functionalities that it does support more elegant.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_0015.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_0015.jpg>)One example, is BlogPress’ terminology and concept of “drafts”. ~~There needs to be a distinction between “local draft” and “server draft” (draft stored on the server, not yet published and marked as “Draft” on the WordPress platform)~~. This has been improved in the latest version of the app.

When the user click on the Save button to save a post, a dialog is presented with a daunting 6 options:

  * Publish Now!
  * Save and Preview
  * Save Local Draft
  * Save Online Draft
  * Save & Create New
  * Discard

It is a bit strange to see “Discard” being one of the options for a “Save” action.

~~Unfortunately, the “Publish Now!” options are not exactly what they mean. If you click on “Publish Now!” it doesn’t always means that the post in questions will be published on the web site managed by WordPress. This depends on the settings in the post’s options~~. Fortunately the “Publish Now!” option has been changed in the latest version of the app to always mean “publish the post, making it live on the site”.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_0016.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_0016.jpg>)Within this options window there is a “Publish or save draft online” section, where you can toggle the “Publish” flag to “On” or “Off”. Again this is not too clear, but “On” means “Publish” the post to the web site, making the post “live”. The setting in the “Off” position means to only “save as Draft online” within the WordPress system. ~~The behaviour after choosing “Publish Now!” from the Save dialog will depends on this flag~~. In the latest version of the app this option no longer has an effect, which is a good thing. I think the developer just forgot to remove it.

For new users who are familiar with WordPress, they will most likely avoid the “Publish Now!” button at least not until they are really ready to publish their post live onto their web site. Fortunately BlogPress has coloured this button red to warn users from clicking on it accidentally. I would have place this as the last item in the option window.

When writing a post the author will want to save constantly, because they worry that the revisions will be lost during the creation process. It is natural to want these revisions to be saved back on the server, for WordPress users automatically saving revisions while composing a post is the default behaviour within the WordPress backend.

Having said that, I believe users like me will prefer to click the ~~“Save Draft Only” from the Save dialog. Choosing this option will save the post, and the app will move the post to a section called “Drafts”. It is not until the user goes back to their WordPress platform to realize none of the revisions are saved within WordPress. What happened is that BlogPress only saved the revisions locally within its app and never transferred to the user’s WordPress platform~~. “Save Online Draft” which causes the revision to be saved on the server rather than locally on the iPad. This is because in most cases the iPad is not where a user will finish a post therefore they will want to have their post in progress available anywhere they may edit the post, including back on the WordPress backend.

While this Save function is a UX design issue and less of a bug. There are some quirkiness in the app that can drive a user crazy.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_0019.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_0019.jpg>)After saving a post the app will leave a blank space at the top of the post pane for no apparent reason.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_0020.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_0020.jpg>)Another bug is the app’s inability to autoscroll when the text reach below the current visible line of text.

This caret scrolling issue becomes most annoying when the user clicks on a spot within the post to enter the Edit mode. User expects the app to scroll the text so the spot where he clicks and where the caret is placed should be visible.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_00221.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_00221.jpg>)Aside from these clunkiness the app does have some niceties. One such example is its Insert HTML feature, which allows quick template insertion of some of the more common HTML used within a post.

[![](https://www.vinko.com/wp-content/uploads/2010/12/img_0021.jpg)](<https://www.vinko.com/wp-content/uploads/2010/12/img_0021.jpg>)The app also allows the user to insert images from the device’s Photo Album. This has been greatly improved in the latest version on the iPad. Although it is still not too intuitive as the image inserted only serves as a placeholder. Any adjustments to the size and alignments are not reflected on the post until it is published to the server.

[![](https://www.vinko.com/wp-content/uploads/2011/01/blogpress-insert-images.jpg)](<https://www.vinko.com/wp-content/uploads/2011/01/blogpress-insert-images.jpg>)Since BlogPress does not really have a WYSIWYG mode, only images inserted using BlogPress can be seen, any other images inserted using other means the user can only see their respective HTML codes like the rest of the post.

This behaviour is very confusing, since most WordPress users using BlogPress will assume they are looking at the HTML version of their post, except for the few elements that are added using BlogPress. To make it even more of an issue is that images inserted using BlogPress do not follow the standard WordPress CSS styling so any HTML attributes added to the image are not compatible to the CSS styling by the theme used for the blog.

> border=’0′ width=’250′ height=’166′ align=’left’ style=’margin:5px’

The CSS and IMG attributes applied by BlogPress when inserting an image to the post.

> width=’250′ class=’alignleft size-full wp-image-7310′

The CSS and IMG attributes would have applied by WordPress if using the WordPress backend.

#### Conclusion

Given the state of BlogPress I do not recommend WordPress users to use it to edit or create new post for their blogs. This is disappointing as the WordPress iOS app is not reliable to trust it either.

Having said that, I do see improvements made by the developer of BlogPress between versions; as explained above. Therefore if you like to support the developer, so we may eventually have a great native app for managing your WordPress blog, you may want to pay the USD4.99 (on Sale right now for USD2.99) that the developer is asking for in the [iTunes App Store](<http://blog.vinko.com/link/blogpress/>).
