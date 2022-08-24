---
title: Yii2大数据处理
urlname: query-and-paging-under-big-data-in-yii2
date: 2019-02-19 15:39:11
category: PHP框架
tags: yii
---

![big data](https://i.imgtg.com/2022/08/24/KI4BM.jpg)

<!-- more -->

对于公司千万级的客户数据，在数据库查询时要特别小心，避免出现内存溢出与慢查询的问题

Yii2 [大数据处理](https://www.yiiframework.com/doc/guide/2.0/en/db-query-builder#batch-query) 官方文档中是这样说的：

当需要处理大数据的时候，像 `yii\db\Query::all()` 这样的方法就不太合适了， 因为它们会把所有查询的数据都读取到客户端内存上

为了解决这个问题， Yii 提供了批处理查询的支持。服务端先保存查询结果，然后客户端使用游标（cursor） 每次迭代出固定的一批结果集回来

但是，下面有非常显眼的 WARNING ：**MySQL 批处理查询的实现存在已知的局限性**

看过文档后，以为批量查一次 5000 条可能像下面这样：

```php
use yii\db\Query;

$query = (new Query())
    ->from('user')
    ->orderBy('id');

foreach ($query->each(5000) as $user) {
    // $user 代表 user 表里的一行数据
}
```

但是在 [MySQL PHP驱动程序概述](https://secure.php.net/manual/en/mysqlinfo.concepts.buffering.php) 中说道： **查询默认使用缓冲模式**，也就是说，之前的查询结果一直占用着内存，并不像我们以为的每次去取了 5000 条执行

要禁用缓存并减少客户端内存的需求量，PDO 的连接属性 `PDO::MYSQL_ATTR_USE_BUFFERED_QUERY` 必须设置为 `false`。这样，直到整个数据集被处理完毕前，通过此连接是无法创建其他查询的。

我们可以通过切换原本的连接到非缓存模式，然后在批量查询完成后再切换回来

```php
Yii::$app->db->pdo->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);

// Do batch query

Yii::$app->db->pdo->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
```

非缓存查询在 PHP 端使用更少的缓存，但会增加 MySQL 服务器端的负载。而像 MyISAM 引擎的表锁，在执行批量查询的过程中，需要注意同时存在的写入操作。

如果在批量查询的处理过程中需要执行其他查询，可以创建一个单独的非缓存链接：

```php
$unbufferedDb = new \yii\db\Connection([
    'dsn' => Yii::$app->db->dsn,
    'username' => Yii::$app->db->username,
    'password' => Yii::$app->db->password,
    'charset' => Yii::$app->db->charset,
]);
$unbufferedDb->open();
$unbufferedDb->pdo->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
```

然后在调用 `batch()` 或 `each()` 时作为参数传递：

```php
foreach ($query->batch(5000, $unbufferedDb) as $users) {
    // ...
}
```

非缓存查询的链接使用后记得及时关闭：

```php
$unbufferedDb->close();
```

在项目的 [Issue](https://github.com/yiisoft/yii2/issues/8420#issuecomment-296109257) 中举了个很常见的例子，**使用数字类型的主键或索引循环取**，这也是最常用的解决方法。

## 分页

一般情况下，我们的分页可能是这么写的：

```sql
SELECT * FROM table_name LIMIT 10 OFFSET 40;
```

OFFSET 和 LIMIT 对于数据量少的项目来说是没有问题的

但是，当数据库里的数据量超过服务器内存能够存储的能力，并且需要对所有数据进行分页，问题就会出现

为了实现分页，每次收到分页请求时，数据库都需要进行低效的全表扫描

什么是全表扫描？全表扫描 (又称顺序扫描) 就是在数据库中进行逐行扫描，顺序读取表中的每一行记录，然后检查各个列是否符合查询条件。这种扫描是已知最慢的，因为需要进行大量的磁盘 I/O，而且从磁盘到内存的传输开销也很大。

这意味着，如果你有 1 亿个用户，OFFSET 是 5 千万，那么它需要获取所有这些记录 (包括那么多根本不需要的数据)，将它们放入内存，然后获取 LIMIT 指定的 20 条结果

替代方案，基于指针的分页：

```sql
SELECT * FROM table_name WHERE id > 40 LIMIT 10
```

你要在本地保存上一次接收到的主键 (通常是一个 ID) 和 LIMIT，而不是 OFFSET 和 LIMIT，那么每一次的查询可能都与此类似

通过显式告知数据库最新行，数据库就确切地知道从哪里开始搜索（基于有效的索引），而不需要考虑目标范围之外的记录

## 表结构缓存

Yii2 开启表结构缓存，因为当运用模型时，`AR` 的一些公共属性都会从 DB 中获取

这样会导致服务器负担一些额外的资源开销，应该阻止这种默认行为，把表结构进行缓存起来，提高效率

开启缓存

```php
'db' => [
    //...
    'enableSchemaCache' => true,
    'schemaCacheDuration' => 86400, // time in seconds
    //...
],
```

当开启了数据库的表结构缓存之后，需要执行一些 DDL 语句时，就会出现表结构错误的故障

这个时候就需要刷新或者清除数据库表结构的缓存信息

```php
//flush all the schema cache
Yii::$app->db->schema->refresh();

//clear the particular table schema cache
Yii::$app->db->schema->refreshTableSchema($tableName);
```
