---
title: 人人都说Mac好
date: 2020-12-19 14:58:53
urlname: workspace-enviroment-backup
category: 杂谈
---

![macbook pro](https://i.imgtg.com/2022/08/24/K3BXY.png)

<!-- more -->

入职配的新 Mac Pro 坏了，换了一台旧的 Air，没用多久就修好了。然后又换了台新 Pro 用，今天记录下要装的东西。

> 2021-10更新，自己买了台真香，用迁移助理就搞定了🥶

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

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后装好 `wget`，并下载咱的基础容器

```
brew install wget
wget 'http://what/is/this.tar'
```

下载 [Docker](https://www.docker.com/products/docker-desktop)，初始化下好的容器

```
tar -xvf rpc.tar
cd rpc-app-base
docker-compose up -d
```

Git 设置下用户名，在公司里用花名🤣

```
git config --global user.name "斯内普"
```

## PHP

如果需要 8，可以用 [shivammathur](https://github.com/shivammathur/homebrew-php) 的 tap

```
brew tap shivammathur/php
```

选择咱需要的 7.4

```
brew install php@7.4
```

安装 `Composer` 并回退版本（部分项目依赖需要）

```
brew install composer
composer self-update --1

composer config -g repo.packagist composer https://packagist.phpcomposer.com
```

## Apache

有个项目独立在微服务外，那就安排个 Web 服务器

```
brew install httpd
brew services start httpd
```

此时访问 `http://localhost:8080` 可以看到 `It works!`

现在编辑下 Apache 的配置

```
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

```
sudo apachectl restart
```

## PHP扩展

安装 `SSH2` 扩展（传文件的业务）

```
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

```
open -e /usr/local/etc/php/7.4/php.ini
```

## 博客

顺便装下咱这个项目需要的环境

```
brew install node
node -v
npm -v

npm install
npm install hexo-cli -g
```

下载子模块（主题）

```
git submodule init
git submodule update
```
