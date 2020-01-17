---
title: Yii2的批处理查询
urlname: yii2-batch-query
date: 2019-02-19 15:39:11
category: PHP框架
tags: [yii,php]
---

Yii2 官方文档中对于[大数据处理](https://www.yiiframework.com/doc/guide/2.0/en/db-query-builder#batch-query)是这样说的：

当需要处理大数据的时候，像 `yii\db\Query::all()` 这样的方法就不太合适了， 因为它们会把所有查询的数据都读取到客户端内存上。为了解决这个问题， Yii 提供了批处理查询的支持。服务端先保存查询结果，然后客户端使用游标（cursor） 每次迭代出固定的一批结果集回来。

但是，下面有非常显眼的 WARNING ：**MySQL 批处理查询的实现存在已知的局限性**

<!-- more -->

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

但是在 [MySQL PHP驱动程序概述](https://secure.php.net/manual/en/mysqlinfo.concepts.buffering.php) 中说道： **查询默认使用缓冲模式**，也就是说，之前的查询结果一直占用着内存，并不像我们以为的每次去取了 5000 条执行，。

要禁用缓存并减少客户端内存的需求量，PDO 的连接属性 `PDO::MYSQL_ATTR_USE_BUFFERED_QUERY` 必须设置为 `false`。这样，直到整个数据集被处理完毕前，通过此连接是无法创建其他查询的。

我们可以通过切换原本的连接到非缓存模式，然后在批量查询完成后再切换回来。

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
