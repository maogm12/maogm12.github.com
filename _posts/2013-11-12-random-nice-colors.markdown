---
layout: post
title: 随机生成好看的颜色
date: 2013-11-12 10:07
author: Gavin
category: blog
tags:
  - Color
  - HSL
  - HSV
  - Python
slug: random-nice-colors
---

在做[identicons]({filename}../projects/identicons/identicons.markdown)的时候，
需要为图标设置颜色，一开始做的时候就想着随机生成一种颜色，这还不简单，分分钟搞定：

```python
def rand_rgb():
    '''Generate a random rgb color.'''
    return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
```

RGB颜色模型是一种加色模型，它将红（Red）、绿（Green）、蓝（Blue）三原色的色光
以不同的比例相加，以产生多种多样的色光。这个对机器来说比较方便，不过随机生成出
来的颜色不可避免会生成一些特别鲜艳刺眼或者特别黯淡的颜色，效果不佳。

我使用PIL库来生成了一个使用随机rgb颜色的示例图片：

![random rgb color]({{ site.url }}/images/rand_rgb.png)

其中就有一些这样的坏色块，剔除这些不想要的颜色在代码上判断就比较麻烦了，于是在
搜索一番之后发现使用HSL颜色空间会好一些，HSL指色相、饱和度、亮度，哪些黯淡鲜艳
的不就是饱和度太低或太高么，那么在HSL颜色空间里随机应该会得到比较好的效果。在随
机的时候我们把饱和度过高或者过低的部分，亮度太大太小会导致图片颜色太深或太浅，
我们也去掉这部分的颜色。在色调交界的地方颜色特别纯，我们也去掉吧～

看看例子：

```python
def rand_hsl():
    '''Generate a random hsl color.'''
    h = random.uniform(0.02, 0.31) + random.choice([0, 1/3.0,2/3.0])
    l = random.uniform(0.3, 0.8)
    s = random.uniform(0.3, 0.8)

    rgb = colorsys.hls_to_rgb(h, l, s)
    return (int(rgb[0]*256), int(rgb[1]*256), int(rgb[2]*256))
```

Python的PIL不支持HSL，需要colorsys包里面的hls_to_rgb进行转换。看看生成的图片：

![random hsl color]({{ site.url }}/images/rand_hsl.png)

可以看到生成的颜色还是比较好看的，这个随机函数里面的参数可以根据需要载自己调整。

[这里](http://cdc.tencent.com/?p=3760)有一篇文章介绍HSL颜色空间的。