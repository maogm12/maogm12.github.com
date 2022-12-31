---
layout: post
title: Markdown语法
date: 2012-12-31 13:02
author: Guangming Mao
category: blog
tags:
  - Markdown
  - Translation
slug: markdown-syntax
---

> 此文由英文版翻译而来，原文请点[这里][source]

[source]: http://daringfireball.net/projects/markdown/syntax
          "Daring Fireball: Markdown Syntax Documentation"

* [概述](#overview)
    * [哲学](#philosophy)
    * [内联HTML](#html)
    * [特殊字符的自动转义](#autoescape)
* [块元素](#block)
    * [段落和换行](#p)
    * [标题](#header)
    * [区块引用](#blockquote)
    * [列表](#list)
    * [代码块](#precode)
    * [水平线](#hr)
* [内联元素](#span)
    * [链接](#link)
    * [强调](#em)
    * [代码](#code)
    * [图片](#img)
* [杂项](#misc)
    * [转义符](#backslash)
    * [自动链接](#autolink)

提示：本文自身也是用Markdown书写的，你可以[查看源码][md]。

[md]: https://raw.github.com/maogm12/maogm12.github.com/source/_posts/2012-12-31-markdown-syntax.markdown
      "查看源码"

<!--more-->

* * *

<h2 id="overview">概述</h2>

<h3 id="philosophy">哲学</h3>

Markdown设计上尽可能易读易写。

无论如何，可读性总是被放在第一位的。一篇Markdown格式的文档应该可以以纯文本形式发布，
而没有满篇的标签和各种格式化指令。事实上，Markdown的语法受到了很多文本转HTML工具语言的影响，
像[Setext][1], [atx][2], [Textile][3], [reStructuredText][4], [Grutatext][5], [EtText][6]等，
但最大的灵感来自文本邮件的格式。

[1]: http://docutils.sourceforge.net/mirror/setext.html
[2]: http://www.aaronsw.com/2002/atx/
[3]: http://textism.com/tools/textile/
[4]: http://docutils.sourceforge.net/rst.html
[5]: http://www.triptico.com/software/grutatxt.html
[6]: http://ettext.taint.org/doc/

为了这个目的，Markdown的语法都是有标点字符组成，这些字符都经过精心挑选，以至于他们看起来就是他们本身的意思。
例如：单词两旁的星号看起来就像\*强调\*，Markdown的列表看起来也就是列表。甚至假如你用过email的话，
区块引用看起来也就像是一段文字的引用。

<h3 id="html">内联HTML</h3>

Markdown语法有一个目的：被用作一种网络**书写**格式

Markdown不是HTML的替代品，甚至长得也不像HTML。他的语法很很精悍，只是HTML标签的一个很小的子集。
它**不是**想创建一种语法以更简单的方法来插入HTML标签，在我看来，HTML标签已经很容易插入了。
Markdown的目的是文档易读，易写，更优美（译注：to edit prose，肿么翻译。。。）。
HTML是一种适用于“发布”的格式，而Markdown适用于“书写”。所以，Markdown格式语法只注重那些能在纯文本里表达的功能。

对于那些Markdown语法没有覆盖到的标签，你直接用HTML就行。没必要起个引子或定个界限来表示你从Markdown换成了HTML，
你只需要用那些标签就行了。

唯一的约束就是块级元素，像`<div>`、`<table>`、`<pre>`、`<p>`等，必须用空行与前后文隔开，并且块不能以制表符（`tab`）
或空格开头或结尾。Markdown够智能，不会在块级元素两旁插入多余的`<p>`标签。

举个例子，在一篇Markdown文档里插入一个HTML表格：

```html
这是普通的一行。

<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>

这是普通的另一行。
```

注意块级HTML标签内部的Markdown格式语法是不会被处理的。例如，你不能在一个HTML块里面使用Markdown格式的`*强调*`。

行级HTML标签，像`<span>`，`<cite>`，`<del>`等，可以在任意的Markdown段落、列表、标题里使用。如果你想，
你甚至可以用HTML标签代替Markdown的格式，比如：如果比起Markdown的链接和图片语法，你更喜欢`<a>`或`<img>`，
那你就用吧。

不像块级HTML标签，行级HTML便签内部**可以**使用Markdown语法。

<h3 id="autoescape">特殊字符的自动转义</h3>

在HTML里面有两个需要特殊对待的字符：`<`和`&`。左尖括号用于开始标签，‘&’符号用来指示HTML特殊字符编码。
如果你想使用他们的原始意义，你必须把他们转义成特殊字符，比如：`&lt;`和`&amp;`。

‘&’尤其让网络写手们恶心。如果你想写“AT&T”，你必须写“`AT&amp;T`”。你甚至要转义URL里面的“&”。
因此，当你想链接到：

    http://images.google.com/images?num=30&q=larry+bird

你必须在链接标签的`href`属性里转码成:

    http://images.google.com/images?num=30&amp;q=larry+bird

不用说，这很容易忘掉，并且可能成为一个编码良好的网站里面唯一的HTML格式错误。

Markdown允许正常使用字符，它会自动转义。如果你在一个HTML特殊字符编码里面用了“&”，它会保持不变，
否则它会被自动转换成`&amp;`。

所以，如果你想在你的文章里面加一个版权标识，你可以这么写：

    &copy;

Markdown不会转换。但是如果你这么写：

    AT&T

Markdown会将它转换成：

    AT&amp;T

类似的，由于Markdown至此[内联HTML](#html)，如果你在HTML标签开头使用了左尖括号，
Markdown会把它们仍然当做左尖括号。当如果你这么用：

    4 < 5

Markdown会翻译成：

    4 &lt; 5

然而，在Markdown的代码和引用里面，尖括号和“&”**肯定**会被自动转义。这让用Markdown写HTML代码变得很简单。
（相对于原始HTML而言，原始HTML里面插入HTML格式的代码很恶心，因为每一个`<`和`&`都要先转义。）



* * *

<h2 id="block">块元素</h2>

<h3 id="p">段落和换行</h3>

段落其实就是由一个以上空行隔开的一行或连续多行的文本（空行指看起来是空的行，
也就是说一个只包含空格或制表符的行）。普通段落不应该用空格或制表符缩进。

“一行或连续多行的文本”这条规则暗示着Markdown支持“硬换行”的段落。这与其他大部分包含转换换行选项的
文本转HTML工具有很大不同，这些工具会把段落里的每一个换行符转换为一个`<br />`标签。

当你**确实**需要在Markdown里面插入一个`<br />`换行标签时，只需要在行尾插入两个以上的空格，
然后回车就可以了。

当然，这让插入`<br />`稍微麻烦了一点，但简单的“每个换行符就是一个`<br />`”的规则不适用Markdown。
因为使用硬换行时，Markdown的email风格的[区块引用][bq]和多段落[列表][l]才能更好地工作，也更美观。

[bq]: #blockquote
[l]:  #list


<h3 id="header">标题</h3>

Markdown支持两种风格的标题：[Setext][1]风格的和[atx][2]风格的。

Setext风格的标题是“下划线形式”的，一级标题使用等号`=`，二级标题使用破折号`-`
（译注：原文这里是dash，和连字符hyphen有区别，区别可以参考
[知乎上这个问题][dash-hyphen]。在键盘上没有对应的键，一般就用连字符代替了，
不过我看好几个Markdown实现这里反而不能使用dash，只能使用连字符）。
例如：

[dash-hyphen]: http://www.zhihu.com/question/20332423

    This is an H1
    =============

    This is an H2
    -------------

`=`或`-`个数没有限制。

Atx风格的标题使用行首的1-6个井号`#`标识1-6级的标题，例如：

    # 我是一级标题

    ## 我是二级标题

    ###### 我是六级标题

事实上，你还可以“关闭”atx风格的标题，不过这只是个装饰的功能，如果你觉得那样好看点的话。
闭合标题的井号没必要和开启标题的井号个数相同。（开启标题的井号个数决定了标题的等级）：

    # This is an H1 #

    ## This is an H2 ##

    ### This is an H3 ######


<h3 id="blockquote">区块引用</h3>

Markdown使用email风格的`>`符号来表示区块引用。如果你对邮件里的引用很熟悉，你肯定知道Markdown
里面的区块引用怎么用。如果你使用硬换行，并在每一行前加上`>`，区块引用会更加美观：

    > 这是一个包含两个段落的区块引用。（下面的一堆google翻译说是拉丁文-_-||）
    > 今天元旦节啊，去哪里玩呢？2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。
    > 好吧，这是我扯的。。。原文作者应该不认识盖饭的说。
    >
    > 接着扯呢？这篇文档有英文原文翻译过来，基于XXX许可证发布，转载的时候贴上链接就行了啦~
    > 觉得我翻译太龊了的话，那就。。。恩，凑活着看吧。

Markdown允许你偷个懒，你可以只在硬换行的第一行行首加一个`>`：

    > 这是一个包含两个段落的区块引用。（译注：下面的一堆google翻译说是拉丁文-_-||）
    今天元旦节啊，去哪里玩呢？2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。
    好吧，这是我扯的。。。原文作者应该不认识盖饭的说。

    > 接着扯呢？这篇文档有英文原文翻译过来，基于XXX许可证发布，转载的时候贴上链接就行了啦~
    觉得我翻译太龊了的话，那就。。。恩，凑活着看吧。

区块引用还可以嵌套（就是区块引用里面再用区块引用），只要再加一个`>`级别就可以了：

    > 我是第一层的引用。
    >
    >> 我是嵌套的区块引用。
    >
    > 又回到第一层了。

区块引用里面也可以包含其他的Markdown元素，包括标题，列表和代码块：

    > ## 我是标题
    >
    > 1. 我是列表第一项
    > 2. 我是列表第二项
    >
    > 来个代码块的例子：
    >
    >       return shell_exec("echo $input | $markdown_script");

任何一个主流编辑器应该都可以很方便的做一个email风格的引用。比如BBEdit里面，你可以选择
一些文本然后在Text菜单里面选择Increase Quote Level。

<h3 id="list">列表</h3>

Markdown支持有序和无序列表。

无序列表可以用星号`*`、加号`+`或者连字符`-`（译注：这里是hyphen）做列表标记，可互换：

    * 红
    * 绿
    * 蓝

这种方式与

    + 红
    + 绿
    + 蓝

和

    - 红
    - 绿
    - 蓝

是等价的。

有序列表使用数字紧接一个句点（`.`）来标记：

    1. Bird
    2. McHale
    3. Parish

记住一点，使用的数字对最终的HTML输出没有任何影响。上面的列表会产生下面的HTML输出：

```html
<ol>
<li>Bird</li>
<li>McHale</li>
<li>Parish</li>
</ol>
```

如果你在Markdown里面这么写：

    1. Bird
    1. McHale
    1. Parish

或者甚至这么写：

    3. Bird
    1. McHale
    8. Parish

得到的HTML输出时一模一样的。重点是，如果在Markdown列表里使用有序的数字，那么在发布的HTML
里面可以得到一致的列表。但是，如果你有点懒，你也大可不必这么做。

不过，就算你使用偷懒的方式，你还是应该让列表从1开始。因为在将来，Markdown可能会支持从任意数字
开始有序列表。（译注：上面第三个可能就成了3,4,5）

列表标记通常从左边界开始，但是也可以缩进最多三个空格。并且列表标记后面必须是一个以上的空格或制表符。

为了让列表好看点，你也可以缩进一下：（译注：好眼熟...）

    *   今天元旦节啊，去哪里玩呢？2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。
        好吧，这是我扯的。。。原文作者应该不认识盖饭的说。

    *   接着扯呢？这篇文档有英文原文翻译过来，基于XXX许可证发布，转载的时候贴上链接就行了啦~
        觉得我翻译太龊了的话，那就。。。恩，凑活着看吧。

如果你想偷懒，那就没必要了:

    *   今天元旦节啊，去哪里玩呢？2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。
    好吧，这是我扯的。。。原文作者应该不认识盖饭的说。

    *   接着扯呢？这篇文档有英文原文翻译过来，基于XXX许可证发布，转载的时候贴上链接就行了啦~
    觉得我翻译太龊了的话，那就。。。恩，凑活着看吧。

如果列表项两旁有空行，Markdown会在HTML输出里用`<p>`标签把列表项包裹起来。例如，输入：

    *   Bird
    *   Magic

会变成：

```html
<ul>
<li>Bird</li>
<li>Magic</li>
</ul>
```

但如果这么写：

    *   Bird

    *   Magic

会变成：

```html
<ul>
<li><p>Bird</p></li>
<li><p>Magic</p></li>
</ul>
```

列表项里面可能包含多个段落，后面的段落必须用4个空格或1个制表符缩进。

    1.  这是一个包含两个段落的区块引用。（译注：复制粘贴）
        今天元旦节啊，去哪里玩呢？2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。
        好吧，这是我扯的。。。原文作者应该不认识盖饭的说。

        接着扯呢？这篇文档有英文原文翻译过来，基于XXX许可证发布，转载的时候贴上链接就行了啦~
        觉得我翻译太龊了的话，那就。。。恩，凑活着看吧。

    2.  再来一段。

后面的段落每一行都缩进的话，看起来会舒服点，但这里Markdown同样允许你偷懒：

    *   我是一个有两段的列表项

        我是列表项的第二段。你只需要缩进第一行就可以了。今天元旦节啊，去哪里玩呢？
    2013啊，不能吃个盖饭就了事啊，晚上出去吃大餐才行啊。好吧，这是我扯的。。。
    原文作者应该不认识盖饭的说。

    *   我是另外一个列表项。

想在列表项里面使用区块引用，定界符`>`必须得缩进：

    *   我是一个有区块引用的列表项。

        > 我是一个藏在列表项
        > 里面的区块引用。

想在列表项里面使用代码块，代码块必须缩进**两次**，也就是8个空格或2个制表符：

    *   我是一个有代码块的列表项。

            <code goes here>

虽然毫无意义，但是有序列表可能被意外地触发，比如这么写：

    1986. What a great season.

也就是说，行首有一个**数字-句点-空格**序列。为了避免这种情况，你可以用反斜线转义这个句点：

    1986\. What a great season.


<h3 id="precode">代码块</h3>

预格式化的代码块一般被用来写程序相关的东西或者标记源代码。不像前面几段，代码块的每一行
都会原模原样被解析出来。Markdown会同时用`<pre>`和`<code>`把代码块包裹起来。

在Markdown插入代码块很简单，只需要为每一行缩进至少4个空格或一个制表符。例如，这个输入：

    我是一个平常的段落。

        This is a code block.

Markdown会产生：

```html
    <p>我是一个平常的段落。</p>

    <pre><code>This is a code block.
    </code></pre>
```

代码块的每一行都会被移除一个级别的缩进（4个空格或1个制表符）。例如：

    来一段AppleScript的例子：

        tell application "Foo"
            beep
        end tell

会输出：

```html
<p>来一段AppleScript的例子：</p>

<pre><code>tell application "Foo"
    beep
end tell
</code></pre>
```

代码块会一直持续到某一行没有缩进（或文章结尾）为止。

在代码块里面，“&”符号（`&`）和尖括号（`<`和`>`）会被自动装换为HTML特殊字符编码。
这让在Markdown里面插入范例HTML代码变得很简单，只需要粘贴过来，缩进一下就可以了。
Markdown会自动转义“&”符号和尖括号。例如：

```html
<div class="footer">
    &copy; 2004 Foo Corporation
</div>
```

会被转换为：

```html
<pre><code>&lt;div class="footer"&gt;
    &amp;copy; 2004 Foo Corporation
&lt;/div&gt;
</code></pre>
```

代码块里面的正常Markdown语法是不被解析的，比如，代码块里面的星号仍然表示星号。
这意味着用Markdown来写自己的语法也很简单。


<h3 id="hr">水平线</h3>

你可以在一行里输入三个以上的连字符，星号或下划线来插入一个水平线标签（`<hr />`）。
如果你喜欢，你也可以在连字符或星号之间插入空格。下面几行都可以产生一条水平线。

    * * *

    ***

    *****

    - - -

    ___________________________________________


* * *

<h2 id="span">内联元素</h2>

<h3 id="link">链接</h3>

Markdown支持两种风格的链接：**内联**风格和**引用**风格。

两种风格的文本都是放在[方括号]里面的.

内联风格链接是在链接文本的方括号后面紧接着用一对圆括号，在圆括号里面放置链接的URL和一个**可选**的
引号包含起来的链接标题。例如：

    这是一个内联风格的链接的[例子](http://example.com/ "标题")

    没有标题的内联风格的链接的[例子](http://example.com/)

会产生如下输出：

```html
<p>这是一个内联风格的链接的<a href="http://example.com/" title="标题">例子</a></p>

<p>没有标题的内联风格的链接的<a href="http://example.com/">例子</a></p>
```

如果你引用的是同一个服务器上的本地资源，你可以使用相对路径：

    更多细节请查看[关于我](/about/)页面。

引用风格的链接使用另一对方括号，里面放一个标识链接的标签：

    这是一个引用风格的链接的[例子][id]。

你也可以用1个空格隔开这两对方括号：

    这是一个引用风格的链接的[例子] [id]。

然后，在文档里任意一个地方，你要定义一个独占一行的链接标签：

    [id]: http://example.com/ "可选标题"

格式：

*   包含链接的标识的方括号（顶格或者至多3个空格的缩进）；
*   紧接着一个冒号（英文的）；
*   紧接着至少一个空格（或制表符）；
*   紧接着链接的URL；
*   后面接着可选的链接的title属性，可被双引号，单引号或圆括号包括。

下面三个定义是等价的：

    [foo]: http://example.com/ "可选的标题"
    [foo]: http://example.com/ '可选的标题'
    [foo]: http://example.com/ (可选的标题)

**注意：**在Markdown.pl 1.0.1里面有一个已知bug，单引号不能用来界定一个链接标题。

链接的URL也可以用尖括号括起来

    [id]: <http://example.com/> "可选的标题"

title属性也可以放在下一行，并且用多余的空格或制表符排下版，URL很长的时候，这样会美观多了。

    [id]: http://example.com/longish/path/to/resource/here
        "可选标题"

链接定义在Markdown里用做创建链接，并且在HTML输出里面不会出现。

链接定义的名字可以包含字母、数字、空格和符号，但它**不是**大小写敏感的。
比如这两个链接是等价的：

    [link text][a]
    [link test][A]

可以通过**隐式链接名字**忽略连接名，这时，链接文本的名字会被用作连接名，
用一对空方括号就可以了。比如：链接Google到google.com，只需要这样写：

    [Google][]

然后定义链接：

    [Google]: http://google.com/

因为链接名字可能含有空格，所以链接文本是多个单词的情况Markdown也能正常处理：

    Visit [Daring Fireball][] for more information.

然后定义链接：

    [Daring Fireball]: http://daringfireball.net/

链接定义能够放在Markdown文章中任意的地方。我倾向把他们放在被引用的段落的后面，
但如果你喜欢，你也可以全放在文档结尾，就像脚注一样。

这里有个引用风格的链接的例子：

    I get 10 times more traffic from [Google] [1] than for [Yahoo] [2] or [MSN] [3].

    [1]: http://google.com/         "Google"
    [2]: http://search.yahoo.com/   "Yahoo Search"
    [3]: http://search.msn.com/     "MSN Search"

使用隐式连接名，也可以这么写：

    I get 10 times more traffic from [Google][] than for [Yahoo][] or [MSN][].

    [google]:   http://google.com/          "Google"
    [yahoo]:    http://search.yahoo.com/    "Yahoo Search"
    [msn]:      http://search.msn.com/      "MSN Search"

上面两个例子都会产生以下HTML输出：

```html
<p>I get 10 times more traffic from <a href="http://google.com/" title="Google">
Google</a> than from <a href="http://search.yahoo.com/" title="Yahoo Search">Yahoo
</a> or <a href="http://search.msn.com/" title="MSN Search">MSN</a>.</p>
```

为了比较，以下是使用内联风格的链接风格书写的的相同的段落：


    I get 10 times more traffic from [Google](http://google.com/ "Google")
    than from [Yahoo Search](http://search.yahoo.com/ "Yahoo Search") or
    [MSN}(http://search.msn.com/ "MSN Search").

引用风格的链接的目的不是为了更好书写，而是让你的文档更易读。比较上面的例子，
使用引用风格的链接，段落本身才81个字符长；而使用内联风格的有176个字符；原始HTML
是234个字符。在原始HTML里面，标记比文本都多。

使用Markdown的引用风格的链接，源文档长得更像浏览器渲染出来的结果。把标记相关的元数据都放到
段落外面，你就可以在不打断文章叙述脉络的情况下添加链接了。


<h3 id="em">强调</h3>

Markdown把星号（`*`）和下划线（`_`）当做强调的指示符。处于一对`*`或`_`里面的文本在最终HTML里
会被`<em>`标签包裹。处于一对双星号（`**`）或双下划线（`__`）里面的文本在最终HTML里
会被`<strong>`标签包裹。例如：

    *single asterisks*

    _single underscores_

    **double asterisks**

    __doubel underscores__

会产生：

    <em>single asterisks</em>

    <em>single underscores</em>

    <strong>double asterisks</strong>

    <strong>double underscores</strong>

你可以选一种你喜欢的方式，唯一的约束就是要用同一种字符开启闭合。

强调可以在单词中间使用：

    un*frigging*believable

但是如果在`*`或`_`两旁加空格，`*`或`_`会被当做普通字符。

如果想在一个可能误会为指示符的地方使用普通的`*`和`_`，可以用反斜线转义：


    \*this text is surrounded by literal asterisks\*


<h3 id="code">代码</h3>

插入内联代码，要是用反引号（`` ` ``）包裹。不像预格式化的代码块，一个内联代码
表示在一个普通段落里面的代码段，比如：

    Use the `printf()` function.

会生成：

```html
<p>Use the <code>printf()</code> function.</p>
```

如果要包含的代码段里有反引号，应该使用多个反引号包裹来标识代码段：

    ``There is a literal backtick (`) here.``

这会产生以下输出：

```html
<p><code>There is a literal backtick (`) here.</code></p>
```

两旁的标识符可以包含空格（紧接着开启代码段的反引号一个，闭合代码段的反引号前一个），
这让在代码段开头结尾插入反引号成为可能：

    A single backtick in a code span: `` ` ``

    A backtick-delimited string in a code span: `` `foo` ``

会生成：

```html
<p>A single backtick in a code span: <code>`</code></p>

<p>A backtick-delimited string in a code span: <code>`foo`</code></p>
```

在内联代码段里，“&”符号和尖括号会自动转换为HTML特殊符号编码，这让包含范例HTML标签变得很容易。
Markdown会把

    Please don't use any `<blink>` tags.

转换为

```html
<p>Please don't use any `&lt;blink&gt;</code> tags.</p>
```

你可以这么写

    `&#8212;` is the decimal-encoded equivalent of `&mdash;`.

来生成

```html
<p><code>&amp;#8212;</code> is the decimal-encoded
equivalent of <code>&amp;mdash;</code>.</p>
```

<h3 id="img">图片</h3>

发明一种“自然的”语法在纯文本格式的文档里面插入图片是相当困难的，这是公认的。

Markdown使用一种类似链接的的图片语法，它同样允许两种风格：**内联**风格和**引用**风格。

内联风格的图片语法看起来像这样：

    ![Alt text](/path/to/img.jpg)

    |[Alt text](/path/to/img.jpg "Optional title")

格式：

*   一个感叹号（译注：英文的）：`!`；
*   紧接一对方括号，里面是img标签的alt属性文本；
*   紧接着一对圆括号，里面是URL或者图片的路径，同样有一个可选的`title`属性，
    它包含在双引号或单引号中。

引用风格的图片语法看起来是这样子：

    ![Alt text][id]

id是定义图片引用的名字。图片引用定义语法和引用风格的链接是一样的：

    [id]: url/to/image "Optional title attribute"

这样写，Markdown没有语法指定图片尺寸，如果确实需要值定尺寸，那就使用HTML的`<img>`标签吧。


* * *


<h2 id="misc">杂项</h2>

<h3 id="autolink">自动链接</h3>

Markdown为URL和email地址提供一种简洁的方创建自动链接：用尖括号把URL和email地址括起来就可以了。
这意味着，如果你想让链接显示本身的URL或email地址的原始文本，并让它可以点击，你可以这么做：

    <http://example.com/>

Markdown会把他转换为：

```html
    <a href="http://example.com/">http://example.com/</a>
```

email地址的自动链接差不多，只不过Markdown会把地址字符随机替换为十进制或十六进制编码，这样可以
避免你的email地址被一些地址爬虫爬到。比如说Markdown会把


    <address@example.com>

转换为大致这样：

```html
    <p><a href="&#x6d;&#97;&#x69;&#x6c;&#x74;&#111;&#58;&#x61;&#x64;&#100;
    &#114;&#101;&#x73;&#x73;&#64;&#x65;&#120;&#97;&#x6d;&#x70;&#108;&#x65;
    &#46;&#x63;&#111;&#109;">&#97;&#x64;&#100;&#114;&#x65;&#x73;&#115;&#x40;
    &#x65;&#x78;&#x61;&#x6d;&#112;&#108;&#101;&#x2e;&#99;&#x6f;&#109;</a></p>
```

他在浏览器里面被渲染出来就是一个到address@example.com的可点击链接。

（这种实体编码的技巧确实会躲过大部分地址爬虫，但当然不是所有的。但有总比没有好，这样发布的地址
最后很可能会开始收垃圾邮件。）

<h3 id="backslash">转义符</h3>

Markdown允许你对Markdown格式语法里面有特殊意义的字符做转义来输出他们本身。例如，如果你想在单词
两旁加上星号（而不是`<em>`标签），你可以用在星号前加反斜线，就像这样：

    \*literal asterisks\*

Markdown为以下字符提供转义：


    \   反斜线
    `   反引号
    *   星号
    _   下划线
    {}  花括号
    []  方括号
    ()  圆括号
    #   井号
    +   加号
    -   减号（连字符）
    .   句点
    !   感叹号

翻译：Guangming Mao