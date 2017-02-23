---
layout: post
title: Avalonjs 类名切换源码阅读（一）
date: 2014-10-14 20:59
author: Gavin
category: blog
tags:
  - JavaScript
  - Code
  - AvalonJS
slug: avalon-ms-class-code-1
---

最近在做一些前端的工作，用到了国产强大的 `MVVM` 框架 [avalon](https://github.com/RubyLouvre/avalon)，不过刚刚兴起，文档大部分是框架作者[司徒正美](http://weibo.com/jslouvre)发的教程，包括[前端乱炖](http://www.html-js.com/article/column/234)，[博客园](http://www.cnblogs.com/rubylouvre/tag/avalon/)等，都是差不多的那一份，比起 [AngularJS](https://angularjs.org/) 的文档那不是少一点啊（谁让人家的干爹是谷歌呢。。。）

既然选择了这么一个陌生有文档匮乏的框架，很多东西就得自己去探究了，不过还好 avalon 在发展过程中借鉴了很多现有的 `MVVM` 框架，有些问题倒是可以直接借鉴其他框架的问题解决方案。

今天在做导航栏时使用了 `avalon` 提供的[样式处理](http://rubylouvre.github.io/mvvm/avalon.class.html)来根据当前所处模块高亮对应的导航栏项目，使用倒了其中的 `ms-class`，它可以根据 `module` 的值为元素添加样式，比如 `ms-class="main:add"` 而 `vm.add = true`，那么就为此元素添加上 `main` 这个类名。

根据[这个页面](http://rubylouvre.github.io/mvvm/avalon.class.html)，`ms-class` 后冒号后面可以是 `true` 和 `false`，也可以是 `1+2` 这种表达式（表达式也可以转布尔值嘛）。具体到导航栏这个场景，如下：

```html
<nav>
    <a href="#">Home</a>
    <a href="#">Blog</a>
    <a href="#">About</a>
</nav>
```

我希望在当前这个模块时，具体的导航项变色，即给他加上个类，比如：

```css
.active {
    color: #900b09
}
```

最好当前模块有个名字 `module`，可选项是 `home`, `blog`, `about` 让后在每个导航项中使用如下的方法检测，给相应的模块加上 `active` 类：

```html
<a href="#" ms-class="active:module=='home'">Home</a>
```

原文教程里面没有直接说这样可以不，试一试就知道了嘛，其实也就是这么写，就是说冒号后面可以接这样的表达式。那么我的问题来了？挖掘机技术...咳咳，这后面到底可以支持一些什么样的表达式呢？文档里面没有说清楚，那么其实说这么多，我就是想引出我们来看看源码怎么实现的吧 →_→，用了这么一段时间了，一直对 `avalon` 的编译系统很感兴趣呢，今天开个小头吧。

ps: 感谢 `chrome` 给我这么好的 `js` 调试功能

搜一下大致就能搜出对 `ms-class` 做处理的代码部分：

```javascript
//根据VM的属性值或表达式的值切换类名，ms-class="xxx yyy zzz:flag"
//http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
"class": function(data, vmodels) {
    var oldStyle = data.param,
            text = data.value,
            rightExpr
    data.handlerName = "class"
    if (!oldStyle || isFinite(oldStyle)) {
        data.param = "" //去掉数字
        var noExpr = text.replace(rexprg, function(a) {
            return Math.pow(10, a.length - 1) //将插值表达式插入10的N-1次方来占位
        })
        var colonIndex = noExpr.indexOf(":") //取得第一个冒号的位置
        if (colonIndex === -1) { // 比如 ms-class="aaa bbb ccc" 的情况
            var className = text
        } else { // 比如 ms-class-1="ui-state-active:checked" 的情况
            className = text.slice(0, colonIndex)
            rightExpr = text.slice(colonIndex + 1)
            parseExpr(rightExpr, vmodels, data) //决定是添加还是删除
            if (!data.evaluator) {
                log("debug: ms-class '" + (rightExpr || "").trim() + "' 不存在于VM中")
                return false
            } else {
                data._evaluator = data.evaluator
                data._args = data.args
            }
        }
        var hasExpr = rexpr.test(className) //比如ms-class="width{% raw  %}{{w}}{% endraw  %}"的情况
        if (!hasExpr) {
            data.immobileClass = className
        }
        parseExprProxy("", vmodels, data, (hasExpr ? scanExpr(className) : null))
    } else {
        data.immobileClass = data.oldStyle = data.param
        parseExprProxy(text, vmodels, data)
    }
},
```

注释很良心啊！不要就纠结太多细节哈，通过断点调试可以知道，那个 `text` 就是 `ms-class` 的内容部分，首先预处理，先不管了，这里我先不看含有 `{{}}` 括起来的那类，然后是用 `:` 获取类名和后面的表达式，我们关心的表达式(`rightExpr`)就是通过那个 `parseExpr` 函数来处理的，这个函数看名字就知道是解析表达式的（『兄弟们，就是它，给我打』）。

进入这个函数，这个代码就不贴了，略长，解释到具体的部分再贴，同样不要纠结细节。

先看有一个 `getVariables` 函数，看名字应该是解析变量的哈，看看实现：

```javascript
var getVariables = function(code) {
    var key = "," + code.trim()
    if (cacheVars[key]) {
        return cacheVars[key]
    }
    var match = code
            .replace(rrexpstr, "")
            .replace(rsplit, ",")
            .replace(rkeywords, "")
            .replace(rnumber, "")
            .replace(rcomma, "")
            .split(/^$|,+/)
    return cacheVars(key, uniqSet(match))
}
```

容我发一句感慨：万能的正则啊！！！

里面先是查看缓存，miss之后才解析，看看里面几个正则表达式，请参考 `MDN` 的[手册](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)：

```javascript
var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
```

这个真TM长，不过里面是分了好多项的：`\/\*[\w\W]*?\*\/` 是去除块注释的，`\/\/[^\n]*\n|\/\/[^\n]*$`是去除单行注释的啊，`"(?:[^"\\]|\\[\w\W])*"` 和 `'(?:[^'\\]|\\[\w\W])*'` 是去除字符串的（貌似不能去除最末尾是单个`\`的字符串），`[\s\t\n]*\.[\s\t\n]*[$\w\.]+` 是 `.` 后面的一堆东西

这里有一个 bug，比如 `var a = "\\", b = "hello"`经过这个正则替换空字符串后会得到 `var a = hello"`，会导致最终得到的变量列表是 `a` 和 `hello`。先留在这里吧，有时间再看看！

眼已瞎，看正则是锻炼耐力和视力的好方法，请奔走相告！

```javascript
var rsplit = /[^\w$]+/g
```

这个好短~ 这个配合上面的代码就是把不是字母和下划线的东西统统换成逗号，变量就留下来了。后面几个不贴了，就是去除保留字、数字、整行整行的逗号，然后用逗号分割开就得到了变量列表。恩，眼睛又好了。

比如我们的代码 `module=='home'` 这么走一遍就剩一个 `module` 了。

对	`vmodule` 去重后，为每个 `module` 分配一个 `vm当前时间戳_序号` 的名字，干嘛的我们后面看哈。

这里我们的代码会生成一个类似 `module = vm1413291195556_0.module` 的语句，是赋值语句(`assigns`)。

然后往下拼接起这些赋值语句，并且前面加上 `var `，就是定义哈：

```javascript
var prefix = assigns.join(", ")
if (prefix) {
    prefix = "var " + prefix
}
```

我们的代码就变成 `var module = vm1413291195556_0.module` 了。

接下来，我们可以直接跳到其他绑定这里了：

```javascript
} else { //其他绑定
    code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
}
try {
    fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
    data.evaluator = cacheExprs(exprId, fn)
} catch (e) {
    log("debug: parse error," + e.message)
} finally {
    vars = textBuffer = names = null //释放内存
}
```

这里把 `code` 变成 `\n return module!='test';`，然后就是生成执行函数:

```javascript
fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
```

最后生成的函数类似：

```javascript
function anonymous(vm1413291195556_0
/**/) {
    'use strict';
    var module = vm1413291195556_0.module
    return module!='test';
}
```

这里可以看出，能出现在 `return` 语句里面的表达式，应该都可以放到 `ms-class` 冒号后面。

ps: 如果是上面那个提取变量的 bug，这里某些变量就可能生成不了，等我想出个 bug 出现的场景来再谈，这里不展开了。

之后就是把这个求职函数绑定到 `data` 的 `_evaluator` 上。最终的求值是在 `bindingExecutors` 里面的 `class` 处理函数部分。

```javascript
data.toggleClass = data._evaluator ? !!data._evaluator.apply(elem, data._args) : true
```

这里用 `!!` 把结果转为布尔值，到这里，`ms-class` 后面可以接什么表达式就一目了然了。

回家睡觉。。。
