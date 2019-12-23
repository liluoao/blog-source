---
title: Nginx和PHP的配置
urlname: nginx-and-php-config
date: 2018-03-06 09:59:26
category: 服务器
tags: linux
---
原文链接：[https://segmentfault.com/a/1190000014610688](https://segmentfault.com/a/1190000014610688)

## Nginx配置
配置文件位置：`/etc/nginx/nginx.conf`
<!-- more -->
#### 配置文件分析
```
# nginx运行的用户名
user nginx;
# nginx启动进程,通常设置成和cpu的数量相等，这里为自动
worker_processes auto;

# errorlog文件位置
error_log /var/log/nginx/error.log;
# pid文件地址，记录了nginx的pid，方便进程管理
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/nginx/README.dynamic.
# 用来加载其他动态模块的配置
include /usr/share/nginx/modules/*.conf;

# 工作模式和连接数上限
events {
    # 每个worker_processes的最大并发链接数
    # 并发总数：worker_processes*worker_connections
    worker_connections 1024;
}

# 与提供http服务相关的一些配置参数类似的还有mail
http {
    # 设置日志的格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # access_log记录访问的用户、页面、浏览器、ip和其他的访问信息
    access_log  /var/log/nginx/access.log  main;

    # 这部分下面会单独解释
    # 设置nginx是否使用sendfile函数输出文件
    sendfile            on;
    # 数据包最大时发包(使用Nagle算法)
    tcp_nopush          on;
    # 立刻发送数据包(禁用Nagle算法)
    tcp_nodelay         on;
    # 链接超时时间
    keepalive_timeout   65;
    # 这个我也不清楚...
    types_hash_max_size 2048;

    # 引入文件扩展名与文件类型映射表
    include             /etc/nginx/mime.types;
    # 默认文件类型
    default_type        application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

    # http服务上支持若干虚拟主机。
    # 每个虚拟主机一个对应的server配置项
    # 配置项里面包含该虚拟主机相关的配置。
    server {
        # 端口
        listen       80 default_server;
        listen       [::]:80 default_server;
        # 访问的域名
        server_name  _;
        # 默认网站根目录（www目录）
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.

        include /etc/nginx/default.d/*.conf;

        # 默认请求
        location / {
        }

        # 错误页(404)
        error_page 404 /404.html;
            location = /40x.html {
        }

        # 错误页(50X)
        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
}
```
#### 要点说明
1. 关于 `error_log` 可以设置log的类型(记录什么级别的信息)有：debug、info、notice、warn、error、crit几种

2. 关于 `sendfile`
一般的网络传输过程
硬盘 >> kernel buffer >> user buffer>> kernel socket buffer >>协议栈
使用sendfile后
硬盘 >> kernel buffer (快速拷贝到kernelsocket buffer) >>协议栈
可以显著提高传输性能。

3. `tcp_nopush` 和 `tcp_nodelay`
`tcp_nopush` 只有在启用了 `sendfile` 时才起作用，
在启用 `tcp_nopush` 后，程序接收到了数据包后不会马上发出，而是等待数据包最大时一次性发出，可以缓解网络拥堵。(Nagle化)
相反 `tcp_nodelay` 则是立即发出数据包.

#### php fastcgi配置
分析完了配置文件后开始配置环境。

因为只是配置PHP的服务器，而且只使用一个端口所以只需要改动server部分
```
server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        # 这里改动了，也可以写你的域名
        server_name  192.168.17.26;
        
        # 默认网站根目录（www目录）
        root         /var/www/;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location / {
            # 这里改动了 定义首页索引文件的名称
            index index.php index.html index.htm;
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }

        # 这里新加的
        # PHP 脚本请求全部转发到 FastCGI处理. 使用FastCGI协议默认配置.
        # Fastcgi服务器和程序(PHP,Python)沟通的协议.
        location ~ \.php$ {
            # 设置监听端口
            fastcgi_pass   127.0.0.1:9000;
            # 设置nginx的默认首页文件(上面已经设置过了，可以删除)
            fastcgi_index  index.php;
            # 设置脚本文件请求的路径
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
            # 引入fastcgi的配置文件
            include        fastcgi_params;
        }
    }
```