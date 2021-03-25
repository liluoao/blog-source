---
title: MongoDB In PHP7
urlname: use-mongodb-in-php-7
date: 2018-07-23 18:54:24
category: 数据库
tags: [php,mongo]
---

![](https://cdn.jsdelivr.net/gh/liluoao/cdn@main/image/mongodb.png)

使用 MongoDB 的用户很多，因为它的文档型存储一些变化的内容很方便

在 PHP5 及以前，官方提供了两个扩展，[Mongo](http://php.net/manual/zh/book.mongo.php) 和 [MongoDB](http://php.net/manual/zh/set.mongodb.php)，其中 Mongo 是对以 `MongoClient` 等几个核心类为基础的类群进行操作，封装得很方便，所以基本上都会选择 Mongo 扩展。

但是随着 PHP 升级到 PHP7，官方不再支持 Mongo 扩展，只支持 MongoDB，所以怎么把 Mongo 无缝替换成 MongoDB 成为了一个亟待解决的问题

<!-- more -->

MongoDB 引入了命名空间，但是功能封装非常差，如果非要用原生的扩展，几乎意味着写原生的 Mongo 语句

这种想法很违背 ORM 的初衷：简化 DB 操作带来的语法问题而专注逻辑优化

## MongoDB 驱动

使用新驱动的部分代码如下：

```php MongoDbDriver.php
use MongoDB\Driver\WriteConcern;

class MongoDb
{
    //属性略

    public function __construct($config)
    {
        //解析拼接配置过程略
        $this->mongodb = new \MongoDB\Driver\Manager($mongoServer);
        $this->database = $config['database'];
        $this->collection = $config['collection'];
        $this->bulk = new \MongoDB\Driver\BulkWrite();
        $this->writeConcern = new WriteConcern(WriteConcern::MAJORITY, 100);
    }

    public function insert($data = [])
    {
        $this->bulk->insert($data);
        $result = $this->mongodb->executeBulkWrite(
            "$this->database.$this->collection",
            $this->bulk,
            $this->writeConcern
        );

        return $result->getInsertedCount();
    }

    public function delete($where = [], $limit = 1)
    {
        $this->bulk->delete($where, ['limit' => $limit]);
        $result = $this->mongodb->executeBulkWrite(
            "$this->database.$this->collection",
            $this->bulk,
            $this->writeConcern
        );

        return $result->getDeletedCount();
    }

    public function update($where = [], $update = [], $upsert = false)
    {
        $this->bulk->update($where, ['$set' => $update], ['multi' => true, 'upsert' => $upsert]);
        $result = $this->mongodb->executeBulkWrite(
            "$this->database.$this->collection",
            $this->bulk,
            $this->writeConcern
        );

        return $result->getModifiedCount();
    }

    public function query($where = [], $option = [])
    {
        $query = new \MongoDB\Driver\Query($where, $option);
        $result = $this->mongodb->executeQuery("$this->database.$this->collection", $query);

        return json_encode($result);
    }
}
```

这样的语法和之前差异太大，改动不方便

在这种情况之下，MongoDB 官方为了方便使用，增加市场占有率，推出了基于 MongoDB 扩展的库：[mongo-php-library](https://github.com/mongodb/mongo-php-library)

该库的详细文档见：[docs.mongodb.com](https://docs.mongodb.com/php-library/current/reference/)

composer 下载：

```ini
composer require mongodb/mongodb
```

## MongoDB 操作包与旧 Mongo 对比

### 连接

```php
//old
new MongoClient();
//new
new MongoDB\Client();
```

### 新增

```php
//old
$collention->insert($array, $options);
//new
$resultOne = $collention->insertOne($array, $options);//单
$lastId = $resultOne->getInsertedId();
$resultMany = $collention->insertMany($array, $options);//多
$count = $resultMany->getInsertedCount();
```

### 修改

```php
//old
$collention->update($condition, [
    '$set' => $values
,[
    'multiple' => true//多条，单条false
]);
//new
$collection->updateOne(
    ['state' => 'ny'],
    ['$set' => ['country' => 'us']]
);
$updateResult = $collection->updateMany(
    ['state' => 'ny'],
    ['$set' => ['country' => 'us']]
);
$count = $updateResult->getModifiedCount();
```

### 查询

```php
//old
$cursor = $collection->find($condition, [
    'name' => true//指定字段
]);
$cursor->skip(5);
$cursor->limit(5);
$cursor->sort([
    'time' => -1
]);
//new
$cursor = $collection->find($condition, [
    'skip' => 5,
    'limit' => 5,
    'sort' => [
        'time' => -1
    ],//排序
    'projection' => [
        'name' => 1//指定字段
    ]
]);
```

### 删除

```php
//old
$collention->remove($condition, [
    'justOne' => false//删单条
]);
$collention->remove([]);//删所有
//new
$result = $collention->deleteOne($condition, $options);
$collention->deleteMany($condition, $options);

$result->getDeletedCount();
```

有业务可能需要以类似 MySQL 的自增 ID 来处理数据，PHP5 可能使用的 `findAndModify()` 方法来查询并修改：

```php
$collention->findAndModify([
    '_id' => $tableName//我在自增表中用其它的表名作主键
], [
    '$inc' => ['id' => 1]//自增
], [
    '_id' => 0
], [
    'new' => 1//返回修改后的结果，默认是修改前的
]);
```

现在使用 MongoDB 库的话需要修改为：

```php
$collention->findOneAndUpdate([
    '_id' => $tableName
], [
    '$inc' => ['id' => 1]
], [
    'projection' => ['id' => 1],
    'returnDocument' => MongoDB\Operation\FindOneAndUpdate::RETURN_DOCUMENT_AFTER
]);
```

类似的还有 `findOneAndDelete()` `findOneAndReplace()`，更多内容可见 [findOneAndUpdate文档](https://docs.mongodb.com/php-library/current/reference/method/MongoDBCollection-findOneAndUpdate/)

## ODM

在开发一个业务中，由于条件非常复杂，会出现各种 `$and` `$or` 嵌套，想添加新条件时容易出问题

所以在基类中引入了 [ODM](https://github.com/sokil/php-mongo)，支持链式查询的写法，使查询条件直观易理解

![ODM](https://cdn.jsdelivr.net/gh/liluoao/cdn@main/image/mongo-odm.png)

改造了项目中老的 Mongo 操作类，引入了新 Trait

```php MongoODMTrait.php
trait MongoODM
{
    public $mongoOdm;

    public function connectOdm($db)
    {
        //解析拼接配置过程略
        $client = new \Sokil\Mongo\Client($mongoServer);
        $database = $client->getDatabase($config['database']);
        $this->mongoOdm = new MongoOdm($database);
    }
}
```

在原有操作类中新增一行 ODM 连接

```php Mongo.php
use MongoODM;

$this->connectOdm(self::Key);
```

查询时部分示例代码如下：

```php QueryTest.php
$collection = $bean->mongoOdm->collection;
$builder = $bean->mongoOdm->find();

$builder->whereIn('sale_id', [1,2,3]);
$builder->where('identity', ['$bitsAnySet' => [$bit]]);

$builder->whereAnd(
    $collection->expression()->whereOr(
        $collection->expression()->whereGreaterOrEqual('last_time', strtotime(date('Y-m-d'))),
        $collection->expression()->whereLike('desc', "{$desc}", true)
    )
);

$total = $builder->count();

$result = $builder->fields(explode(','), $fields)
    ->sort($sort)
    ->limit($size)
    ->skip($offset)
    ->findAll();
```