---
layout: post
title: discuz模板中避免 & 转义
date: 2015-02-28 17:00
author: Gavin
category: blog
tags:
  - discuz
  - PHP
  - code
slug: void-transamp-in-discuz-template
---

最近业余地看了一下 discuz 的插件，有个问题一直纠结着我，今天把它彻底解决了。

问题就是在用 discuz 模板的时候，解析引擎会把 `&` 转义成 `&amp;`，这样一些写在模板里的链接都不能正常访问了。这个问题出现了一阵了，一直没来得及刨根究底地去看这个 bug。

解决问题并不难，我们只要看看模板引擎源码里面怎么处理 `&` 就行了，源码在 `source` > `class` > `class_template.php` 里面，在 `parse_template` 函数里面可以发现处理 `&` 的地方在

```php
$template = preg_replace("/\"(http)?[\w\.\/:]+\?[^\"]+?&[^\"]+?\"/e", "\$this->transamp('\\0')", $template);
```

其中 `transamp` 实现如下

```php
function transamp($str) {
    $str = str_replace('&', '&amp;', $str);
    $str = str_replace('&amp;amp;', '&amp;', $str);
    $str = str_replace('\"', '"', $str);
    return $str;
}
```

可以看到这里处理的是链接里面 `&` 符号，并且是由双引号 `"` 包裹起来的链接，不过某个字符串如果不幸也是由 `?` 隔开的话，也会被“误”处理，这样的话，想 hack 这个 bug，最简单方法就是用单引号包裹不想转义的链接。