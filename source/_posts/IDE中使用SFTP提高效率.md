---
title: IDE中使用SFTP提高效率
urlname: phpstorm-use-ftp
date: 2018-02-04 16:51:42
category: 工具
tags: tool
photos: /images/remote-host.png
---

## 前言

在开发时如果需要实时将文件同步到服务器上，可能需要用 Xftp 等软件来实现。
这样需要在几个界面来回切换，比较耗时。其实 IDE 已经为你实现了这个功能。

<!-- more -->

## 步骤

打开PHPStorm，点击 `Tools—>Deployment—>Cofiguration`

![配置位置](/images/phpstorm-ftp.png)

依次填入项目名称，FTP主机地址，用户名，密码，项目的浏览器访问地址，然后点击 `Test FTP connection` 测试是否连接成功

![输入SFTP配置](/images/ftp-config.png)
