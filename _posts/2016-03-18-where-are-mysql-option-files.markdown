---
layout: post
title: Where are mysql option files (my.cnf)?
date: 2016-03-18 13:39
author: Gavin
category: blog
tags:
  - MySQL
  - Database
slug: where-are-mysql-option-files
---

新配项目环境，把 MySQL 装起来了，brew 装 MySQL 倒是方便，由于旧项目依然是用了旧版本的 MySQL，所以安装了 MySQL 5.5：

```bash
brew install homebrew/versions/mysql55
mysql.server start
```

之后自己配置了一些参数，然而项目跑起来之后，配置的参数始终不见生效，重启 MySQL 了也不行，当时想到大概两点可能：

1. 配置文件写错了
2. 配置文件没有生效

但是配置文件出错的话，`mysql.server start` 是会报错的，看来配置文件并没有报错。那么就是没有加载到我配置的文件。
多半是配置文件放错了地方。

据查官方文档 [Using Option Files](http://dev.mysql.com/doc/refman/5.5/en/option-files.html)，
如果没有自定义的配置文件，MySQL 会自己试用默认的配置，这种情况下无需配置文件。
使用 `mysql --help` 参数可以查看，在我的机器上面，配置文件部分如下：

```text
...blahblah...
Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf /usr/local/etc/my.cnf ~/.my.cnf
The following groups are read: mysql client
The following options may be given as the first argument:
--print-defaults        Print the program argument list and exit.
--no-defaults           Don't read default options from any option file.
--defaults-file=#       Only read default options from the given file #.
--defaults-extra-file=# Read this file after the global files are read.
...blahblah...
```

在 Windows 上读取配置的位置和顺序如下：

1. `%PROGRAMDATA%\MySQL\MySQL Server 5.5\my.ini, %PROGRAMDATA%\MySQL\MySQL Server 5.5\my.cnf`
2. `%WINDIR%\my.ini, %WINDIR%\my.cnf`
3. `C:\my.ini, C:\my.cnf`
4. `INSTALLDIR\my.ini, INSTALLDIR\my.cnf`
5. `--defaults-extra-file` 指定的配置文件

> tips:
> `%PROGRAMDATA%` 在 Vista 以后默认是 `C:\ProgramData`，之前版本是 `C:\Documents and Settings\All Users\Application Data`。
> `%WINDIR%` 是 `C:|Windows`
> `INSTALLDIR` 是 MySQL 的安装路径

在 ＊nix 系统上则是：

1. `/etc/my.cnf`
2. `/etc/mysql/my.cnf`
3. `SYSCONFDIR/my.cnf`
4. `$MYSQL_HOME/my.cnf`
5. `--defaults-extra-file` 指定的配置文件
6. `~/.my.cnf`

brew 安装的 MySQL 提供了启动脚本，其中设置了 `basedir` 为安装目录，默认为 `/usr/local/Cellar/mysql55/5.5.44`。
而 `$MYSQL_HOME` 一般就是 `basedir`，具体判断逻辑可以仔细看文档。
最重我们选择在这里配置 MySQL，因为这个目录不像 `/etc`，不需要使用管理员权限。

这里还有一个帖子也讨论了 MySQL 的配置文件路径问题，各位也可以一看：<http://stackoverflow.com/questions/10757169/mysql-my-cnf-location>

然而 MySQL 又一次打脸，配置项还是没有起作用……
最后发现我们配置的配置项只能放到 `[mysqld]` 下面，放错地方了 (╯‵□′)╯︵┻━┻