Title: xhup(小鹤双拼) on fcitx
Date: 2014-07-15 18:49
Author: Garnel
Category: Projects
Tags: Xiaohe, Fcitx
Slug: xhup-on-fcitx

### cheat sheet
小鹤双拼的 cheat sheet，支持编码、词语的双向查询，看图：

<img src="{filename}../../images/xhup-cheat-sheet.png" alt="小鹤双拼 cheat sheet" />

点击[这里]({filename}cheat-sheet.html)访问。数据 3.3M 多，手机党慎点。。。

### mb file
小鹤双拼的形码可以挂载在百度、搜狗等输入法上使用，都是用的自定义短语的方式。
Fcitx 里面也可以加载自定义短语，这个文件位于 /usr/share/fcitx/pinyin/pySym.mb 和
$HOME/.config/fcitx/pinyin/pySym.mb。老版本的 fcitx 不清楚，4.2 以后都是。

格式特别简单，像下面这样

    # code character
    miss 汖两覔，惷到奣@_@...

我使用百度输入法的挂载文件做了一份码表，可以放到挂载到 fcitx 里面使用。

如果想体验更纯粹的双形，fcitx 有 table 输入法，加载这份码表后可以实现四码自动上屏，
和飞扬版很像啊，哈哈

详情请访问 [git repo](https://github.com/Garnel/fcitx-xhup) 里面还有更多东西呢。
