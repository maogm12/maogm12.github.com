---
layout: post
title: C语言赋值运算符的返回值
date: 2012-12-24 03:06
author: Gavin
category: blog
tags:
  - C
  - Assignmnt operator
slug: return-value-of-assignment-operator-in-c
---


>结论：C语言赋值运算符返回的是左值的地址

<!--more-->

今天看C陷阱与缺陷，又看到了一处提到`strcpy`，下面有库里面的实现的代码：

```c
//这是整理过的，不是原书的代码
char *strcpy(char *dest, const char *src)
{
    assert(dest!=NULL && src!=NULL);
    char *str=dest;
    while ((*dest++=*src++)!='\0');
    return str;
}
```

`while ((*dest++=*src++)!='\0');`
这一句让我想了很久，以前一直认为赋值运算符返回的是是否复制成功，现在看起来它应该返回的是左值的值。

于是我去搜索了一下，排除好多讲C++重载的文章后，终于发现了一篇赋值运算符的返回值。其中有一个例子，先来看看：

```c
#include <stdio.h>

int main()
{
    int a = 1;
    int c = (a*=2) + (a+=3);
    printf("a = %d, c = %d\n", a, c);
    return 0;
}
```

如果赋值运算符返回左值的值的话，(a*=2)和(a+=3)应该返回2和5，那么结果应该是`a = 5, c =
7`。如果是这样，后面也不用写了。事实上结果让我吃了一惊，这个例子的结果如下：

```bash
a = 5, c = 10
```

其实C语言的赋值运算符会返回左值的地址而不是值，上面的代码就相当于在`a*=2`和`a+=3`执行完后将两个a相加。

下面再来看一个例子

```c
#include <stdio.h>

int main()
{
    int a = 1;
    printf("%d, %d, a = %d\n", (a*=2), (a+=3), a);
    return 0;
}
```


这个例子会输出什么呢？

5, 5, a = 5 么？

别忘了printf压栈是从右至左的。它会输出：

```bash
8, 8, a = 8
```

回头想想C++重载赋值运算符的时候讲的该返回变量的引用，其实跟这个差不多