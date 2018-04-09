---
title: 使用Phalcon框架
date: 2018-03-17 10:37:19
category: phalcon
tags: phalcon
---
### 安装Phalcon

Phalcon 是使用 C 扩展编写、高性能的 PHP 框架。

Windows用户可以在[https://github.com/phalcon/cphalcon/releases](https://github.com/phalcon/cphalcon/releases) 下载 `.dll` 文件，加入 `php.ini` 配置中：

```
extension=php_phalcon.dll
```

重启你的WEB服务器后，在 `phpinfo()` 中看到 Phalcon 扩展，代表你安装成功。

其它平台安装方法见：https://phalconphp.com/zh/download/linux
<!-- more -->
### 安装Phalcon-devtool

[phalcon-devtools](https://github.com/phalcon/phalcon-devtools) 是Phalcon开发者工具，可以自动生成代码，和为IDE创建Phalcon语法提示。

```bash
git clone https://github.com/phalcon/phalcon-devtools.git
```

然后将`~/phalcon-devtools`目录加入系统环境变量**PATH**，在命令行输入：

```bash
phalcon --help
```

返回如下信息，说明设置成功：

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

#### 为IDE创建语法提示

进入 `~/phalcon-devtools/ide` 文件夹，运行命令：

```bash
php gen-stubs.php
```

它会在本文件夹中生成相应版本语法目录，在你的IDE中导入 `Configure PHP Include Paths` 即可。

### 下载框架文件

安利我的项目：https://github.com/liluoao/phalcon-framework

[![](https://camo.githubusercontent.com/d3e1b2e83cf1128d8efa920680443fef6527739d/68747470733a2f2f696d672e736869656c64732e696f2f7061636b61676973742f762f686279632f7068616c636f6e2e7376673f7374796c653d666c61742d737175617265 "Packagist")](https://packagist.org/packages/liluoao/phalcon)

```
composer create-project liluoao/phalcon
```



