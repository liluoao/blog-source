---
title: XHProf与PHP7的问题
urlname: problem-about-xhprof-in-php7
date: 2019-01-18 13:35:48
tags: tool
---

## 前言

XHProf 是 **Facebook** 开源的一个轻量级的 PHP 性能分析工具，跟 Xdebug 类似，但性能开销更低。可以用在生产环境中，也可以由程序开关来控制是否进行 profile 。

## 问题排查

最近我们认证中心部门将定时脚本切换为 `PHP7` 命令执行时，发现过一段时间脚本就内存泄漏，且该释放内存的地方都做了处理。

经过一段时间排查后发现是 XHProf 造成的，关闭后就可以了。

<!-- more -->

## 解决方法

**Facebook** 推出这个工具时 PHP 还是他们技术栈重要的一份子。因为 PHP 7 与 PHP 5 存在很大的兼容性问题，Facebook 的 HHVM 团队决定改用 Hack 开发 HHVM。通过减少使用 PHP，HHVM 团队希望 HHVM 和 Hack 能给开发者提供一个更好、更高性能的体验。所以 XHProf 在 PHP7 上有问题也是意料之中的，这个扩展在 https://pecl.php.net/package/xhprof 上处于年久失修的状态。

我们需要找一个处于维护状态且质量高的版本替代，网络上大部分的解决方案是 https://github.com/longxinH/xhprof 。

## 安装步骤

回顾一下 XHProf 的安装步骤

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
