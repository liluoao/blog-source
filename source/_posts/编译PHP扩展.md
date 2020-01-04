---
title: 编译PHP扩展
urlname: compile-php-extension
date: 2018-07-17 14:52:19
category: 服务器
tags: [linux,php]
---
在 Windows 下我们需要开启某个扩展，很容易。一般情况下，*.dll* 文件都已经躺在 *extension* 目录下，只等待你在 *php.ini* 里将它前面的 `;` 去掉。
而在 Linux，你发现 *extensions* 目录是空空的，或许只有几个 *.so* 文件落寞地待着。

这里以编译 *fileinfo* 扩展为例（内置扩展，如果编译的是第三方扩展请自行下载源码）

<!-- more -->

## 找到扩展包

你需要到 PHP 源码包里寻找，希望源码包没被你删除。

到 `php-7.x.x/ext/` 目录，你会发现里面有很多内置的扩展，我们进 *fileinfo* 目录

```bash
cd ./php/ext/fileinfo
```

## 编译

```bash
/usr/local/php/bin/phpize
./configure --with-php-config=/php/bin/php-config
make && make install
```

1. 执行 `phpize`，它是用来安装扩展的工具，这个工具会在当前目录下生成 *configure* 文件
2. 编译，`with-php-config` 参数按照实际情况
3. 安装

没有意外的话，经过上面的编译，你会生成：*php/lib/php/extensions/fileinfo.so*
扩展目录根据 *php.ini* 的 `extension_dir` 来找

## 添加配置

最后只需要在配置里把扩展添加进去就好了

```ini
extension = fileinfo.so
```

最后别忘了重启 Web 服务器
