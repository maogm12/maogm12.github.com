---
layout: post
title: Autolayout 中的百分比宽度
date: 2015-07-15 20:04
author: Gavin
category: blog
tags:
  - iOS
  - Autolayout
lang: zh
slug: percentage-width-in-autolayout
---

参考自这两篇博客 [http://simblestudios.com/blog/development/percentage-width-in-autolayout.html](http://simblestudios.com/blog/development/percentage-width-in-autolayout.html) 和 [http://simblestudios.com/blog/development/easier-percentage-width-in-autolayout.html](http://simblestudios.com/blog/development/easier-percentage-width-in-autolayout.html)

Storyboard 是开发的未来，最近刚刚上手 iOS 开发，直接用的 Storyboard，没有手动写布局，也没有单独写 xib 之类的。

自从 iPhone6 和 iPhone6 plus 出来之后，适配也成了 iOS 开发人员需要考虑的事了（前 Android 开发人员表示可以接受）。

现在开发中设计稿是按 iPhone5 出的，比如某个居中的图标，目前实现是在 Storyboard 里面指定了图片大小和高宽比，但是在 6 上运行的时候会不和谐，stackoverflow上[这个问题](http://stackoverflow.com/questions/26386950/proportional-layout-for-iphones-from-5-to-6-plus-with-size-classes)里面的一张图片特别形象的描述了这种情况:

![proportional layout](../images/iphone5-6.jpg)

有一种不完美的解决办法是把设置中的 Launch Screen File 删掉，这时在 iPhone6 上显示的会是放大版的 4" 屏，但是作为一个程序猿，怎么能忍受这么坑爹的解决方案的！

但是通过居中和指定图片大小得到的结果一定是上面的图片那样，有没有可能使用百分比来指定 constraint 呢，答案是必须可以啊！就是使用 constraint 的 multiplier。

如果使用 Storyboard 的话，这个问题超级简单，以一个居中的图标为例，首先将图标相对父容器添加 `Equal Width` 的 constraint，然后将它的 multiplier 设成比如0.3，这样就可以实现成比例的宽度，效果如下：

![proportional width](../images/proportional-width.png)

nice!

我还没有用过 xib，那里面没有 `Equal Width` 的依赖，实现起来麻烦一点，还是上面的例子，水平居中，宽度是父容器 30%：

1. 为元素设置 `Leading Space` 到父容器
2. 将这个 constraint 的 `Second Item` 设置为 `Center X`，这会将元素左边靠到父容器的中间

	![leading space 2nd item](../images/leading-space-2nd-item.png)

3. 再次用到 Multiplier，因为我们想让图标大小是30%，就是说左边在宽度的 0.35 处，也就是父容器一半的 0.7，设置 multiplier 为 0.7
4. 设置图片的 `Tailing Space` 到父容器，注意 multiplier 是加到 `Second Item` 上的，所以我们需要对调两个元素，选中 `Reverse First And Second Item` 之后把 `Second Item` 设成 `Superviwe.Center X`

	![tailing space 2nd item](../images/tailing-space-2nd-item.png)

5. 设置 multipier 为 1.3 将图片右边靠到父容器的 0.65 处（0.65 - 0.35 = 0.3）

效果如下：

![proportional-width-xib.png](../images/proportional-width-xib.png)

----------------------- 我是分割线 ---------------------

2015-03-15 更新：
我在 Github 上更新了一个 [demo](https://github.com/maogm12/AutolayoutPercentageWidthDemo)，里面有这两种使用方法。

2015-07-15 更新：
有人邮件问我如何实现两个并排的 view，然后让他们之间的空隙也等比放大和缩小。

其实这个东西可以对两个 view 都按照文中的方法，分别相对于 `Center X` 设置左边界和右边界，
当两个 view 的边界相对于 `Center X` 变化时，他们之间的间距也会等比变化的。

举个例子(github 上的 repo 也更新了，可以对照看)，有并排的 view1 和 view2。
我们想实现两个 view 各自是整体宽度的 30%，然后之间相隔整体宽度的 10%，整体居中，效果如下：

![proportional-2views.png](../images/proportional-2views.png)

我们单看设置左边的 view：

在 **Storyboard** 中我们对于 view1 (左边那个)，设置 constraints 如下：

1. 相对于父容器设置 Proportional Width 为 0.3
2. 相对于父容器 `Center X` 设置 Leading 为 0.3（一半的 0.3，就是总体的 0.15，即离左边距 15%）
3. 设置长宽比，让高度也响应的变化

在 **xib** 中同样复杂一点点，因为这里面不能直接相对于父容器宽度等比设置宽度

1. 相对于父容器 `Center X` 设置 Leading 为 0.3
2. 相对于父容器 `Center X` 设置 Tailing 为 0.9 (这样宽度就是一半的  0.6 (0.9 - 0.3)，就是整体的 0.3)
3. 高宽比

其实关键问题就是相对于父容器 `Center X` 设置 Leading/Tailing 约束，因为 `Center X` 是整体宽度的一半，
这样间接就实现了相对于父容器的等比例宽度设置。

----------------------- 我是分割线 ---------------------

赞！！！

如此黑科技，今天才知道，看来鄙人的 iOS 成长之路还很漫长啊