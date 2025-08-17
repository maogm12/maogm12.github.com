---
layout: post
title: 搬砖的时候发现一些关于砖 (block) 的问题
date: 2018-07-27 11:17
author: Guangming Mao
category: blog
tags:
  - Assembly
  - Objective-C
lang: zh 
slug: ref-in-block
---

> 搬运自 <https://zhuanlan.zhihu.com/p/40663395>

最近在微博上看到一个关于 block 的问题，有这么一段代码：

```objc
#include <stdio.h>

int main() {
    typedef int(^Block)(void);
    Block blocks[3];
    int i;
    for (i = 0; i < 3; ++i) {
        blocks[i] = ^{
            return i;
        };
    }
    for (i = 0; i < 3; ++i) {
        printf("%d\n", blocks[i]());
    }
}
```

这段代码在 ARC 和 MRC 模式下分别会输出什么？答案是：ARC 模式下面会输出 `012`，而 MRC 模式下会输出 `222`。

## MRC 模式下的 block

我们先来讨论 MRC 模式下这段代码的行为，关于 block 的实现细节，可以参考这篇文章：[Block Implementation Specification](http://clang.llvm.org/docs/Block-ABI-Apple.html)。从中我们可以看到编译器会生成一些描述这个 block 的 struct，由于我们引用了栈上的局部变量 i，这个 block 会存在于栈内存里（而不是全局内存里）。其实这 3 个 block 指针都指向栈上面同一片内存，每次循环唯一修改的只是这个 block 里面捕获的变量 i 的副本，循环完后，block 里面保存的副本值为 `2`，所以 MRC 模式下输出 3 个 `2`。

道理不难，我倒是很好奇编译器到底生成了什么样的代码，带着这个疑惑，我研究了一下上面代码对应的汇编代码，为了看懂这个汇编，我还临时抱佛脚，看了一篇[汇编的介绍](https://web.archive.org/web/20170222021931/https://www3.nd.edu/~dthain/courses/cse40243/fall2015/intel-intro.html)。

首先生成 MRC 模式下的汇编代码：

```shell
clang -fno-stack-protector -fno-objc-arc -S blocktest.m -o blocktest_mrc.s
```

因为主要区别在于 3 个 `blocks[i]` 赋值，我们重点看这一部分。这一段汇编代码结合上述 block 实现细节那篇文章的 [Imported Variables](https://clang.llvm.org/docs/Block-ABI-Apple.html#imported-variables) 这一节看有奇效：

根据文章，我们的 block 大概会编译成：

```c
struct __block_literal_tmp {
    void *isa;  // &__NSConcreteStackBlock
    int flags;  // 0xC0000000
    int reserved;  // 0 
    void (*invoke)(struct __block_literal_2 *);
    struct __block_descriptor_2 *descriptor;
    const int i;
};
```

我摘取了对应的汇编代码分享一下：

```armasm
...
_main:
  pushq %rbp
  movq  %rsp, %rbp
  subq  $80, %rsp                       ## 栈上留出 80 bytes
  movl  $0, -4(%rbp)
  movl  $0, -36(%rbp)                   ## -36(%rbp) 存的是局部变量 i
LBB0_1:                                 ## 第一个循环
  cmpl  $3, -36(%rbp)
  jge LBB0_4                            ## i >= 3 则跳出循环

  leaq  -72(%rbp), %rax                 ## block 的地址
  leaq  ___block_descriptor_tmp(%rip), %rcx
  leaq  ___main_block_invoke(%rip), %rdx
  movq  __NSConcreteStackBlock@GOTPCREL(%rip), %rsi
  movq  %rsi, -72(%rbp)                              ## 初始化 isa
  movl  $-1073741824, -64(%rbp) ## imm = 0xC0000000  ## 初始化 flags
  movl  $0, -60(%rbp)                   ## 初始化 reserved 
  movq  %rdx, -56(%rbp)                 ## 初始化 invoke
  movq  %rcx, -48(%rbp)                 ## 初始化 descriptor
  movl  -36(%rbp), %edi                 ## 这两行把 i 的值复制给 block 里面的副本
  movl  %edi, -40(%rbp) 
  movslq  -36(%rbp), %rcx               ## %rcx = i
  movq  %rax, -32(%rbp,%rcx,8)          ## 赋值给 blocks[i]

  movl  -36(%rbp), %eax                 ## ++i
  addl  $1, %eax
  movl  %eax, -36(%rbp)
  jmp LBB0_1
LBB0_4:                                 ## 第二个循环
  movl  $0, -36(%rbp)
...
```

第一个循环结束之后栈内存大概长这个样子：

```
%rsp       -> |-------------------------------------------|
                                 ...
              |-------------------------------------------|
              |       block[2] = %rax = -72(%rbp)         |-----------------|
              |                                           |                 |
-16(%rsp)  -> |-------------------------------------------|                 |
              |       block[1] = %rax = -72(%rbp)         |-----------------|
              |                                           |                 |
-24(%rsp)  -> |-------------------------------------------|                 |
              |       block[0] = %rax = -72(%rbp)         |-----------------|
              |                                           |                 |
-32(%rsp)  -> |-------------------------------------------|                 |
              |       2 // local int i                    |                 |
-36(%rsp)  -> |-------------------------------------------| ----            |
              |       2 // block const int i              |    |            |
              |-------------------------------------------|    |            |
              |       &___block_descriptor_tmp            |    |            |
              |                                           |    |            |
              |-------------------------------------------|    |            |
              |       &___main_block_invoke               |    |            |
              |                                           |    |            |
              |-------------------------------------------| block_literal   |
              |       0 // reserved                       |    |            |
              |-------------------------------------------|    |            |
              |       0xC0000000 // flags                 |    |            |
              |-------------------------------------------|    |            |
              |       &__NSConcreteStackBlock             |    |            |
              |                                           |    |            |
-72(%rsp)  -> |-------------------------------------------| ----     <<<----|
                                 ...
```

看汇编代码就很清晰了，基本上 block 这块内存来回被初始化了 3 次，之后 block 里面的副本 i 变成了 2。

## ARC 模式下的 block

我们继续看 ARC 模式下的 block，我们先拿到汇编代码：

```shell
clang -fno-stack-protector -fobjc-arc -S blocktest.m -o blocktest_arc.s
```

同样摘取第一个循环部分，重点看两边不同的地方：

```armasm
...
_main:
  pushq %rbp
  movq  %rsp, %rbp

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ## 这里不同的地方在于 ARC 模式下会用 memset 清空 blocks 
  subq  $112, %rsp
  xorl  %esi, %esi
  movl  $24, %eax
  movl  %eax, %edx
  leaq  -32(%rbp), %rcx
  movl  $0, -4(%rbp)
  movq  %rcx, %rdi
  callq _memset
## <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  movl  $0, -36(%rbp)                   ## -36(%rbp) 存的是局部变量 i
LBB0_1:                                 ## 第一个循环
  cmpl  $3, -36(%rbp)
  jge LBB0_4                            ## i >= 3 则跳出循环

  leaq  -72(%rbp), %rax                 ## block 的地址
  leaq  ___block_descriptor_tmp(%rip), %rcx
  leaq  ___main_block_invoke(%rip), %rdx
  movq  __NSConcreteStackBlock@GOTPCREL(%rip), %rsi
  movq  %rsi, -72(%rbp)                              ## 初始化 isa
  movl  $-1073741824, -64(%rbp) ## imm = 0xC0000000  ## 初始化 flags
  movl  $0, -60(%rbp)                   ## 初始化 reserved 
  movq  %rdx, -56(%rbp)                 ## 初始化 invoke
  movq  %rcx, -48(%rbp)                 ## 初始化 descriptor
  movl  -36(%rbp), %edi                 ## 这两行把 i 的值复制给 block 里面的副本

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ## 这里不同的地方是我们初始化 block 之后，会调用 _bojc_retainBlock 把 block 复制到 heap 离去
  ## blocks[i] 保存的 heap 里面的 block
  movq  %rax, %rdi                      ## _objc_retainBlock(__block_literal)
  callq _objc_retainBlock
  movslq  -36(%rbp), %rcx
  movq  -32(%rbp,%rcx,8), %rdx          ## %rdx = blocks[i]
  movq  %rax, -32(%rbp,%rcx,8)          ## blocks[i] = _objc_retainBlock(__block_literal)
  movq  %rdx, %rdi                      ## _objc_release(%rdx)
  callq _objc_release
## <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  movl  -36(%rbp), %eax                 ## ++i
  addl  $1, %eax
  movl  %eax, -36(%rbp)
  jmp LBB0_1
LBB0_4:                                 ## 第二个循环
  movl  $0, -36(%rbp)
...
```

到这里这个问题就算破案了，欲知后事如何，请听下回分解！