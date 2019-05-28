---
title: PHP的运行模式
urlname: php-sapi
date: 2018-02-18 11:46:52
---
原文链接：[https://segmentfault.com/a/1190000014547406](https://segmentfault.com/a/1190000014547406)

## SAPI
这里所说的 PHP 运行模式， 其实指的是 SAPI （Server Application Programming Interface，服务端应用编程端口 ）。SAPI 为 PHP 提供了一个和外部通信的接口， PHP 就是通过这个接口来与其它的应用进行数据交互的。针对不同的应用场景， PHP 也提供了多种不同的 SAPI ，常见的有：apache、apache2filter、apache2handler、cli、cgi、embed 、fast-cgi、isapi 等等。 

> `php_sapi_name()` — 返回 web 服务器和 PHP 之间的接口类型。可能返回的值包括了 aolserver、apache、 apache2filter、apache2handler、 caudium、cgi （直到 PHP 5.3）, cgi-fcgi、cli、 cli-server、 continuity、embed、fpm-fcgi、 isapi、litespeed、 milter、nsapi、 phttpd、pi3web、roxen、 thttpd、tux 和 webjames。

目前 PHP 内置的很多 SAPI 实现都已不再维护或者变的有些非主流了，PHP 社区目前正在考虑将一些 SAPI 移出代码库。 社区对很多功能的考虑是除非真的非常必要，或者某些功能已近非常通用了，否则就在 PECL 库中。

接下来会对其中五个比较常见的运行模式进行说明。
<!-- more -->
#### CLI 模式
CLI（ Command Line Interface ）， 也就是命令行接口，PHP 默认会安装。通过这个接口，可以在 shell 环境下与 PHP 进行交互 。

因为有 CLI 的存在，我们可以直接在终端命令行里运行 PHP 脚本，就像使用 shell、Python 那样，不用依赖于 WEB 服务器。比如 Laravel 框架中的 Artisan 命令行工具，它其实就是一个 PHP 脚本，用来帮助我们快速构建 Laravel 应用的。

#### CGI 模式
> CGI（Common Gateway Interface，通用网关接口）是一种重要的互联网技术，可以让一个客户端，从网页浏览器向执行在网络服务器上的程序请求数据。CGI 描述了服务器和请求处理程序之间传输数据的一种标准。

WEB 服务器只是内容的分发者。比如 Nginx，如果客户端请求了 `/index.html`，那么 Nginx 会去文件系统中找到这个文件，发送给浏览器，这里分发的是静态数据；如果客户端现在请求的是 `/index.php`，根据配置文件，Nginx 知道这个不是静态文件，需要去找 PHP 解析器来处理，那么它会把这个请求经过简单处理后交给PHP 解析器。Nginx 会传哪些数据给 PHP 解析器呢？url 要有吧，查询字符串也得有吧，POST 数据也要有，HTTP 请求头 不能少吧，好的，CGI 就是规定要传哪些数据、以什么样的格式传递给后方处理这个请求的协议。

CGI 模式运行原理：当 Nginx 收到浏览器 `/index.php` 这个请求后，首先会创建一个对应实现了 CGI 协议的进程，这里就是 php-cgi（PHP 解析器）。接下来 php-cgi 会解析 php.ini 文件，初始化执行环境，然后处理请求，再以 CGI 规定的格式返回处理后的结果，退出进程。最后，Nginx 再把结果返回给浏览器。整个流程就是一个 `Fork-And-Execute` 模式。当用户请求数量非常多时，会大量挤占系统的资源如内存、CPU 时间等，造成效能低下。所以在用 CGI 方式的服务器下，有多少个连接请求就会有多少个 CGI 子进程，子进程反复加载是 CGI 性能低下的主要原因。

CGI 模式的好处就是完全独立于任何服务器，仅仅是做为一个中介：提供接口给 WEB 服务器和脚本语言或者是完全独立编程语言。它们通过 CGI 协议搭线来完成数据传递。这样做的好处了尽量减少它们之间的关联，使得各自更加独立、互不影响。

**CGI 模式已经是比较古老的模式了，这几年都很少用了。**

#### FastCGI 模式
> FastCGI（Fast Common Gateway Interface，快速通用网关接口）是一种让交互程序与 Web 服务器通信的协议。FastCGI 是早期通用网关接口（CGI）的增强版本。FastCGI 致力于减少网页服务器与 CGI 程序之间交互的开销，从而使服务器可以同时处理更多的网页请求。

根据定义可以知道，FastCGI 也是一种协议，实现了 FastCGI 协议的程序，更像是一个常驻型（long-live）的 CGI 协议程序，只要激活后，它可以一直执行着，不会每次都要花费时间去 fork 一次。

FastCGI 模式运行原理：FastCGI 进程管理器启动之后，首先会解析 php.ini 文件，初始化执行环境，然后会启动多个 CGI 协议解释器守护进程 (进程管理中可以看到多个 php-cig 或 php-cgi.exe)，并等待来自 WEB 服务器的连接；当客户端请求到达 WEB 服务器时，FastCGI 进程管理器会选择并连接到一个 CGI 解释器， WEB 服务器将 CGI环境变量和标准输入发送到 FastCGI 的子进程 php-cgi 中； php-cgi 子进程完成处理后便将标准输出和错误信息返回给 WEB 服务器；此时 php-cgi 子进程就会关闭连接，该请求便处理结束，接着继续等待并处理来自 FastCGI 进程管理器的下一个请求连接。

FastCGI 模式采用了 C/S 结构，可以将 WEB 服务器和脚本解析服务器分开，同时在脚本解析服务器上启动一个或者多个脚本解析守护进程。当 WEB 服务器每次遇到动态程序时，可以将其直接交付给 FastCGI 进程来执行，然后将得到的结果返回给浏览器。这种方式可以让 WEB 服务器专一地处理静态请求或者将动态脚本服务器的结果返回给客户端，这在很大程度上提高了整个应用系统的性能。

另外，在 CGI 模式下，php-cgi 在 php.ini 配置变更后，需要重启 php-cgi 进程才能让新的 php-ini 配置生效，不可以平滑重启。而在 FastCGI 模式下，PHP-FPM 可以通过生成新的子进程来实现 php.ini 修改后的平滑重启。

> PHP-FPM（PHP-FastCGI Process Manager）是 PHP 语言中实现了 FastCGI 协议的进程管理器，由 Andrei Nigmatulin 编写实现，已被 PHP 官方收录并集成到内核中。

FastCGI 模式的优点：

1. 从稳定性上看，FastCGI 模式是以独立的进程池来运行 CGI 协议程序，单独一个进程死掉，系统可以很轻易的丢弃，然后重新分配新的进程来运行逻辑；
2. 从安全性上看，FastCGI 模式支持分布式运算。FastCGI 程序和宿主的 Server 完全独立，FastCGI 程序挂了也不影响 Server；
3. 从性能上看，FastCGI 模式把动态逻辑的处理从 Server 中分离出来，大负荷的 IO 处理还是留给宿主 Server，这样宿主 Server 可以一心一意处理 IO，对于一个普通的动态网页来说, 逻辑处理可能只有一小部分，大量的是图片等静态。

**FastCGI 模式是目前 PHP 主流的 WEB 服务运行模式，拥有高效可靠的性能，推荐大家使用。**

#### Module 模式
PHP 常常与 Apache 服务器搭配形成 LAMP 配套的运行环境。把 PHP 作为一个子模块集成到 Apache 中，就是 Module 模式，Apache 中的常见配置如下：
```
LoadModule php5_module modules/mod_php5.so
```
这使用了 LoadModule 命令，该命令的第一个参数是模块的名称，名称可以在模块实现的源码中找到。第二个选项是该模块所处的路径。如果需要在服务器运行时加载模块，可以通过发送信号 HUP 或者 AP_SIG_GRACEFUL 给服务器，一旦接受到该信号，Apache 将重新装载模块，而不需要重新启动服务器。通过注册到 apache2 的 ap_hook_post_config 挂钩，在 Apache 启动的时候启动此模块以接受 PHP 文件的请求。

例如，当客户端访问 PHP 文件时，Apache 就会调用 php5_module 来解析 PHP 脚本。Apache 每接收到一个请求，都会产生一个进程来连接 PHP 完成请求。在 Module 模式下，有时候会因为把 PHP 作为模块编进 Apache，而导致出现问题时很难定位是 PHP 的问题还是 Apache 的问题。

> 过去，凭借着丰富的模块和功能，企业往往将 Apache 作为 WEB 服务器，于是以 Module 模式运行的 PHP + Apache 的组合很常见。近些年，以异步事件驱动、高性能的 Nginx 服务器的崛起，市场份额快速增长，以 FastCGI 模式运行的 PHP + Nginx 组合，拥有更佳的性能，有赶超 Apache 的趋势。

#### ISAPI 模式
ISAPI（Internet Server Application Program Interface）是微软提供的一套面向 Internet 服务的 API 接口，一个 ISAPI 的 DLL，可以在被用户请求激活后长驻内存，等待用户的另一个请求，还可以在一个 DLL 里设置多个用户请求处理函数，此外，ISAPI 的 DLL 应用程序和 WEB 服务器处于同一个进程中，效率要显著高于 CGI。由于微软的排他性，只能运行于 Windows 环境。

用的比较少，在这里就不做详细介绍了。