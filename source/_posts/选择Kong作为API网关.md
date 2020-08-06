---
title: 选择Kong作为API网关
urlname: use-kong-for-api-gateway
date: 2018-11-09 20:17:07
category: OpenResty
tags: openresty
photos: /images/different-of-kong.png
---

随着移动互联网的兴起、开放合作思维的盛行，不同终端和第三方开发者都需要大量的接入企业核心业务能力，此时各业务系统将会面临同一系列的问题，例如：如何让调用方快速接入、如何让业务方安全地对外开放能力，如何应对和控制业务洪峰调用等等。于是就诞生了一个隔离企业内部业务系统和外部系统调用的屏障 - API 网关，它负责在上层抽象出各业务系统需要的通用功能，例如：鉴权、限流、ACL、降级等。另外随着近年来微服务的流行，API 网关已经成为一个微服务架构中的标配组件。

<!-- more -->

认证中心部门提供了大量接口给外部门，非常需要这样一个网关。在选型时，放弃了 [Orange](http://orange.sumory.com/)，虽然它的优点有自带管理端、流量筛选和变量提取方面支持丰富，过滤统计配合配置规则比较好用，自带管理后台。但是从 2017 年 5 月开始后续没有开发，BUG 比较多。

[Kong](https://konghq.com/kong/) 的插件机制是其高可扩展性的根源，它可以很方便地为路由和服务提供各种插件，网关所需要的基本特性，Kong 都支持：

- 熔断 Circuit-Breaker
- 限流 Rate-limiting
- OAuth2.0: 身份验证
- 认证 Authentications: HMAC，JWT，Basic等
- 监控 Monitoring: 实时监视提供关键的负载和性能服务器指标
- REST API: 通过 RESTful API 管理
- 高性能 Performance: 背靠非阻塞通信的 Nginx
- 可扩展性 Scalability: 只需添加节点即可水平扩展
- 安全性 Security: ACL，僵尸程序检测，白名单/黑名单IP等
- 动态负载均衡 Dynamic Load Balancing：在多个上游服务之间平衡流量
- 插件 Plugins: [Kong Hub](https://docs.konghq.com/hub/) 提供众多开箱即用的插件

在微服务架构之下，服务被拆的非常零散，降低了耦合度的同时也给服务的统一管理增加了难度。如上图左所示，在旧的服务治理体系之下，鉴权，限流，日志，监控等通用功能需要在每个服务中单独实现，这使得系统维护者没有一个全局的视图来统一管理这些功能。API 网关致力于解决的问题便是为微服务纳管这些通用的功能，在此基础上提高系统的可扩展性。如右图所示，微服务搭配上 API 网关，可以使得服务本身更专注于自己的领域，很好地对服务调用者和服务提供者做了隔离。

在入手前，需要学习 OpenResty 的相关知识，还有 Lua 的语法。我看的李明江的《Nginx Lua开发实战》，内容大量搬运文档，不推荐。重点需要关注的是 11 个用户可介入阶段：

![ngx_lua 的 11 个用户可介入阶段](/images/openresty_phases.png)

对比这些阶段，再看 Kong 框架的入口文件 *init.lua*，就容易理解的多了：

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
