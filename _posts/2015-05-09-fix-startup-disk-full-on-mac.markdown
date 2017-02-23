---
layout: post
title: Fix the 'startup disk full' on Mac
date: 2015-05-09 23:46
author: Gavin
category: blog
tags:
  - Mac
slug: fix-startup-disk-full-on-mac
---

> To make it short
> Clean `~/Library/Cache` and `~/Library/Developer/***`

Today, I meet the "startup disk full" again. OK, a 128G disk is really small :( Finally, I get 13GB back.

I met that before, I exported all my photos in my iPad to my Mac that time, and it took at least 14G space. I deleted some movies and moved all the photos to my mobile disk.

Well, I have no idea this time, I have no movies and no  bunch of photos on my Mac, why the space keep decreasing.

I need to figure out the little thorn in my flesh!

I started from `~`, it takes 64GB of my space, half of my tiny disk. Let help it to lose some weight.

I checked the directory size one by one, new skill got when I did that.

> Show invisible files in Finder

> 1. `defaults write com.apple.finder AppleShowAllFiles -bool true`
> 2. Log out and in again or `killall Finder`

> When you want to hide the invisible files, use this
> `defaults write com.apple.finder AppleShowAllFiles -bool false`

I found that `~/Library` took 30+GB of my space, the little bastard must be in there

I follow into `~/Library` and I found that `~/Library/Cache` took 10+GB and `~/Library/Developer` took 20+GB!!!

the cache directory seems to be safe to delete. New tips:

> `du -s * | sort -n`

> Sort the filename by size, help to find the biggest cache

And there are cache of Xcode in `Developer` too, there is a `DerivedData` in `Developer/Xcode` keeping codes of previous iOS projects, it's safe to delete and will release many GBs space.

And there is a `iOS DeviceSupport`, from [this post](http://stackoverflow.com/questions/13334417/can-i-delete-duplicates-6-0-ios-devicesupport)

> It is safe to delete the versions you are not supporting and will not get crash reports from the field.

Clear some old stuff will release many GBs too!!!

Finally I got 13+GB back.
