---
title: Linux搭建环境
urlname: linux-environment
date: 2018-03-04 09:09:04
category: 服务器
tags: linux
---

在阿里云买了个低配云服务器，系统为Ubuntu 16.4，需要安装基础环境。

## 更新源
阿里云已配置好了源，直接更新就行。
```bash
sudo apt-get update
```
## 安装Nginx/Apache
```bash
sudo apt-get install nginx
sudo apt-get install apache2
```
根据提示符，输入“Y” 确认后，开始安装软件，直至软件安装完成。

软件安装完成后，通过通过 `dpkg -L` 列出软件包所在的目录，及该软件包中的所有文件：
```bash
dpkg -L nginx
```
<!-- more -->
## 启动Apache
```bash
sudo /etc/init.d/apache2 start
```
重启 `restart`，停止 `stop`。

## 安装Git
```bash
sudo apt-get install git
```
生成 **SSH key**
```bash
ssh-keygen -t rsa -C "你的用户名"
```
第一次提示你想将 `key` 保存到哪里，直接回车代表使用默认的 `/.ssh/id_rsa`

第二次提示你设置一个口令密码，直接回车代表设为空

第三次重复第二次的密码

进入 `key` 保存位置，打开 `id_rsa.pub` 
```bash
vi id_rsa.pub
```
全部复制后大写模式2下Z退出编辑。

进入 **GitHub** ，打开个人 `Settings`，点击 `SSH and GPG keys` 选项卡，点击 `New SSH key` 按钮，将复制的 `key` 粘贴进去，取个能识别平台的标题，保存。

回到命令行，测试 **SSH key** 是否配置成功：
```bash
ssh -T git@github.com
```
出现如下信息则说明成功与 **GitHub** 连接：
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access
```

配置 **Git** 的用户名和邮箱：
```bash
git config --global user.name "用户名"
git config --global user.email "邮箱"
```

查看配置信息：
```bash
git config user.name
git config user.email
```

