---
layout: post
title: OS X 中安装 Rails 环境
date: 2016-03-13 22:40
author: Gavin
category: blog
tags:
  - Ruby
  - Rails
slug: setup-rails-env
---

> 新学 Ruby 中，某不才，暂录 Rails 在 OS X 上的环境准备过程如下，以飨读者。

系统环境为 EI Capitan 10.11.3

## ruby

OS X 自带了 ruby，然其版本乃随系统升级而升级，版本较老且不能及时升级，不若另行安装 ruby 环境，可多个版本共存，可随意切换，不亦乐乎。

一般会使用版本管理器来安装 ruby 环境，今常用管理器有二，乃 rvm 与 rbenv 是也。

rvm 某未尝用过，或曰其臃肿复杂，由是，某初即选用 rbenv，
rbenv 项目在此：<https://github.com/rbenv/rbenv>，文档所列甚是详尽。

某简列相关过程如下：

在 OS X 上安装 rbenv 甚是方便，某用 brew 安装，只一行命令也。

```bash
brew install rbenv
```

若需要通过 rbenv 安装 ruby 环境，另需一 rbenv 插件 `ruby-build`，项目在此：<https://github.com/rbenv/ruby-build>，其提供了 `rbenv install` 命令。若使用 brew 安装亦甚是简单：

```bash
brew install ruby-build
```

成功之后，安装新版本的 ruby 解释器使用 `rbenv install`，如安装版本 ｀2.2.3｀：

```bash
rbenv install 2.2.3
```

于此有一插曲，奈何国内网络环境，下载源码甚慢，ruby-build 配置源码路径之文件位于 `<root_dir>/share/ruby-build`，一般就是 `/usr/local/opt/ruby-build/share/ruby-build`。如版本 `2.2.3` 文件如下：

```txt
install_package "openssl-1.0.1q" "https://www.openssl.org/source/openssl-1.0.1q.tar.gz#b3658b84e9ea606a5ded3c972a5517cd785282e7ea86b20c78aa4b773a047fb7" mac_openssl --if has_broken_mac_openssl
install_package "ruby-2.2.3" "https://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.3.tar.bz2#c745cb98b29127d7f19f1bf9e0a63c384736f4d303b83c4f4bda3c2ee3c5e41f" ldflags_dirs standard verify_openssl
```

可择优源路径替换之，如国内使用 taobao 的 ruby 源较快，具体内容请参考：<https://ruby.taobao.org/>

注：此方法甚是暴力，ruby-build 提供系统变量配置方法供指定源码路径用，奈何某试之未遂，尚未细察之原由。

rbenv 将各版本的 ruby 安装于 `~/.rbenv/versions` 目录中，并于 `~/.rbenv/shims` 中生成特定版本 ruby 命令若干，如 `irb`，`rdoc`。若需于全局范围使用指定版本 ruby 解释器，可于 `$PATH` 中添加 `~/.rbenv/shims`。

至于版本配置之事，全局配置使用 `rbenv global`。

使用 `rbenv global x.y.z` 切换版本之后，需使用 `rbenv rehash` 更新 shims 中各命令。

也可于 shell 配置文件中加 `eval "$(rbenv init -)"` 自动配置，执行 `rbenv init -` 即可知其执行之事。某电脑之上为：

```bash
export PATH="/Users/xxx/.rbenv/shims:${PATH}"
export RBENV_SHELL=zsh
source '/usr/local/Cellar/rbenv/1.0.0/libexec/../completions/rbenv.zsh'
command rbenv rehash 2>/dev/null
rbenv() {
  local command
  command="$1"
  if [ "$#" -gt 0 ]; then
    shift
  fi

  case "$command" in
  rehash|shell)
    eval "$(rbenv "sh-$command" "$@")";;
  *)
    command rbenv "$command" "$@";;
  esac
}
```

可知其配置了各式路径，补全，更新了 shims 目录等。

## Rails

使用 gem 安装 rails 甚是简单，gem 会自动处理诸多依赖库。

```bash
gem install rails
```

安装之后，若执行 `rails -v` 有输出版本，即安装成功。