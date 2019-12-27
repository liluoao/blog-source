---
title: Kong框架的AdminAPI
urlname: use-kong-admin-api
date: 2018-12-07 11:24:33
category: Lua
tags: [lua,kong,openresty]
---

## 介绍

Kong附带了一个用于管理的内部 RESTful Admin API。可以将对 Admin API 的请求发送到集群中的任何节点，并且 Kong 将使所有节点上的配置保持一致。[admin_listen 默认端口配置](https://github.com/Kong/kong/blob/master/kong/templates/kong_defaults.lua#L13)

- `8001` 是 Admin API 侦听的默认端口。
- `8444` 是 Admin API 的 HTTPS 流量的默认端口。

此 API 专为内部使用而设置，在设置 Kong 环境时应谨慎，避免把API暴露给外部。

<!-- more -->

## 基础信息

### 节点信息

地址：`GET /`

响应：

```
HTTP 200 OK
```

```json
{
    "hostname": "",
    "node_id": "6a72192c-a3a1-4c8d-95c6-efabae9fb969",
    "lua_version": "LuaJIT 2.1.0-beta3",
    "plugins": {
        "available_on_server": [
            ...
        ],
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

- `node_id`：表示正在运行的Kong节点的UUID。当Kong启动时，该UUID是随机生成的，因此node_id每次重启节点时节点都会有所不同。
- `available_on_server`：节点上安装的插件的名称。
- `enabled_in_cluster`：已启用/配置的插件的名称。也就是说，所有Kong节点共享的数据存储区中当前的插件配置。

### 节点状态

地址：`GET /status`

响应：
```
HTTP 200 OK
```

```json
{
    "server": {
        "total_requests": 3,
        "connections_active": 1,
        "connections_accepted": 1,
        "connections_handled": 1,
        "connections_reading": 0,
        "connections_writing": 1,
        "connections_waiting": 0
    },
    "database": {
        "reachable": true
    }
}
```

- server：有关nginx HTTP / S服务器的度量标准。
  - total_requests：客户端请求的总数。
  - connections_active：当前活动客户端连接数，包括等待连接。
  - connections_accepted：已接受的客户端连接总数。
  - connections_handled：已处理连接的总数。通常，参数值与accept相同，除非已达到某些资源限制。
  - connections_reading：Kong正在读取请求标头的当前连接数。
  - connections_writing：nginx将响应写回客户端的当前连接数。
  - connections_waiting：等待请求的当前空闲客户端连接数。
- database：有关数据库的度量标准。
  - reachable：反映数据库连接状态的布尔值。请注意，此标志**不**反映数据库本身的运行状况。

## 服务

### 添加

地址：`POST /services/`

请求：

|字段|说明|
|-|
|name（可选）|The Service name.|
|protocol|http （默认） or https.
|host|The host of the upstream server.|
|port|端口，默认80|
|url|Shorthand attribute to set protocol, host, port and path at once. This attribute is write-only (the Admin API never “returns” the url).|

响应：
```
HTTP 201 Created
```

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

地址：`PATCH /services/{name or id}`

|字段|说明|
|-|
|name or id（必需）|The id or the name attribute of the Service to update.|

响应：
```
HTTP 200 OK
```

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

地址：`DELETE /services/{name or id}`

|字段|说明|
|-|
|name or id（必需）|The id or the name attribute of the Service to update.|

响应：
```
HTTP 204 No Content
```

路由、消费者、Upstream 与服务类似，除了参数不同

推荐阅读：

[Admin API 官方文档](https://docs.konghq.com/0.14.x/admin-api/)

[apigateway-kong(二)admin-api -- zhoujie](https://www.cnblogs.com/zhoujie/p/kong2.html)