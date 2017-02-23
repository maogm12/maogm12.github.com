---
layout: post
title: ScrollToFixed Navigation Bar for avalonjs
date: 2014-12-15 15:12
author: Gavin
category: blog
tags:
  - JavaScript
  - Code
  - AvalonJS
  - CSS
slug: avalon-fixed-floating-nav
---

做前端经常有做页面内导航条或者边栏的，一般有三点要求：

1. 滚动时固定在顶部
2. 点击导航项跳转到相应锚点
3. 在滚动到某个区域的时候高亮显示当前区域的导航项

这个东西用得还是挺多的，这里我把它封装成了一个 avalonjs 插件，
名字就叫 fixedfloatingnav 吧（名字一定要长长长长长长的 ==）。
1.0 的版本咱先简单点来哈，就做一个水平的飘在顶上的导航条。
接下来我们就一个问题一个问题的解决之。

ps: demo 页面在[->这里<-]({{ site.url }}/projects/fixedfloatingnav/example.html)

pps: 代码托管在 github 上，看[->这里<-](https://github.com/maogm12/avalon-fixed-floating-nav)

pps: avalonjs 插件编写指南请参考[->司徒正美的教程<-](http://www.cnblogs.com/rubylouvre/p/3573061.html)

## 实现细节

### 滚动时固定在顶部

这个功能其实也是当初实现这个插件初衷。

第一我们需要实现插件模板，就叫 fixedFloatingNav.html 吧，module 里面的 fixed 字段来确定导航条是否需要固定。这是最终的模板内容:

27日更新，支持部分自定义的样式

```html
<div class="fixed-floating-nav-panel"
     ms-css-height="panelHeight"
     ms-css-line-height="{{panelHeight}}px">
    <ul class="fixed-floating-nav-bar"
        ms-class="fixed-floating-nav-bar-fixed:fixed"
        ms-css-height="navBarHeight"
        ms-css-line-height="{{navBarHeight}}px"
        ms-css-top="navRelativeTop">
        <li class="fixed-floating-nav-item"
            ms-repeat="navItems"
            ms-click="scrollToAnchorId(el.anchor)"
            ms-class="fixed-floating-nav-item-last:$last"
            ms-css-height="navBarHeight"
            ms-css-line-height="{{navBarHeight}}px">
            <a ms-class="fixed-floating-nav-item-active:$index===activeIndex">{{el.label}}</a>
        </li>
    </ul>
</div>
```


如果这个导航条就在页面最顶部的话，我们可以直接用 css 来把导航条定在头部。

```scss
.fixed-floating-nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;	// 和 right 让宽度为 100%，居中导航条的项目
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 10;	// 飘在表面，欣越指出为了兼容早期浏览器，一般把 z-index 设置成整 10
                // 很多框架这么干的，等我测试一下
  background-color: white;	// 默认是透明的，你懂的
  box-shadow: 0 0 5px gray;	// 加个小阴影哈，好看点
}
```

但是如果这个条条初始位置偏偏在页面中间，要等它滚动碰到天花板后再飘在头部，那这个功能在当前用纯 css 是做不出来的，我们可以通过监听页面的 onscroll 来判断是否应该把导航条飘起来~

在 avalonjs 插件的 `$init` 方法里面我们绑定 window 对象的 `onscroll` 事件来检查对象是否碰到天花板了，然后更新 fixed 字段。

```javascript
...
// check scroll event to change nav bar
var checkScroll = function() {
    // check if nav should fixed to top
    var navBar = document.getElementsByClassName("fixed-floating-nav")[0];
    var rectNav = navBar.getBoundingClientRect();
    vmodel.fixed = rectNav.top < 0;
};

vm.$init = function() {
	...
	checkScroll = avalon.bind(window, "scroll", checkScroll);
	...
};
```

这里只取了 class 是 `fixed-floating-nav` 的第一个，页面里的导航一般只有一个，有更多的，自己想办法解决哈，1.0 就是这样。。。

### 跳转到相应锚点

这个功能一般来说简直不用实现，a 本来就可以定位锚点的嘛！

但是这里我做的是一个单页面应用，前端用了路由定位不同模块。如果用 a 标签自带的定位锚点的功能，location 就发生变化了，这个新的 url 是没有意义的。比如在 /index.html/foo 我要定位的 id 是 bar 的元素，直接跳转后 url 变成了 /index.html#bar，这个新 url 明显是打不开的，因为 bar 元素在 foo 模块里面，不在 index.html 里面。

那就自己跳转吧！模板里面的 scrollToAnchorId 就是干这事的！偷偷说这个函数是从司徒正美的 [mmRouter](https://github.com/RubyLouvre/mmRouter) 里面的 [mmHistory.js](https://github.com/RubyLouvre/mmRouter/blob/master/mmHistory.js) 中借鉴来的，哈哈

```javascript
//得到页面第一个符合条件的A标签
function getFirstAnchor(list) {
    for (var i = 0, el; el = list[i++]; ) {
        if (el.nodeName === "A") {
            return el
        }
    }
}

// scroll to view
vm.scrollToAnchorId = function(hash, el) {
    var navBar = document.getElementsByClassName("fixed-floating-nav")[0];
    el = document.getElementById(hash) || getFirstAnchor(document.getElementsByName(hash));

    if (navBar && el) {
        if (navBar.offsetTop > el.offsetTop) {
            el.scrollIntoView();
        } else {
            // window.scrollTo(0, el.offsetTop - 40);
            // 10.27 更新，支持自定义样式
            window.scrollTo(0, el.offsetTop - vmodel.navBarHeight);
        }
    } else {
        window.scrollTo(0, 0)
    }
};
```

有没有看到那个 `el.offsetTop -  vmodel.navBarHeight`，这个因为有导航条飘在上面，直接跳部分内容会被导航条挡住的。

### 高亮显示导航项

这个嘛，在滚动的时候判断锚点位置，给特定项目高亮就好了，在 `checkScroll` 中加上点东西:

10.27 更新，把获取元素搬到了 `onscroll` 事件外面，首先获取所有合法的锚点：

```javascript
// find out valid anchors
var findValidAnchors = function() {
    vmodel.validAnchorIds.splice(0);
    vmodel.validAnchorElems.splice(0);
    for (var i = 0; i < vmodel.navItems.length; ++i) {
        var hash = vmodel.navItems[i].anchor;
        if (!!hash) {
            var elem = document.getElementById(hash);
            if (elem && elem.getBoundingClientRect().height > 0) {
                vmodel.validAnchorIds.push(i);
                vmodel.validAnchorElems.push(elem);
            }
        }
    }
};

...

vm.$init = function() {
	...
	vmodel.navElem = element.getElementsByClassName("fixed-floating-nav-panel")[0];
	if (!vmodel.navElem) {
		throw new Error("找不到导航条");
	}
	findValidAnchors();
	...
}
```

然后判断的时候直接取存储下来的值


```javascript
var checkScroll = function() {
	...
    // change current active index
    var i, elem, activeSet = false;
    for (i = 0; i < vmodel.validAnchorElems.length; ++i) {
        elem = vmodel.validAnchorElems[i];
        if (elem.getBoundingClientRect().top > vmodel.navBarHeight) {
            vmodel.activeIndex = i === 0 ? 0 : vmodel.validAnchorIds[i - 1];
            activeSet = true;
            break;
        }
    }

    if (!activeSet) {
        vmodel.activeIndex = vmodel.validAnchorIds[i - 1];
    }
	...
}
```

### 其他

把插件的 `$init`, `$remove` 和默认配置贴出来，大家来抛砖

```javascript
...
vm.$init = function() {
    var pageHTML = options.template;
    element.style.display = "none";
    element.innerHTML = pageHTML;
    avalon.scan(element, [vmodel].concat(vmodels));
    element.style.display = "block";

    vmodel.navElem = element.getElementsByClassName("fixed-floating-nav-panel")[0];
    if (!vmodel.navElem) {
        throw new Error("找不到导航条");
    }
    findValidAnchors();

    checkScroll = avalon.bind(window, "scroll", checkScroll);

    if (typeof options.onInit === "function") {
        options.onInit.call(element, vmodel, options, vmodels);
    }
};
vm.$remove = function() {
    element.innerHTML = element.textContent = "";
    avalon.unbind(window, "scroll", checkScroll);
    vmodel.navElem = null;
    vmodel.validAnchorIds.splice(0);
    vmodel.validAnchorElems.splice(0);
};

...

widget.defaults = {
    navItems: [], //@param navItems navigation items
    onInit: avalon.noop, //@optMethod onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
    panelHeight: 110,
    navBarHeight: 40,
    offsetY: 30, // to the top of panel
    getTemplate: function(tmpl, opts) {
        return tmpl;
    }, //@optMethod getTemplate(tpl, opts, tplName) 定制修改模板接口
    $author: "maogm12@gmail.com"
}
```

12月15日更新

当前的导航栏是直接有 js 生成的，这样的话 js 未加载出来的时候导航栏是不可见的，
这样的情况在网络慢的时候就更加明显了，这就破坏了结构的完整

新的版本面直接在子节点里面找 `nav` 元素，然后解析出里面的 `a` 标签里面的内容，
生成导航栏的内容。

## 用法

用起来超级简单，在模型里面配置项目名字和要跳转的锚点 id 就 OK 了:

```javascript
{
    // ...
    fixedfloatingnav: {
        navItems: [
            {label: "项目一", anchor: "item1"},
            {label: "项目二", anchor: "item2"}
        ]
    },
    // ...
}
```

或者你是用 `bower` 的话

```bash
bower install avalon-fixed-floating-nav
```