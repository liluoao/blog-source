---
title: 使用Kong框架作为API网关
urlname: use-kong-for-api-gateway
date: 2018-11-09 20:17:07
category: Lua
tags: [lua,kong,openresty]
---

## 为什么需要 API 网关

![](/images/different-of-kong.png)

<!-- more -->

在微服务架构之下，服务被拆的非常零散，降低了耦合度的同时也给服务的统一管理增加了难度。如上图左所示，在旧的服务治理体系之下，鉴权，限流，日志，监控等通用功能需要在每个服务中单独实现，这使得系统维护者没有一个全局的视图来统一管理这些功能。API 网关致力于解决的问题便是为微服务纳管这些通用的功能，在此基础上提高系统的可扩展性。如右图所示，微服务搭配上 API 网关，可以使得服务本身更专注于自己的领域，很好地对服务调用者和服务提供者做了隔离。

## 为什么选 Kong

Kong 的插件机制是其高可扩展性的根源，Kong 可以很方便地为路由和服务提供各种插件，网关所需要的基本特性，Kong 都如数支持：

- Cloud-Native 云原生: 与平台无关，Kong可以从裸机运行到Kubernetes
- Dynamic Load Balancing 动态路由：Kong 的背后是 OpenResty+Lua，所以从 OpenResty 继承了动态路由的特性
- Circuit-Breaker 熔断
- Health Checks 健康检查
- Logging 日志: 可以记录通过 Kong 的 HTTP，TCP，UDP 请求和响应。
- Security 鉴权: 权限控制，IP 黑白名单，同样是 OpenResty 的特性
- SSL: Setup a Specific SSL Certificate for an underlying service or API.
- 监控: Kong 提供了实时监控插件
- 认证: 如数支持 HMAC, JWT, Basic, OAuth2.0 等常用协议
- Rate-limiting限流：Block and throttle requests based on many variables. 
- REST API: 通过 Rest API 进行配置管理，从繁琐的配置文件中解放
- 可用性: 天然支持分布式
- 高性能: 背靠非阻塞通信的 nginx，性能自不用说
- Plugins 插件机制: 提供众多开箱即用的插件，且有易于扩展的自定义插件接口，用户可以使用 Lua 自行开发插件

上面这些特性中，反复提及了 Kong 背后的 OpenResty，实际上，使用 Kong 之后，Nginx 可以完全摒弃，Kong 的功能是 Nginx 的父集。

## Kong 的架构

|– kong
  |– api [admin管理接口的代码]
    |– …
  |– cluster_events [集群事件的数据访问层代码]
    |– …
  |– cmd [kong命令行的代码]
    |– …
  |– dao [数据库访问层代码]
    |– …
  |– plugins [插件的代码]
    |– …
  |– templates [nginx配置文件模板]
    |– …
  |– tools [工具类代码]
    |– …
  |– vendor [这里提供了用于lua面向对象编程的基类]
    |– …
  |– cache.lua [缓存实现类，封装了mlcache]
  |– cluster_events.lua [集群事件同步代码]
  |– conf_loader.lua [配置加载]
  |– constants.lua [常量定义]
  |– init.lua [kong的入口，可以从这里开始阅读代码]
  |– meta.lua [定义版本号之类]
  |– singletons.lua [单例模式，存放公共对象]

## 执行入口

在 `/templates/nginx_kong.lua` 中提供了一份示例配置：

```
init_by_lua_block {
    Kong = require 'kong'
    Kong.init()
}
init_worker_by_lua_block {
    Kong.init_worker()
}
upstream kong_upstream {
    server 0.0.0.1;
    balancer_by_lua_block {
        Kong.balancer()
    }
    keepalive 60;
}
server {
    server_name kong;
    listen 0.0.0.0:8000;
    error_page 400 404 408 411 412 413 414 417 494 /kong_error_handler;
    error_page 500 502 503 504 /kong_error_handler;
    ssl_certificate_by_lua_block {
        Kong.ssl_certificate()
    }
    location / {
        rewrite_by_lua_block {
            kong.rewrite()
        }
        access_by_lua_block {
            kong.access()
        }
        header_filter_by_lua_block {
            kong.header_filter()
        }
        body_filter_by_lua_block {
            kong.body_filter()
        }
        log_by_lua_block {
            kong.log()
        }
    }

    location = /kong_error_handler {
        content_by_lua_block {
            Kong.handle_error()
        }
        header_filter_by_lua_block {
            Kong.header_filter()
        }
        body_filter_by_lua_block {
            Kong.body_filter()
        }
        log_by_lua_block {
            Kong.log()
        }
    }
}
```

#### ngx_lua 的 11 个用户可介入阶段

![](/images/openresty_phases.png)

#### Kong 入口

`init.lua`

```lua
local Kong = {}

-- init_by_lua_block
-- 用来完成耗时长的模块加载
-- 或者初始化一些全局常量
function Kong.init()
end

-- init_worker_by_lua_block
-- 用于定时拉取配置/数据（启动一些定时任务）
-- 有几个Nginx工作进程就有几个定时任务
function Kong.init_worker()
end

-- ssl_certificate_by_lua_block
-- 在Nginx和下游服务开始一个SSL握手时处理
function Kong.ssl_certificate()
end

-- balancer_by_lua_block
-- 上游服务器中的负载均衡器
function Kong.balancer()
end

-- rewrite_by_lua_block
-- 内部URL重写或者外部重定向
function Kong.rewrite()
end

-- access_by_lua_block
-- 访问控制
function Kong.access()
end

-- header_filter_by_lua_block
-- 设置响应头
function Kong.header_filter()
end

-- body_filter_by_lua_block
-- 对响应数据进行过滤
function Kong.body_filter()
end

-- log_by_lua_block
-- 使用Lua处理日志
function Kong.log()
end

-- content_by_lua_block
function Kong.handle_error()
end

-- content_by_lua_block
-- 提供AdminAPI功能
function Kong.serve_admin_api(options)
end

return Kong
```

#### 推荐阅读

[kong源码导读 -- 拍拍贷](http://techblog.ppdai.com/2018/04/16/20180416/)

[有赞API网关实践 -- 有赞](https://tech.youzan.com/api-gateway-in-practice/)

[选择Kong作为你的API网关 -- IT程序猿](https://www.itcodemonkey.com/article/5980.html)

[apigateway-kong(一)简介及部署 -- zhoujie](https://www.cnblogs.com/zhoujie/p/kong1.html)

[OpenResty 最佳实践](https://moonbingbing.gitbooks.io/openresty-best-practices/content/)