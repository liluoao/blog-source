---
title: 人人都说Mac好
date: 2020-12-19 14:58:53
urlname: workspace-enviroment-backup
category: 工具
---

## Mac 优势

### Unix操作系统

Mac 电脑的操作系统是 Unix 操作系统的一个变种。Unix 是一个非常强大的操作系统，因为它具有广泛的应用程序支持和大量的工具和库

Unix 操作系统在程序员社区中非常流行，因为它提供了更好的编程环境。因此，程序员可以更容易地使用许多强大的工具和库来编写代码

<!-- more -->

### 易用性

Mac 电脑有着非常优秀的用户界面和易用性，这对于程序员来说非常重要。Mac 电脑可以让程序员更加专注于编程，而不是担心电脑的一些问题

此外，Mac 电脑提供了一些非常有用的工具，例如终端、编辑器和调试器，这些工具可以帮助程序员更好地编写和调试代码

### 开发环境

Mac 电脑是专业的开发环境。Apple 提供了一些非常好的开发工具，例如 Xcode 和 Swift Playground。这些工具可以帮助程序员更好地编写代码、构建应用程序，并进行调试

此外，Mac 电脑还支持许多其他的开发工具和框架，如 Java、Python、Ruby 和 PHP 等

### 设计

许多程序员也喜欢 Mac 电脑的设计。Mac 电脑有着简洁、流畅、漂亮的外观，让人感到愉悦。设计感非常强，这也是许多程序员选择 Mac 电脑的原因之一

### 社区支持

Mac 电脑的程序员社区非常庞大和活跃。这意味着程序员可以得到更好的技术支持，并可以轻松地获取各种资源和教程

这对于新手程序员来说非常有帮助，因为他们可以从社区中获得许多有用的信息，以帮助他们更好地学习编程。

![macbook pro](https://i.imgtg.com/2022/08/24/K3BXY.png)

入职配的新 Mac Pro(No.1) 坏了，换了一台旧的 Air(No.2)，没用多久就修好了。然后又换了台新 Pro(No.3) 用，今天记录下要装的东西。

> 2021-10更新，自己买了台真香(No.4)，用迁移助理就搞定了🥶

## 基础

默认已安装了

- [PhpStorm](https://www.jetbrains.com/phpstorm/download/)
- [DataGrip](https://www.jetbrains.com/datagrip/download/)
- [Postman](https://www.postman.com/downloads/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Sublime Text](https://www.sublimetext.com/)
- [Typora](https://typora.io/)
- [XMind](https://www.xmind.cn/)

先下个 Chrome 把书签同步回来，咱需要用到 [ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG) 来登录

安装 XCode Command Line Tools

```bash
xcode-select --install
```

下载 [Homebrew](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后装好 `wget`，并下载咱的基础容器

```bash
brew install wget
wget 'http://what/is/this.tar'
```

下载 [Docker](https://www.docker.com/products/docker-desktop)，初始化下好的容器

```bash
tar -xvf rpc.tar
cd rpc-app-base
docker-compose up -d
```

Git 设置下用户名，在公司里用花名🤣

```bash
git config --global user.name "斯内普"
```

## PHP

如果需要 8，可以用 [shivammathur](https://github.com/shivammathur/homebrew-php) 的 tap

```bash
brew tap shivammathur/php
```

选择咱需要的 7.4

```bash
brew install php@7.4
```

安装 `Composer` 并回退版本（部分项目依赖需要）

```bash
brew install composer
composer self-update --1

composer config -g repo.packagist composer https://packagist.phpcomposer.com
```

## Apache

有个项目独立在微服务外，那就安排个 Web 服务器

```bash
brew install httpd
brew services start httpd
```

此时访问 `http://localhost:8080` 可以看到 `It works!`

现在编辑下 Apache 的配置

```bash
open -e /usr/local/etc/httpd/httpd.conf
```

就这么几个需要改的：

```conf
Listen 80

LoadModule rewrite_module lib/httpd/modules/mod_rewrite.so
LoadModule php7_module /usr/local/opt/php@7.4/lib/httpd/modules/libphp7.so

ServerName localhost

DocumentRoot /Users/your_user/Sites
<Directory "/Users/your_user/Sites">
    AllowOverride All
</Directory>

<IfModule dir_module>
    DirectoryIndex index.php index.html
</IfModule>

<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>
```

最后重启下服务

```bash
sudo apachectl restart
```

## PHP扩展

安装 `SSH2` 扩展（传文件的业务）

```bash
brew install libssh2

cd ~/Downloads
git clone https://git.php.net/repository/pecl/networking/ssh2.git
cd ssh2
phpize
./configure
make
make install
```

把扩展 `extension="ssh2.so"` 写到配置文件中：

```bash
open -e /usr/local/etc/php/7.4/php.ini
```

## 博客

顺便装下咱这个项目需要的环境

```bash
brew install node
node -v
npm -v

npm install
npm install hexo-cli -g
```

下载子模块（主题）

```bash
git submodule init
git submodule update
```
