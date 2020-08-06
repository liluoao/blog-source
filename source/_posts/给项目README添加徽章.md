---
title: 给项目README添加徽章
urlname: add-project-badge
date: 2018-02-03 14:47:05
category: 工具
tags: tool
photos: /images/badge-style.png
---

在许多项目的 `README` 中，我们经常会看到下面这种 `徽章（Badge）`，这是如何制作的呢？

<!-- more -->

- CI结果
[![AppVeyor](https://img.shields.io/appveyor/ci/liluoao/blog-source.svg?longCache=true&logo=appveyor)](https://ci.appveyor.com/project/liluoao/blog-source)
- 项目许可
[![license](https://img.shields.io/github/license/liluoao/blog-source.svg?longCache=true)](https://github.com/liluoao/blog-source/blob/master/LICENSE)
- 项目版本
[![Packagist](https://img.shields.io/packagist/v/liluoao/phalcon.svg?longCache=true)](https://packagist.org/packages/liluoao/phalcon)
- 包/环境版本要求
[![PHP 版本](https://img.shields.io/packagist/php-v/liluoao/phalcon.svg?longCache=true)](https://packagist.org/packages/liluoao/phalcon)

这些 SVG 图标的来源都是 [Shields.io](https://shields.io/) 

## 自定义

**shields.io** 提供了自定义 `Badge` 的格式：

```html
https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg
```

> 多个中划线、下划线只保留1个

## 样式

**shields.io** 提供了 5 种样式的徽章，分别为

- *plastic*
- *flat*
- *flat-square*
- *for-the-badge*
- *social*

以参数 *style=xx* 拼接在后面即可

## 效果

 3 个自定义例子：

[![Email](https://img.shields.io/badge/%E9%82%AE%E7%AE%B1-liluoao%40qq.com-orange.svg?longCache=true&style=flat-square)](mailto:liluoao@qq.com)
[![SegmentFault](https://img.shields.io/badge/SegmentFault-李罗奥-brightgreen.svg?longCache=true&style=flat-square)](https://segmentfault.com/u/liluoao)
[![Juejin](https://img.shields.io/badge/掘金-李罗奥-blue.svg?longCache=true&style=flat-square)](https://juejin.im/user/5a19374cf265da4332274600)
