---
title: 使用依赖管理——以Composer为例
date: 2018-03-18 10:37:19
category: composer
---
中文文档：[http://docs.phpcomposer.com/](http://docs.phpcomposer.com/)

英文文档：[https://getcomposer.org/](https://getcomposer.org/)

## 依赖管理

Composer 不是一个包管理器。是的，它涉及 "packages" 和 "libraries"，但它在每个项目的基础上进行管理，在你项目的某个目录中（例如 `vendor`）进行安装。默认情况下它不会在全局安装任何东西。因此，这仅仅是一个依赖管理。

这种想法并不新鲜，Composer 受到了 node's [npm](http://npmjs.org/) 和 ruby's [bundler](http://gembundler.com/) 的强烈启发。而当时 PHP 下并没有类似的工具。

Composer 将这样为你解决问题：

a\) 你有一个项目依赖于若干个库。

b\) 其中一些库依赖于其他库。

c\) 你声明你所依赖的东西。

d\) Composer 会找出哪个版本的包需要安装，并安装它们（将它们下载到你的项目中）。
<!-- more -->
## 安装Composer

原文链接：[https://pkg.phpcomposer.com/\#how-to-install-composer](https://pkg.phpcomposer.com/#how-to-install-composer)

##### 下载 Composer

> 安装前请务必确保已经正确安装了 [PHP](http://php.net/)。打开命令行窗口并执行 `php -v` 查看是否正确输出版本号。

打开命令行并依次执行下列命令安装最新版本的 Composer：

```bash
php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');"
```

```bash
php composer-setup.php
```

```
php -r "unlink('composer-setup.php');"
```

执行第一条命令下载下来的 `composer-setup.php` 脚本将简单地检测 `php.ini` 中的参数设置，如果某些参数未正确设置则会给出警告；然后下载最新版本的 `composer.phar` 文件到当前目录。

上述 3 条命令的作用依次是：

1. 下载安装脚本 `composer-setup.php`到当前目录。
2. 执行安装过程。
3. 删除安装脚本。

##### 

##### 局部安装

上述下载 Composer 的过程正确执行完毕后，可以将 `composer.phar` 文件复制到任意目录（比如项目根目录下），然后通过 `php composer.phar` 指令即可使用 Composer 了！

##### 

##### 全局安装

全局安装是将 Composer 安装到系统环境变量 `PATH` 所包含的路径下面，然后就能够在命令行窗口中直接执行 `composer` 命令了。

###### Mac 或 Linux 系统：

打开命令行窗口并执行如下命令将前面下载的 `composer.phar` 文件移动到 `/usr/local/bin/` 目录下面：

```bash
sudo mv composer.phar /usr/local/bin/composer
```

###### Windows 系统：

1. 找到并进入 PHP 的安装目录（和你在命令行中执行的 `php`指令应该是同一套 PHP）。
2. 将 `composer.phar` 复制到 PHP 的安装目录下面，也就是和 `php.exe` 在同一级目录。
3. 在 PHP 安装目录下新建一个 `composer.bat`文件，并将下列代码保存到此文件中。

```bash
@php "%~dp0composer.phar" %*
```

最后重新打开一个命令行窗口试一试执行 `composer --version` 看看是否正确输出版本号。

> 提示：不要忘了经常执行 `composer selfupdate` 以保持 Composer 一直是最新版本哦！



## 使用镜像

文档：[https://pkg.phpcomposer.com/\#how-to-use-packagist-mirror](https://pkg.phpcomposer.com/#how-to-use-packagist-mirror) 不再赘述

## Packagist

https://packagist.org/ 是PHP的包存储库，也是Composer 的主要资源库。进入官网注册一个自己的账号（可使用GitHub登录），准备发布自己的包。

## 创建Composer.json

在自己的项目中创建`composer.json`文件，选择将此项目发布为 **library **或是 ** project。**

更多架构可见文档：http://docs.phpcomposer.com/04-schema.html

我的一个 ** library ** 配置：

```
{
    "name": "liluoao/api-doc",
    "description": "Generate API doc from PHPDoc.",
    "keywords": [
        "api-documentation",
        "phpdoc"
    ],
    "homepage": "https://github.com/liluoao/api-doc",
    "time": "2018-02-11",
    "license": "MIT",
    "type": "library",
    "require": {
        "php": ">=5.4.0"
    },
    "authors": [
        {
            "name": "Li Luoao",
            "email": "liluoao@qq.com",
            "homepage": "https://github.com/liluoao",
            "role": "Developer"
        }
    ],
    "autoload": {
        "psr-4": {
            "Liluoao\\ApiDoc\\": "src"
        }
    },
    "repositories": {
        "packagist": {
            "type": "composer",
            "url": "https://packagist.phpcomposer.com"
        }
    }
}
```

## 发布到Packagist

进入 https://packagist.org/packages/submit ，填写你的项目地址。

在你的项目设置中开启packagist服务，让每一次代码更新都自动发布到packagist上：

![](/images/composer-setting.png)最终可以在Packagist上看到如下界面：

![](/images/packagist-final.png)

