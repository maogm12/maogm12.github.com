---
layout: post
title: 野生湾区日报
date: 2015-07-21 22:29
author: Guangming Mao
category: blog
tags:
  - Android
slug: wanquribao-android
---

> 有句话说，怎么鉴定一个程序猿是不是真正的程序猿？就看他有没有给做过东西给自己用过。

![首页大图](../images/wanquribao/big.jpg)

前段时间[湾区日报](http://wanqu.co/)贴了一篇文章说[两天四夜上线了一个 App](https://medium.com/@wanquribao/%E4%B8%A4%E5%A4%A9%E5%9B%9B%E5%A4%9C%E4%B8%8A%E7%BA%BF%E4%B8%80%E4%B8%AA-ios-app-fde9d1e4542e)，很有触动，日报哥很有毅力，一己之力维护了整个湾区日报，现在又由于自己的兴趣，搞了一个 App。感觉自己虽然还在学校，相对来说比较闲，但是也没有什么产出。

当时就有心去写一个 Android 客户端，建了项目没开工。直到上周五，心血来潮就开工了，用了一个周末多的时间写了一个基本的 Android 版，功能不多，但是足够每天看看日报了。用了日报哥的 API，昨天取得日报哥的同意后，昨晚上又重构了一些东西，然后今晚上线了。

唯一的体验就是，好久没碰 Android 了，列表都不知道怎么写了。好吧，不过好歹也是上线了，[点这里下载](https://play.google.com/store/apps/details?id=com.maogm.wanquribao)。

代码都在 GitHub 上了，[戳这里](https://github.com/maogm12/WanquRibao) 去点 Star 吧 (不要脸地跪求ing)。我只有一个 Huawei Honor 3C，测试不是很充分，有 bug 可以去提 issue。

## 为什么做 Android 客户端呢？

1. 填坑，造福大众……
2. 我有一个 Android 手机。

## 功能

基本功能和 iOS 版本一样，虽然是野生版本的……

1. 查看最新一期的日报
2. 查看往期文章，因为 API 限制，我只能看到最近 20 期的
3. 随机一篇文章
4. “易读”功能，跪谢日报哥 API，Orz……
5. 增加了离线存储，看过的日报都会在手机上，没有网也可以看

看看截图吧。

![latest](../images/wanquribao/5_latest.png)

得益于 Android 自己有分享功能，如果安装了微信，微博都会在系统分享接口里面出现，所以不用单独去向微信，微博申请接口了。

现在功能弱得一逼，安装包只有 700k，我都不好意思拿出去说……

后面想加进去的功能，推送，访问统计，Crash 日志收集，加些小动画什么的。

## 为毛这么丑

这个，能力有限，慢慢迭代吧~

以后有机会想写一个教程，看这个 App 是怎么一步步写出来的，然后持续加一些功能进去，找完工作后吧。

## 图标为毛这么丑（这图标什么鬼……）

不会作图，又没有找到金门大桥的免费的好图标，于是我自己用触摸板画了一个……用妹纸的话说就是只剩下，就是只剩下神韵了。不过给妹纸看居然被认出来是金门大桥了，OK，enough。

你说首页那个图么，我用 Keynote 导入图片，加了个阴影，贴了句话……这里要谢谢[dribbble上这个图片](https://dribbble.com/shots/1401364-golden-gate-bridge)。

## 版本号

版本号抄了日报哥的方法，用日期做版本号

最后再贴一下 Google Play 的地址吧：<https://play.google.com/store/apps/details?id=com.maogm.wanquribao>

有时间再在国内众多应用市场上……