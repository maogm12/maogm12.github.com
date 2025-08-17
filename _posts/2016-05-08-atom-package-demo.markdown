---
layout: post
title: An Atom Package Demo
date: 2016-05-8 23:09
author: Guangming Mao
category: blog
tags:
  - Atom
  - Javascript
slug: atom-package-demo
---

Atom 是 GitHub 出品的一个文本编辑器，基于 Electron，是一个基于 NodeJs 的项目。开源免费，
这也是我最初选用他的原因，还用 Electron 做过一段时间开发。

整个界面看起来很像 Sublime Text，是一个很良心的编辑器，唯一的缺点就是有点慢。

编辑器的灵魂在于插件，Sublime Text 这么受欢迎与那一大堆优秀的插件们是离不开，
VSCode 要加油啊。

最近写 Ruby 的项目，由于 RubyMine 太过于臃肿，转而还用了 Atom 做主力编辑器。
Atom 配置完成之后，写起代码来体验还是很棒的，现在比以前的版本也快多了。

作为工具党，插件我没少装，于是时时冒出自己学一下写插件的想法。Atom 底层是 NodeJs，
我也还能写一写。

正好在写单元测试的时候，测试大整数时，Rubocop 提示我 Ruby 中大整数应该使用 `_` 隔开，
类似 `123_456_789`，这样提高代码可读性。

那就写个轮子吧！！！

Atom 文档中有插件开发指南:
<http://flight-manual.atom.io/hacking-atom/sections/package-modifying-text/>

我的插件功能就是获取当前光标下的数字，然后把他们替换成下划线分割的格式。

使用 Atom 自带的包生成工具，可以很方便的生成插件的开发包，具体请参考官方文档。
由于不涉及到 View 的操作，我们的插件很简单，生成完之后，删除掉 View 操作的代码后，结构如下：

```
.
├── CHANGELOG.md
├── LICENSE.md
├── README.md
├── lib
│   └── seperate-number.js
├── package.json
```

测试代码容我后续再补哈。。。

库里面关键是操作数字，实现两个功能：

1. 添加分隔符
2. 取消分隔符

看代码，添加主要是三个一分三个一分，取消分隔符更简单，将分隔符都替换成空即可：

```javascript
class NumberSeperator {
    constructor(seperator) {
        this.seperator = seperator || '_';
    }

    toggleNumber(number) {
        var pos = number.indexOf(this.seperator);
        if (pos == -1) { // no seperator
            return this.seperateNumber(number, this.seperator);
        } else if (pos > 0 && pos <= 3) {
            var newPos = number.indexOf(this.seperator, pos + 1);
            while (newPos == pos + 3 + this.seperator.length) {
                pos = newPos;
                newPos = number.indexOf(this.seperator, pos + 1);
            }
            if (newPos == -1 && pos == number.length - 3 - this.seperator.length) {
                return this.unSeperateNumber(number, this.seperator);
            }
        }

        return number;
    }

    seperateNumber(number) {
        if (typeof number === 'string') {
            var length = number.length;
            if (length <= 3) {
                return number;
            }
            var start = length % 3;
            var result = start > 0 ? number.substring(0, start) : '';
            for (var i = start; i < length; i += 3) {
                if (i > 0) {
                    result += this.seperator;
                }
                result += number.substring(i, i + 3);
            }
            return result;
        }
        return '';
    }

    unSeperateNumber = function(number_with_seperator) {
        return number_with_seperator.split(this.seperator).join('');
    }
}
```

面向对象，搞个类先。

`toggleNumber` 主要是判断数字的格式，如果是没有分隔符的，我们就加上，如果有分隔符，
并且是正确的使用分割符的，我们就把分隔符去掉。

具体到插件的生命周期，每一个插件在 Atom 启动的时候都会调用 `active` 方法，
我们在这个方法里面注册我们的命令 `seperate-number:toggle`。

```javascript
activate() {
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
        'seperate-number:toggle': () => this.toggle()
    }));
}
```

然后在 `toggle` 方法里面主要是选中当前光标下的单词，然后选出其中的数字部分进行操作。

```javascript
toggle() {
    if (editor = atom.workspace.getActiveTextEditor()) {
        if (editor.getSelectedText() === '') {
            editor.selectWordsContainingCursors();
        }

        const worker = new NumberSeperator();
        var word = editor.getSelectedText();
        var numbers = word.match(/\d[_\d]+/g);
        var newNumber;
        numbers.forEach(function(number) {
            word = word.replace(number, worker.toggleNumber(number));
        });
        editor.insertText(word);
    }
}
```

看看效果吧，基本满足需求哈！

![效果图](../images/atom-package-demo/toggle.gif)

项目在这里：<https://github.com/maogm12/separate-number>

TODO：

- Atom 多选的时候有问题
- 扔 Atom 的插件库里面去