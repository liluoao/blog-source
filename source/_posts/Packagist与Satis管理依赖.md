---
title: Packagist与Satis管理依赖
urlname: dependency-management-with-packagist-and-satis
date: 2018-03-18 10:37:19
category: 工具
tags: tool
photos: /images/packagist.png
---

作为 PHP 使用者，平常会接触到 Composer 与很多包。如何发布一个自己的包让别人使用呢，下面介绍下实现步骤。

<!-- more -->

## Composer 介绍

[Composer](https://docs.phpcomposer.com/00-intro.html) 是 PHP 的依赖管理工具，它为你解决这类问题：

- 你有一个项目依赖于若干个库
- 其中一些库依赖于其他库
- 你声明你所依赖的东西
- 找出哪个版本的包需要安装，并安装它们（将它们下载到你的项目中）

要想使用 Composer，就必须要一个 *composer.json* 文件，该文件包含了项目的依赖和其它的一些元数据

下面是项目配置示例：

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

以上面例子项目发布成功后结果如下图所示

![成功示例](/images/packagist-final.png)

## 镜像

由于网络原因，下载包的速度很慢，可以替换为国内镜像提高速度：[Packagist 镜像使用方法](https://pkg.phpcomposer.com/#how-to-use-packagist-mirror)

更新：
[《Laravel China 镜像完成历史使命，将于两个月后停用》](https://learnku.com/articles/30758)
[《Composer 国内加速：可用镜像列表 》](https://learnku.com/php/wikis/30594)

## 用 Satis 处理私有资源包

以下为入职同花顺后更新

- 由于公司的架构是内外网分离，开发在内部局域网，无法拉取到公网的 Packagist
- 顺便维护一些私有的包

好在 Composer 官方提供了这样的静态代码库生成器——[Satis](https://docs.phpcomposer.com/articles/handling-private-packages-with-satis.html)

```
composer create-project composer/satis --stability=dev --keep-vcs
```

Satis 的配置是通过 satis.json 进行的

```json satis.json
{
  "name": "crm",
  "homepage": "http://10.0.20.252:10450",//本项目地址，生成后可访问
  "config": {
    "disable-tls": true,
    "secure-http": false
  },
  //镜像缓存设置，该设置会缓存require配置项中各个仓库的代码
  "archive": {
    "directory": "dist"//目录名
  },
  "require": {
    "monolog/monolog": "1.24.0"
    //...
  },
  "require-all": false,//为true时将从仓库获取所有相关的依赖包
  "repositories": [
    {
      "type": "git",
      "url": "http://10.0.20.254:10080/library/monolog/monolog.git"
    }
    //...
  ]
}
```

生成项目

```
php bin/satis build satis.json public/
# 添加新的repo
php bin/satis add http://10.0.20.254:10080/library/guzzlehttp/guzzle.git satis.json
```

使用静态库时修改 composer.json 文件

```json composer.json
{
  "repositories": [
    {
      "packagist": false
    },
    {
      "type": "composer",
      "url": "http://10.0.20.252:10450"
    } 
  ],
  "config": {
      "disable-tls": true,
      "secure-http": false//非HTTPS
  }
}
```
