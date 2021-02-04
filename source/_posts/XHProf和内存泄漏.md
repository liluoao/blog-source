---
title: XHProf和内存泄漏
urlname: xhprof-memory-leak-in-php7
date: 2018-12-18 13:35:48
category: 工具
tags: xhprof
---

![](https://cdn.jsdelivr.net/gh/liluoao/cdn@0.0.4/image/tideways.png)

最近我们认证中心部门将定时脚本切换为 `PHP7` 命令执行时，发现过一段时间脚本就内存泄漏，且该释放内存的地方都做了处理。

<!-- more -->

经过一段时间排查后发现是 XHProf 造成的，关闭后就可以了

XHProf 是 **Facebook** 开源的一个轻量级的 PHP 性能分析工具，跟 Xdebug 类似，但性能开销更低。可以用在生产环境中，也可以由程序开关来控制是否进行 profile

Facebook 推出这个工具时 PHP 还是他们技术栈重要的一份子。因为 PHP 7 与 PHP 5 存在很大的兼容性问题，Facebook 的 HHVM 团队决定改用 Hack 开发 HHVM。通过减少使用 PHP，HHVM 团队希望 HHVM 和 Hack 能给开发者提供一个更好、更高性能的体验。所以 XHProf 在 PHP7 上有问题也是意料之中的，这个扩展在 https://pecl.php.net/package/xhprof 上处于年久失修的状态。

我们需要找一个处于维护状态且质量高的版本替代，网络上大部分的解决方案是 https://github.com/longxinH/xhprof

## 安装步骤

```bash
cd xhprof/extension/
/usr/local/php/bin/phpize
./configure -prefix=/usr/local/related/xhprof --with-php-config=/usr/local/php/bin/php-config
make && make install
```

在 *php.ini* 中加入配置，这个日志目录自己定

```ini
[xhprof]
extension = xhprof.so
xhprof.output_dir = /data/log_xhprof
```

用 `phpinfo()` 查看一下是否成功

|Directive|Local Value|Master Value|
|-|-|-|
|xhprof.output_dir|/data/log_xhprof|/data/log_xhprof|
|xhprof.sampling_depth|2147483647|2147483647|
|xhprof.sampling_interval|100000|100000|

使用方式见文档：https://www.php.net/xhprof

GUI 分析界面我们使用的：https://github.com/gajus/xhprof.io

## 编译PHP扩展总结

在 Windows 下我们需要开启某个扩展，很容易。一般情况下，*.dll* 文件都已经躺在 *extension* 目录下，只等待你在 *php.ini* 里将它前面的 `;` 去掉

而在 Linux，你发现 *extensions* 目录是空空的，或许只有几个 *.so* 文件落寞地待着

这里以编译 *fileinfo* 扩展为例（内置扩展，如果编译的是第三方扩展请自行下载源码）

#### 找到扩展包

你需要到 PHP 源码包里寻找，希望源码包没被你删除。

到 `php-7.x.x/ext/` 目录，你会发现里面有很多内置的扩展，我们进 *fileinfo* 目录

```bash
cd ./php/ext/fileinfo
```

#### 编译

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

#### 添加配置

最后只需要在配置里把扩展添加进去就好了

```ini
extension = fileinfo.so
```

最后别忘了重启 Web 服务器
