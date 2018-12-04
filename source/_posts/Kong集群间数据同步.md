---
title: Kong集群间数据同步
urlname: kong-cluster-event
date: 2018-11-23 14:45:28
tags: [lua,kong,openresty]
---

## 概览

  kong 的代码运行于 nginx 的 worker 进程中。kong 对数据的修改会在一个 worker 中进行，数据被修改后需要通知给本地的其他 worker 进程和其他机器上的 worker 进程。kong 使用的进程间通信主要方式有：
1. 本机间通信-共享内存
2. 跨机器通信-数据库

<!-- more -->

## 数据共享

  kong 的数据存储在数据库中，同时在缓存中保留一份。当数据库的中的数据被修改时，需要发出相应的事件通知其他 worker。其他 worker 接收事件后，删除缓存中对应的数据。下次从缓存读数据时发现没有的话，就从数据库加载出来。
  事件分为本地事件和集群事件。本地事件用于通知在一台机器上的 worker，集群事件用于通知在多台机器上的 worker。

### 共享内存

  本地事件通过共享内存实现。kong 实现了一套基于 nginx 共享内存的 **事件发布-订阅** 机制，源码见仓库 [lua-resty-worker-events](https://github.com/Kong/lua-resty-worker-events)。该包提供 `post_local` 方法在 worker 进程内进行事件发布，提供 `post` 方法在同属于一台机器上的 worker 进程间进行事件发布。这2个方法需要指定 source 和 event 来确定事件源。
  kong 的数据访问层 [dao.lua](https://github.com/Kong/kong/blob/master/kong/dao/dao.lua) 封装了 `insert、update 和 delete` 三个对数据操作的方法。这三个方法分别会使用 `post_local` 发出 **source 为 dao:crud，event 为 `insert、delete、update`** 的数据增、删、改的事件。

事件的数据格式如下:

```lua
{
   schema    = self.schema, --表名
   operation = "create", --操作类型
   entity    = res, --数据
}
```

  worker 进程启动的时候会在 init_worker 阶段注册这些事件的订阅方法，见 [worker_events.register()](https://github.com/Kong/kong/blob/master/kong/runloop/handler.lua#L172)。订阅方法中把所有的 dao:crud 事件按表名称使用 post_local 再进行分发。所以从 dao:crud 分发的事件如下:

- `source=crud, event=apis`

这个事件会通知所有的 worker(包含不同机器)apis 数据的修改。这里对缓存中对 key 为 **api_router:version** 进行 invalidate 操作会发送一条 channel=invalidations 集群事件。

- `source=crud, event=routes`

这个事件会通知所有的 worker(包含不同机器)routes 数据的修改。这里对缓存中对 key 为 **router:version** 进行 invalidate 操作会发送一条 channel=invalidations 集群事件。

- `source=crud, event=services`

这个事件会通知所有的 worker(包含不同机器)services 数据的修改。只有当不是新增和删除操作时才需要更新路由，因为新增时服务还是空的，下面没有路由，删除时只有没有路由时才能删除，所以排除这2种。对缓存中对 key 为 **router:version** 进行 invalidate 操作会发送一条 channel=invalidations 集群事件。

- `source=crud, event=snis`

- `source=crud, event=certificates`

- `source=crud, event=targets`

这个事件会通知所有的 worker(包含不同机器)targets数据的修改。使用 `cluster_events:broadcast` 方法发送一条 channel=balancer:targets 集群事件。

- `source=crud, event=upstreams`

这个事件会通知所有的 worker(包含不同机器)upstreams数据的修改。使用 `cluster_events:broadcast` 方法发送一条 channel=balancer:upstreams 集群事件。

### 数据库

  集群事件通过数据库实现。数据库表 **cluster_events** 存放用于集群间分发的事件。**cluster_events** 表结构如下:

```sql
CREATE TABLE cluster_events (
  id varchar(64) NOT NULL,
  -- 标识生成事件的节点id
  node_id varchar(64) NOT NULL,
  -- 事件产生时间，精确到毫秒
  at timestamp(3) NOT NULL,
  -- 事件生效时间，精确到毫秒
  nbf timestamp(3) NULL DEFAULT NULL,
  -- 事件过期时间，精确到毫秒
  expire_at timestamp(3) NOT NULL,
  -- 事件类型
  channel varchar(1023) DEFAULT NULL,
  -- 事件数据
  data varchar(10000) DEFAULT NULL,
  
  PRIMARY KEY (id),
  KEY cluster_events_at_idx (at),
  KEY cluster_events_channelt_idx (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
```

`channel` 的类型有:

- `invalidations`

表示路由规则、插件配置的变更

- `balancer:targets`

表示负载均衡的 targets 列表发生变更

- `balancer:upstreams`

表示 upstream 对象发生变更

- `balancer:post_health`

表示 target 的健康状态发生变更。由于被动健康检查拉出实例后，kong 不会在对该实例进行自动拉入，需要通过该事件来拉入实例。
  
调用 [cluster_events:broadcast](https://github.com/Kong/kong/blob/master/kong/cluster_events.lua#L140) 方法会往 cluster_events 表中新增一条记录。在 init_worker 阶段通过调用 [cluster_events:subscribe](https://github.com/Kong/kong/blob/master/kong/cluster_events.lua#L167) 会开启一个定时器，定时查询出 cluster_events 表中新增的记录。这里要注意的是同一台机器上只会有一个 worker 进程会对数据库进行查询（通过加锁实现，代码见 [get_lock()](https://github.com/Kong/kong/blob/master/kong/cluster_events.lua#L294)），查询出来后再通过共享内存的方式通知给这台机器上的其他 worker。
  
配置参数 [db_update_frequency](https://github.com/Kong/kong/blob/master/kong/templates/kong_defaults.lua#L61) 确定查询数据库的间隔，默认为 **5** 秒。数据范围根据 at 字段是否落在(起始时间, 结束时间]确定。起始时间第一次设置在 init_worker 阶段，调用 `ngx.now()` 获取当前时间(精确到毫秒)并放入 key 为 `cluster_events:at` 的共享内存中。之后抢到锁的 worker 会从共享内存中取出该时间，该时间需要减去 `db_update_propagation + 0.001` 来确定起始时间，以防止事件丢失。配置参数 [db_update_propagation](https://github.com/Kong/kong/blob/master/kong/templates/kong_defaults.lua#L62) 默认为 0。结束时间取 `ngx.now()` 的值。查询成功后会把结束时间覆盖之前的起始时间，并把该事件分发到本机的其他 worker。对于设置了 nbf 的事件，kong 如果发现还没到生效时间，就会通过 `ngx.timer` 设置一个定时器延后分发该事件。