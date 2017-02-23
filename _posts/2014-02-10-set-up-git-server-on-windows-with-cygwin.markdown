---
layout: post
title: 在Windows上用Cygwin建立Git服务器
date: 2014-2-10 15:42
author: Gavin
category: blog
tags:
  - Git
  - Cygwin
  - SSH
  - Windows
slug: set-up-git-server-on-windows-with-cygwin
---

最近在做一个项目，不知我一个人。由于某些原因不便于放在公网上，那么代码同步最好就选用版本控制软件，最为Git的粉丝，最终选择使用Git。从来没有搭过Git服务器，今天就学习学习。

在Windows上搭建Git服务器可以使用Python写的Gitosis，和其Perl重写版本Gitolite，功能很强大。这里用的Gitolite，下次试试Gitosis。并且他们管理repo，用户权限等都是通过Git自己来实现的，超级方便，稍后再说。先来看看怎么搭服务器。

我是在Cygwin上搭建的，环境为64位Win7，其他的版本请触类旁通 + Google。

## 安装Cygwin
安装步骤略去，选择安装的包时选中 `Net > openssh`，`Devel > git`，其他的看自己需要。

## 搭建SSH服务器

### 与Windows安全机制集成
Cygwin会使用带密码的Windows用户模拟SSH用户，所以在安装SSH服务器前需要和Windows安全机制集成。在Cygwin文档中的[Integrationg with Windows Security](http://www.cygwin.com/cygwin-ug-net/ntsec.html)里面有更详细的解释。

下面就以我的电脑为例子在上面搭建git服务器（计算机名为Mao）

1. 用管理员权限打开Cygwin终端，比如我的电脑上的就是这样

```text
gavin@Mao ~
$
```

2. 运行`/bin/cyglsa-config`

```text
Warning: Registering the Cygwin LSA authentication package requires administrator
privileges! You also have to reboot the machine to activate the change.

Are you sure you want to continue? (yes/no)
```

3. 输入`yes`并且重启机器

```text
Cygwin LSA authentication package registered.

Activating Cygwin's LSA authentication package requires to reboot.
```

### 搭建SSH服务器

SSH服务器会加密并验证Git repo，他通过公钥验证访问服务器的用户。一旦用户通过SSH验证，Gitolite就会接手请求。接上步，重启之后：

1. 以管理员权限运行Cygwin终端，并运行`ssh-host-config`

```text
gavin@Mao ~
$ ssh-host-config
*** Info: Generating /etc/ssh_host_key
*** Info: Generating /etc/ssh_host_rsa_key
*** Info: Generating /etc/ssh_host_dsa_key
*** Info: Creating default /etc/ssh_config file
*** Info: Creating default /etc/sshd_config file
*** Info: Privilege separation is set to yes by default since OpenSSH 3.3.
*** Info: However, this requires a non-privileged account called 'sshd'.
*** Info: For more info on privilege separation read /usr/share/doc/openssh/README.privsep.
*** Query: Should privilege separation be used? (yes/no)
```

2. 输入`yes`

```text
*** Info: Note that creating a new user requires that the current account have
*** Info: Administrator privileges.  Should this script attempt to create a
*** Query: new local account 'sshd'? (yes/no)
```

3. 输入`yes`

```text
*** Info: Updating /etc/sshd_config file


*** Warning: The following functions require administrator privileges!

*** Query: Do you want to install sshd as a service?
*** Query: (Say "no" if it is already installed as a service) (yes/no)
```

4. 输入`yes`

```text
*** Query: Enter the value of CYGWIN for the daemon: []
```

5. 敲回车

```text
*** Info: On Windows Server 2003, Windows Vista, and above, the
*** Info: SYSTEM account cannot setuid to other users -- a capability
*** Info: sshd requires.  You need to have or to create a privileged
*** Info: account.  This script will help you do so.

*** Info: You appear to be running Windows XP 64bits or later.  On XP
*** Info: and later systems, it's not possible to use the LocalSystem
*** Info: account for services that can change the user id without an
*** Info: explicit password (such as passwordless logins [e.g. public key
*** Info: authentication] via sshd).

*** Info: If you want to enable that functionality, it's required to create
*** Info: a new account with special privileges (unless a similar account
*** Info: already exists). This account is then used to run these special
*** Info: servers.

*** Info: Note that creating a new user requires that the current account
*** Info: have Administrator privileges itself.

*** Info: No privileged account could be found.

*** Info: This script plans to use 'cyg_server'.
*** Info: 'cyg_server' will only be used by registered services.
*** Query: Do you want to use a different name? (yes/no)
```

6. 输入`no`

```text
*** Query: Create new privileged user account 'cyg_server'? (yes/no)
```

7. 输入`yes`

```text
*** Info: Please enter a password for new user cyg_server.  Please be sure
*** Info: that this password matches the password rules given on your system.
*** Info: Entering no password will exit the configuration.
*** Query: Please enter the password:
```

8. 这里是为SSH服务账号设置密码
9. 为Windows防火墙开22端口的例外

```bat
netsh advfirewall firewall add rule dir=in action=allow localport=22 protocol=tcp name="Cygwin SSHD"
```

10. 运行`sc start sshd`开启sshd服务


### 启用SSH客户端访问

现在允许git用户访问SSH，该用户会被用来访问repo。

1. 新建Windows用户git，并设置密码
2. 在Cygwin终端中执行`mkpasswd -l -u git >> /etc/passwd`

服务器端就完成了，现在找一台当客户端的电脑，就用当前电脑的另外一个账户也行。找另外一台电脑请保证可以访问到当服务器的电脑。我用的就是当前电脑。

## 客户端配置

### 验证SSH密钥访问

1. 在客户端电脑上打开Cygwin终端，执行`ssh git@Mao`

```text
gavin@Mao ~
$ ssh git@Mao
The authenticity of host 'Mao (192.168.1.100)' can't be established.
RSA key fingerprint is 13:16:ba:00:d3:ac:d6:f2:bf:36:f4:28:df:fc:d5:26.
Are you sure you want to continue connecting (yes/no)?
```

2. 输入`yes`

```text
Warning: Permanently added 'Mao (192.168.1.100)' (RSA) to the list of known hosts.
git@Mao's password:
```

3. 输入git账户密码会登录到git服务器上

```text
git@Mao ~
$
```


### 创建SSH身份

1. 生成自己的SSH密钥公钥对

```text
gavin@Mao ~
$ ssh-keygen -t rsa
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/gavin/.ssh/id_rsa): [Press enter]
$ ssh-add id_rsa
```

2. 输入密码，并确认，结果大致如下

```text
Enter passphrase (empty for no passphrase): [Type a passphrase]
Enter same passphrase again: [Type passphrase again]
Your identification has been saved in /c/Users/gavin/.ssh/id_rsa.
Your public key has been saved in /c/Users/gavin/.ssh/id_rsa.pub.
The key fingerprint is:
...
```

2. 执行`ssh-keygen -f ~/.ssh/gitolite-admin`，创建远程登录到git服务器上的公钥密钥，后面安装会用到


### 让SSH服务器知道自己的SSH身份

为了可以使用我的SSH身份gitolite-admin以git用户身份登录到git服务器上去，执行`ssh-copy-id -i ~/.ssh/gitolite-admin git@Mao`。这个命令会将gitolite-admin公钥加到git账户的已验证密钥里面

```text
gavin@Mao ~
$ ssh-copy-id -i ~/.ssh/gitolite-admin git@Mao
git@Mao's password:
Now try logging into the machine, with "ssh 'git@Mao'", and check in:

  .ssh/authorized_keys

to make sure we haven't added extra keys that you weren't expecting.
```

想要检查验证是否有效，验证下面的过程是否需要输入密码，正常的话不需要密码

```text
gavin@Mao ~
$ ssh -i ~/.ssh/gitolite-admin git@Mao
Last login: Fri Mar 26 02:04:40 2010 from mao

git@Mao ~
$
```

##安装Gitolite

1. 将非管理员的公钥拷贝到服务器上

```text
$ scp -i ~/.ssh/gitolite-admin ~/.ssh/id_rsa.pub git@Mao:gavin
```

2. 登录到git服务器上

```text
$ scp -i ~/.ssh/gitolite-admin git@Mao
```

3. 将`/home/git/bin`添加到环境变量中，有很多方法，比如在`.bashrc`末尾增加`PATH=/home/git/bin:$PATH`，并`source .bashrc`
4. 安装Gitolite，获取Gitolite的代码，里面有`README.txt`介绍了安装方法，大概为

```text
git@Mao ~
$ git clone git://github.com/sitaramc/gitolite
...
$ mkdir -p $HOME/bin
$ gitolite/install -to $HOME/bin
$ gitolite setup -pk gavin.pub
```


## 使用Gitolite

其实在`README.txt`里面有个简单介绍，哈哈。更详细的请参考[Gitolite的官方网站](http://gitolite.com/gitolite/index.html)。

不用手动在服务器上面啊添加用户和repo，Gitolite是通过一个特殊的repo来管理用户权限和其他repo的，叫'gitoite-admin'。想管理用户权限和repo，在gitolite-admin中做更改然后push到服务器上就行了。