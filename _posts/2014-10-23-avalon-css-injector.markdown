---
layout: post
title: avalon.cssInjector.js
date: 2014-10-23 17:26
author: Guangming Mao
category: blog
tags:
  - JavaScript
  - Code
  - AvalonJS
  - CSS
slug: avalon-css-injector
---

	Avalon 大法好
		——马云

时值 1024 程序猿节，普天同庆，大快所有人的心，写篇博客吧 →_→

这次用 avalon 做前端的时候，激进地使用了单页面的模式，并且把各个模块的 html/js/css 都放在了各个模块目录下面，然后在 JS 里面用 requirejs 加载模板和 css 文件，这样感觉拓展性比较好，萌萌哒啊！不过发现有些页面跳转时样式乱了，因为 requirejs 里面的 css 插件把加载的样式一股脑儿加到了 head 里面，这样多跳转几次，head 里面就加载了好多好多 css 文件。所以模块一多，重名的地方就乱了，原谅我 css 功力不够。。。

要是能动态加载 css 文件就好了，并且在这种单页面应用中，页面跳转清除动态加载的 css 文件，这样样式就不乱了。恩，还真有，找到了一个 angularjs 的服务叫 [angular-css-injector](https://github.com/Yappli/angular-css-injector)，其实就是在 head 操作 一些 link 标签。于是就有了这个 avalon-css-injector (太山寨了 →_→)，看 [github 地址](https://github.com/maogm12/avalon-css-injector)。

动态加载还是好做，avalon 里面有 `ms-repeat`，建个 module：

```javascript
scope = avalon.define({
    $id: "avalon_css_injector",
    injectedStylesheets: []
});
```

然后在 head 里面插入关键性的 link 标签：

```html
<link type="text/css" rel="stylesheet" ms-repeat="injectedStylesheets" ms-href="el.href" />
```

```javascript
var docHead = document.getElementsByTagName('head')[0];
var rawLink = document.createElement('link');
rawLink.setAttribute('ms-repeat', 'injectedStylesheets');
rawLink.setAttribute('type', 'text/css');
rawLink.setAttribute('rel', 'stylesheet');
rawLink.setAttribute('ms-href', 'el.href');
docHead.appendChild(rawLink);
avalon.scan(docHead, scope);
```

然后借助 avalon 的双向绑定，对 `scope` 里面的 `injectedStylesheets` 进行操作就行了。

使用起来很简单，符合 AMD 规范，直接用 requirejs 可以导入：

在想加载 CSS 的地方使用加载

```javascript
avalon.cssInjector.add("/path/to/your/css/file.css");
```

移除某个加载过的 CSS 文件

```javascript
avalon.cssInjector.remove("/path/to/your/css/file.css");
```

移除所有动态加载的 CSS 文件

```javascript
avalon.cssInjector.removeAll();
```

暂时有两个问题：

首先是单页面应用中，往往希望把其他模块动态加载的 css 卸载掉，即在 location 变化时清空前面模块动态加载的 css 文件。在 [angular-css-injector](https://github.com/Yappli/angular-css-injector) 中作者使用了 angularjs 的 `locationChangeStart` 事件。

```javascript
// Capture the event `locationChangeStart` when the url change.
// If singlePageMode===TRUE, call the function `removeAll`
$rootScope.$on('$locationChangeStart', function()
{
    if(singlePageMode === true)
        removeAll();
});
```

但是 avalon 在 location 改变的时候没有提供回调函数接口，想借鉴 mmHistory.js 里面的做法，但是总感觉代码没有重用不好，暂时没什么优雅的方法。所以目前做法是在各自的模块里手动调用 `removeAll` 方法。

第二，在各个模块里动态加载 css 时，使用的是相对最终生成的文件的路径，这里就是单页应用的入口 index.html，所以可能是这样的

```javascript
avalon.cssInjector.add("./modules/foo/bar.css")
```

这样和写绝对路径也没什么不同了，如果能像 requirejs 里面直接写当前文件的相对路径就好了：

```javascript
define(["avalon",
    "text!./bar.html",
    "css!./bar.css"
], function(avalon, template) {
   	//blahblahblah
   	//...
});
```

慢慢来改吧