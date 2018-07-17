---
title: 编译PHP扩展
urlname: compile-php-extension
date: 2018-07-17 14:52:19
tags: [linux,php]
---
在 **Windows** 下我们需要开启某个扩展，很容易。一般情况下，*dll* 文件都已经安静地躺在 *extension* 目录下，只等待你在 *php.ini* 里将它前面的 **;** 去掉。

而在 **Linux**，你 *cd* 到 PHP 的 *extensions* 目录往往发现里面空空的。或许只有几个 *so* 文件落寞地待着。

这里以编译 *fileinfo* 扩展为例（注意这是 PHP 内置的扩展，如果你编译的是第三方扩展请自行到官网下载源码）
## 一、找到扩展包

你需要到 PHP 源码包里寻找，希望源码包没被你删除。

**cd** 到 `php-7.x.x/ext/` 目录，你会发现里面有很多内置的扩展

我们 **cd** 到 *fileinfo* 目录
## 二、编译
```
phpize
./configure --with-php-config=/usr/local/php/bin/php-config
make && make install
```
上面的命令很好理解，首先是执行 `phpize`，它是用来安装php扩展的工具，如果你的系统无法识别，请使用完整路径。比如 `/usr/local/php/bin/phpize` 。这个工具会在当前目录下生成 *configure* 文件。

接着就是编译的三板斧啦~其中 `with-php-config` 参数请按照你实际情况填写

没有意外的话，经过上面的编译，你会在 `php/lib/php/extensions/`(在 *php.ini* 的 *extension_dir* 可找到)目录下找到生成的 *fileinfo.so* 文件
## 三、添加配置
最后只需要在php.ini里把扩展添加进去就好了
```ini
extension = "fileinfo.so"
```
最后别忘了重启web服务器
