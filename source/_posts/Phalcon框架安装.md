---
title: Phalcon框架安装
urlname: use-phalcon
date: 2018-03-17 10:37:19
category: PHP框架
tags: phalcon
---

Phalcon 是一个使用 C 编写、高性能的 PHP 框架。

<!-- more -->

Windows 用户可以在 [GitHub发布历史](https://github.com/phalcon/cphalcon/releases) 下载 *.dll* 文件，加入 *php.ini* ：

```ini
extension = php_phalcon.dll
```

Linux 安装方法见：[Linux/Unix/Mac](https://phalcon.io/zh-cn/download/linux)

## 安装 Phalcon-devtool

[phalcon-devtools](https://github.com/phalcon/phalcon-devtools) 是 Phalcon 开发者工具，可以自动生成代码，为 IDE 创建 Phalcon 语法提示。

```bash
git clone https://github.com/phalcon/phalcon-devtools.git
```

将 *~/phalcon-devtools* 目录加入环境变量，方便使用：

```bash
phalcon --help
```

成功返回如下信息：

```bash
Phalcon DevTools (3.2.12)

Help:
  Lists the commands available
in
 Phalcon devtools

Available commands:
  info             (alias of: i)
  commands         (alias of: list, enumerate)
  controller       (alias of: create-controller)
  module           (alias of: create-module)
  model            (alias of: create-model)
  all-models       (alias of: create-all-models)
  project          (alias of: create-project)
  scaffold         (alias of: create-scaffold)
  migration        (alias of: create-migration)
  webtools         (alias of: create-webtools)
  serve            (alias of: server)
  console          (alias of: shell, psysh)
```

## 为 IDE 创建语法提示

进入 *~/phalcon-devtools/ide* 文件夹，运行命令：

```bash
php gen-stubs.php
```

它会在本文件夹中生成相应版本语法目录，在你的 PHPStorm 中配置 `Configure PHP Include Paths` 即可。

## 框架文件

Phalcon 对于结构要求不固定，单模块结构如下：

```
single/
    app/
        controllers/
        models/
        views/
    public/
        css/
        img/
        js/
```

多模块：

```
multiple/
  apps/
    front/
       controllers/
       models/
       views/
       Module.php
    back/
       controllers/
       models/
       views/
       Module.php
  public/
    css/
    img/
    js/
```

下面是我自定义的框架文件

[![liluoao/phalcon](https://img.shields.io/packagist/v/liluoao/phalcon.svg)](https://packagist.org/packages/liluoao/phalcon)

```bash
composer create-project liluoao/phalcon
```
