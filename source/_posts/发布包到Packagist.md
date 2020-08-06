---
title: 发布包到Packagist
urlname: upload-library-to-packagist
date: 2018-03-18 10:37:19
category: 工具
tags: tool
photos: /images/packagist-final.png
---

作为 PHP 使用者，平常会接触到 Composer 与很多包。如何发布一个自己的包让别人使用呢，下面介绍下实现步骤。

<!-- more -->

## Composer 介绍

Composer 是 PHP 的依赖管理工具，它为你解决这类问题：

1. 你有一个项目依赖于若干个库
2. 其中一些库依赖于其他库
3. 你声明你所依赖的东西
4. 找出哪个版本的包需要安装，并安装它们（将它们下载到你的项目中）

Composer 的安装方式见[文档](https://docs.phpcomposer.com/00-intro.html)

## composer.json

要想使用 Composer，就必须要一个 *composer.json* 文件，该文件包含了项目的依赖和其它的一些元数据。
下面以我的一个项目配置为例：

```json
{
    //项目名 require时填
    "name": "liluoao/api-doc",
    //描述
    "description": "Generate API doc from PHPDoc.",
    //关键字
    "keywords": [
        "api-documentation",
        "phpdoc"
    ],
    //项目主页
    "homepage": "https://github.com/liluoao/api-doc",
    //发布时间
    "time": "2018-02-11",
    //许可
    "license": "MIT",
    //分为library包和project项目
    "type": "library",
    //要求 包括环境与依赖包
    "require": {
        "php": ">=5.4.0"
    },
    //作者信息
    "authors": [
        {
            "name": "Li Luoao",
            "email": "liluoao@qq.com",
            "homepage": "https://github.com/liluoao",
            "role": "Developer"
        }
    ],
    //自动加载
    "autoload": {
        "psr-4": {
            "Liluoao\\ApiDoc\\": "src"
        }
    },
    //镜像
    "repositories": {
        "packagist": {
            "type": "composer",
            "url": "https://packagist.phpcomposer.com"
        }
    }
}
```

## Packagist 与发布包

[Packagist](https://packagist.org/) 是包存储库，也是 Composer 的主要资源库。
在发布自己的包前，先注册一个账号，也可使用 GitHub 直接登录。

在 [Submit页](https://packagist.org/packages/submit) 填写你的项目地址。
并在你的项目设置中开启 packagist 服务，让代码更新都自动同步：

![GitHub项目开启服务](/images/composer-setting.png)

以上面例子项目发布成功后结果如文章封面图所示

## 镜像

由于网络原因，下载包的速度很慢，可以替换为国内镜像提高速度：[Packagist 镜像使用方法](https://pkg.phpcomposer.com/#how-to-use-packagist-mirror)

更新：
[《Laravel China 镜像完成历史使命，将于两个月后停用》](https://learnku.com/articles/30758)
[《Composer 国内加速：可用镜像列表 》](https://learnku.com/php/wikis/30594)
