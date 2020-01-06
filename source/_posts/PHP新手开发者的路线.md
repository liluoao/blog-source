---
title: PHP新手开发者的路线
urlname: a-php-developer-roadmap
date: 2018-08-03 16:29:51
category: 杂谈
tags: php
---

## 前言

在昨天（2018-08-02）已经发布了PHP 7.3.0.beta1 版本。如果你还没有使用 PHP7，那真的很遗憾，不仅是性能上的提升，`类型提示` 等特性能够让你更加注重代码质量和提高效率。2018 年 PHP 开发者应该熟练使用 PHP7，且了解各版本更新内容。

<!-- more -->

## 依赖管理

如果你在想使用一个扩展包时，还在下载源码，并尝试修改命名空间来嵌入你的项目中，你应该改变了，使用 Composer 进行依赖管理。

## 使用优秀的包

### Guzzle

Guzzle 是一个 PHP 的 HTTP 客户端，用来轻而易举地发送请求，它的优点有分流上传下载大文件、使用 HTTP cookies、上传 JSON 数据等。

### Carbon

Carbon 是一个继承于 PHP 的 DateTime 类的时间类，让用法更加人性化。可以让你在处理时间时事半功倍，阅读链接： [《Carbon便捷处理时间》](/2018/use-carbon.html)

## NOSQL

### MongoDB

MongoDB 是一个基于分布式文件存储的数据库。它是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的。
以 MongoDB 作为非关系型数据库的开始非常好，可以看 [《PHP7操作MongoDB》](/2018/php-7-use-mongodb.html)

### Redis

Redis 是一个基于内存的Key-Value 数据库，常用于缓存和需求不高的队列。

## 容器

Docker 是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。

## 持续集成

持续集成（Continuous integration）是一种软件开发实践，每次集成都通过自动化的构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误。
本博客也是通过 CI 工具来维护的，步骤详见[《使用持续集成维护博客》](/2018/use-appveyor-ci.html)

## 代码风格

良好的代码规范可以提高代码可读性，降低团队沟通维护成本。PSR（PHP Standard Recommendations）是 PHP 的标准规范，其中 PSR-1 和 PSR-2 是编码风格规范。

## 单元测试

测试对于程序员的重要性不言而喻，PHPUnit 是 PHP 的单元测试包，Laravel 、Yii 等框架都有开箱即用的测试

## 设计模式

推荐阅读清华大学出版社的 Aaron Saray 著《PHP设计模式》
