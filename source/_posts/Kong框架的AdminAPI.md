---
title: Kong框架的AdminAPI
urlname: use-kong-admin-api
date: 2018-12-07 11:24:33
category: OpenResty
tags: openresty
---

## 介绍

Kong 附带了一个用于管理的内部 RESTful Admin API。可以将对 Admin API 的请求发送到集群中的任何节点，并且 Kong 将使所有节点上的配置保持一致。[admin_listen 默认端口配置](https://github.com/Kong/kong/blob/master/kong/templates/kong_defaults.lua#L13)

- `8001` 是 Admin API 侦听的默认端口。
- `8444` 是 HTTPS 的默认端口。

此 API 专为内部使用而设置，在设置 Kong 环境时应谨慎，避免把 API 暴露给外部。

<!-- more -->

## 基础信息

### 节点信息

方式：GET
URI：`/`
响应：HTTP 200 OK

```json
{
    "hostname": "",
    //表示正在运行的 Kong 节点的 UUID
    //当 Kong 启动时，该 UUID 是随机生成的，因此 node_id 每次重启节点时节点都会有所不同
    "node_id": "6a72192c-a3a1-4c8d-95c6-efabae9fb969",
    "lua_version": "LuaJIT 2.1.0-beta3",
    "plugins": {
        //节点上安装的插件的名称
        "available_on_server": [
            ...
        ],
        //已启用/配置的插件的名称。
        //也就是说，所有Kong节点共享的数据存储区中当前的插件配置
        "enabled_in_cluster": [
            ...
        ]
    },
    "configuration" : {
        ...
    },
    "tagline": "Welcome to Kong",
    "version": "0.14.0"
}
```

### 节点状态

方式：GET
URI：`/status`
响应：HTTP 200 OK

```json
{
    //有关 HTTP / HTTPS服务器的度量标准
    "server": {
        //客户端请求的总数
        "total_requests": 3,
        //当前活动客户端连接数，包括等待连接
        "connections_active": 1,
        //已接受的客户端连接总数
        "connections_accepted": 1,
        //已处理连接的总数。通常，参数值与accept相同，除非已达到某些资源限制
        "connections_handled": 1,
        //正在读取请求标头的当前连接数
        "connections_reading": 0,
        //Nginx 将响应写回客户端的当前连接数
        "connections_writing": 1,
        //等待请求的当前空闲客户端连接数
        "connections_waiting": 0
    },
    //有关数据库的度量标准
    "database": {
        //反映数据库连接状态的布尔值。此标志不反映数据库本身的运行状况
        "reachable": true
    }
}
```

## 服务

### 添加

方式：POST
地址：`/services/`
响应：HTTP 201 Created
参数：

|字段|约束|说明|
|-|-|-|
|name|可选|服务名称|
|protocol|必填，默认http|用于与上游接口通信的协议。http 或 https|
|host|必填|上游服务的 host|
|port|必填，默认80|上游服务的端口|
|path|可选，默认null|请求上游服务器使用的路径，默认为空|
|retries|可选，默认5|代理失败时重试的次数|
|connect_timeout|可选，默认60000ms|建立与上游服务器连接的超时时间(ms)|
|write_timeout|可选，默认60000ms|在向上游服务器发送请求的两个连续写入操作之间的超时时间(ms)|
|read_timeout|可选，默认60000ms|在向上游服务器发送请求的两个连续读取操作之间的超时时间(ms)|
|url|shorthand-attribute|一次性设置 protocol、host、port 和 path 的缩写。此属性是只读的（管理API不会返回“URL”）|

```json
{
    "id": "4e13f54a-bbf1-47a8-8777-255fed7116f2",
    "created_at": 1488869076800,
    "updated_at": 1488869076800,
    "connect_timeout": 60000,
    "protocol": "http",
    "host": "example.org",
    "port": 80,
    "path": "/api",
    "name": "example-service",
    "retries": 5,
    "read_timeout": 60000,
    "write_timeout": 60000
}
```

### 修改

方式：PATCH
地址：`/services/{name or id}`
响应：HTTP 200 OK

|字段|约束|说明|
|-|-|-|
|name or id|必填|服务的唯一标识符|

```json
{
    "id": "4e13f54a-bbf1-47a8-8777-255fed7116f2",
    "created_at": 1488869076800,
    "updated_at": 1488869076800,
    "connect_timeout": 60000,
    "protocol": "http",
    "host": "example.org",
    "port": 80,
    "path": "/api",
    "name": "example-service",
    "retries": 5,
    "read_timeout": 60000,
    "write_timeout": 60000
}
```

### 删除

方式：DELETE
地址：`/services/{name or id}`
响应：HTTP 204 No Content

|字段|约束|说明|
|-|-|-|
|name or id|必填|服务的唯一标识符|

路由、消费者、Upstream 与服务类似，除了参数不同

管理API的请求日志路径：*/usr/local/opt/kong/logs*

```
├── access.log
├── admin_access.log #admin-api请求日志
└── error.log
```
