---
title: PHP开发者的路线
urlname: a-php-developer-roadmap
date: 2018-08-03 16:29:51
tags: php
---
## 前言
在昨天（`2018-08-02`）已经发布了[PHP 7.3.0.beta1 Released](http://php.net/archive/2018.php#id2018-08-02-1)

如果你还没有使用 **PHP7** ，那真的很遗憾。2018年PHP开发者应该熟练使用 PHP7，并且知道版本更新内容。

## 使用Composer
如果你在想使用一个扩展包时，还在下载源码，并尝试修改命名空间来嵌入你的项目中，你应该改变了。
至少应该使用 **Composer** 进行依赖管理，可以看看我以前写的 [《使用Composer管理依赖》](/2018/use-composer.html)

## 使用Guzzle
**Guzzle** 是一个 PHP 的 HTTP 客户端，用来轻而易举地发送请求，并集成到我们的 WEB 服务上。
它的优点有构建查询语句、`POST` 请求、分流上传下载大文件、使用 `HTTP cookies`、上传 `JSON` 数据等等。
[《Guzzle中文文档》](http://guzzle-cn.readthedocs.io/zh_CN/latest/index.html)

## 使用Carbon
**Carbon** 是一个继承于 PHP 的 `DateTime` 类的时间类，让用法更加人性化
可以让你在处理时间时事半功倍，可以看看我以前写的 [《使用Carbon》](/2018/use-carbon.html)

## 使用MongoDB
**MongoDB** 是一个基于分布式文件存储的数据库。由 C++ 语言编写。旨在为 WEB 应用提供可扩展的高性能数据存储解决方案。
**MongoDB** 是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的。
以 MongoDB 作为非关系型数据库的开始非常好，可以看 [《PHP7操作MongoDB》](http://localhost:4000/2018/php-7-use-mongodb.html)

## 使用Redis
**Redis** 是一个可基于内存亦可持久化的日志型、`Key-Value` 数据库，常用于需求不高的队列

## 使用Docker
**Docker** 是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。
**Docker** 入门可以从这里开始 [《什么是Docker》](http://www.docker.org.cn/book/docker/what-is-docker-16.html)

## 持续集成
持续集成（Continuous integration）是一种软件开发实践，即团队开发成员经常集成他们的工作，通过每个成员每天至少集成一次，也就意味着每天可能会发生多次集成。每次集成都通过自动化的构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误。
集成工具很多，流行的有 **[Jenkins](https://jenkins.io/doc/)**，**[Travis CI](https://www.travis-ci.org/)**
我博客用的 [《使用AppVeyor持续集成本博客》](/2018/use-appveyor-ci.html)

## 代码风格
良好的代码规范可以提高代码可读性，降低团队沟通维护成本。
**PSR**（PHP Standard Recommendations）是 [PHP 标准规范](http://psr.phphub.org/) ，是 PHP 开发的实践标准。
其中 [PSR-1](https://laravel-china.org/topics/2078/psr-specification-psr-1-basic-coding-specification) 和 [PSR-2](https://laravel-china.org/topics/2079/psr-specification-psr-2-coding-style-specification) 是编码风格规范。
**[StyleCI](https://docs.styleci.io/)** 提供 PHP 代码风格持续集成服务

## 单元测试
测试对于程序员的重要性不言而喻
**[PHPUnit](http://www.phpunit.cn/manual/6.5/zh_cn/index.html)** 是 PHP 单元测试包，由 [Sebastian Bergmann](https://github.com/sebastianbergmann) 开发
Laravel 有开箱即用的测试： [《在Laravel中测试》](https://www.jianshu.com/p/d8b3ac2c4623)

## 微信开发
PHP 由于它的特点，在开发微信上非常方便，也被作为开发首选。
对于未接触过 **OAuth2.0** 或者是不理解 **RESTful API** 的开发者，这是一个很好的学习机会，可以看看[《微信网页授权》](/2018/wechat-authorize-web.html)
[《微信公众平台文档》](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432)
[《微信支付文档》](https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=5_1)
[《企业微信开发文档》](https://work.weixin.qq.com/api/doc)
也可以看看[《我所理解的接口设计（转）》](/2018/how-i-understand-restful-api.html)

## 其它
开发中应该遵循的[《SOLID原则》](/2018/php-solid.html)
通过分库、分表等方式来[《MySQL优化》](http://blog.51cto.com/lizhenliang/2095526)
需要了解的[《什么是 JWT（转）》](/2018/what-is-jwt.html)
设计模式，包括[创建模式](/2018/php-creational-design-patterns.html)（Creational Patterns）、[架构模式](/2018/php-structural-design-patterns-part1.html)（Structural Patterns）、[行为模式](/2018/php-behavioral-design-patterns-part1.html)（Behavioral Patterns）