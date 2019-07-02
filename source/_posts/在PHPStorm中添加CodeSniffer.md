---
title: 在PHPStorm中添加CodeSniffer
urlname: use-code-sniffer-in-phpstorm
date: 2019-07-02 14:25:53
tags: tool
---

## 代码规范

在一个多人合作的项目中，使用同一份代码规范是非常重要的。风格混乱不统一会造成阅读困难、工作交接困难、增加 Review 成本等问题，还可能会造成潜在的 Bug。

保持良好的规范也可以从侧面反映出工作严谨（没有暗示）。

## PSR2

[PSR1](https://github.com/PizzaLiu/PHP-FIG/blob/master/PSR-1-basic-coding-standard-cn.md) 和 [PSR2](https://github.com/PizzaLiu/PHP-FIG/blob/master/PSR-2-coding-style-guide-cn.md) 是 PSR 中对于样式的规范，PSR2 也是基于 PSR1，所以文章的目标是让项目代码格式符合 PSR2。

## PHPStorm 的 CodeStyle

Code Style 是你格式化代码时依据的规范。

当你修改了一段代码，想要 Commit 的时候，建议先选中你的代码使用 `CTRL+ALT+L` 格式化一下（非常熟悉后写出来的就是格式了）。
<!-- more -->

![Code Style](/images/phpstorm-psr2.png)

> 每行的字符数应该软性保持在80个之内， 理论上一定不可多于120个

如果觉得换行的位置太前了（例如用带鱼屏写代码233），可以在 `Wrapping and Braces` 选项卡中适当修改 `Hard wrap at` 值大小。

这个可以有一定的效果，但是不能完全达到我们的目标。

## PHP_CodeSniffer 介绍

[PHP_CodeSniffer](https://pear.php.net/package/PHP_CodeSniffer/) 是一个开源工具，能够检测出不符合规范的代码并发出警告或报错（可设置报错等级）。

- Q：通过这个工具我们能达到什么效果？
- A：类似于原生代码错误的提示（IDE标红），鼠标移到上面时会显示错误的内容。

## PHP_CodeSniffer 使用

首先使用 Composer 全局安装：

```composer
composer global require "squizlabs/php_codesniffer=*"
```

安装好后会在 Composer 目录的 */vendor/bin* 下生成可执行文件，例如 *phpcs.bat*。

- 步骤1：打开 PHPStorm 进入设置页
- 步骤2：接着点击 Languages & Frameworks -> PHP -> Code Sniffer，点击 Configuration 右侧的按钮，
- 步骤3：选择 *PHP Code Sniffer (phpcs) path:* 的路径，就是刚才生成的那个 *phpcs.bat* 的路径。
- 步骤4：选择之后 **点击Validate提示验证成功**
- 步骤5：点击Editor->Inspections（或者点右下角的小医生图标，再点 Configure inspections）展开后点击右侧的PHP
- 步骤6：勾选PHP Code Sniffer Validation，选择右侧的PSR2（没有时点击刷新按钮）
- 步骤7：点击验证成功

![步骤1、2、3、4](/images/phpcs1.png)

> 如果PHP文件过长，会频繁出现超时错误，需要修改 timeout 值，最大 30（秒）
> 最大提示数量也一样，最大 100

![步骤5、6、7](/images/phpcs2.png)

> IDE版本不同菜单会有所不同，直接搜索菜单名即可

成功后代码里会出现对应的提示

![效果](/images/phpcs3.png)

> 为了和 IDE 已有的 Warning 区分开，可以设置定制的 Severity，例如为提示增加一个背景色，或者是在右侧提示的颜色（我改的基佬紫）。

## StyleCI

如果是基于 PHP 的开源项目，可以使用 [StyleCI](https://github.styleci.io) 工具。它可以导入 GitHub 账号里的项目，识别每一次提交内容的样式，把不符合规范的代码标红。
最方便的是，它会直接给你添加一个修复这些问题的 PR，你只需要看看然后合并就完事了嗷。
![StyleCI](/images/styleci.png)

## Visual Studio Code 使用

直接在扩展里搜索 *phpcs*

![Visual Studio Code 使用](/images/phpcs-vsc.png)
