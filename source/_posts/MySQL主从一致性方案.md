---
title: MySQL主从一致性方案
urlname: consistency-of-master-and-slave-database
date: 2020-01-22 13:45:49
category: 数据库
tags: mysql
---

![](/images/master-and-slave-database.png)

实际工作中，大部分项目和业务都是读多写少。为了保证高可用性，提升读速度，一般会采用读写分离、一主多从的数据库架构。

但是主从同步是延时的，如果在写操作同步完成前发生了读操作，就会导致脏读，如何解决？

<!-- more -->

### 半同步复制

![半同步复制](/images/semi-sync.jpg)

普通的主从同步是使用 MySQL 的异步复制，依靠二进制日志（binary log）进行

从 5.5 版本开始，MySQL 引入了半同步复制（semi-sync）：一个事务提交时，日志至少要保证有一个从接收到，那么它的提交才能继续

1. 系统先对主库进行了一个写操作
2. 等主从同步完成，写主库的请求才返回
3. 读从库，读到最新的数据（如果读请求先完成，写请求后完成，读取到的是“当时”最新的数据）

这个方案的优点是原生功能，使用简单

在线加载插件安装：

```mysql
mysql> install plugin rpl_semi_sync_master soname 'semisync_master.so';
mysql> install plugin rpl_semi_sync_slave soname 'semisync_slave.so';
```

写入配置文件：

```ini
[mysqld]
plugin-dir=/usr/local/mysql/lib/plugin
plugin-load="rpl_semi_sync_master:semisync_master.so;rpl_semi_sync_slave:semisync_slave.so"
```

缺点是主库的写请求时延会增长，吞吐量会降低

### 强制读主库

如果读写都到主库，就不会出现这种问题了。需要使用缓存来弥补缺失的读性能。

### 数据库中间件

1. 所有的读写都走数据库中间件，通常情况下，写请求路由到主库，读请求路由到从库
2. 记录所有路由到写库的 key，在经验主从同步时间窗口内，如果有读请求访问中间件，此时有可能从库还是旧数据，就把这个key上的读请求路由到主库
3. 经验主从同步时间过完后，对应 key 的读请求继续路由到从库

市面上的开源中间件相当少了，可能只有原当当网的 [apache/incubator-shardingsphere](https://github.com/apache/incubator-shardingsphere) 还在维护

![早期主流的开源中间件](/images/mysql-middleware.jpg)

想自主开发的话要看公司技术实力，时间人力成本都相当高

使用市场上的中间件也要注意信息安全

### 缓存记录写 key

最后说的这个方案总结了前三个方案的优缺点，就是用缓存记录库中操作的 key：

- 写

1. 某库的某 key 要进行写操作，把它记录到缓存里，设置好超时时间（比主从同步的时间大点）
2. 进行写操作

- 读

1. 查询缓存，本次读操作的 key 是否在缓存里
2. 缓存命中，将本次读操作路由给主库，查新数据
3. 缓存未命中，依旧从库处理

这个方案成本低，付出的代价是在读写时都多了一步缓存操作
