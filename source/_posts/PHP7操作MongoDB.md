---
title: PHP7操作MongoDB
urlname: php-7-use-mongodb
date: 2018-07-23 18:54:24
category: 数据库
tags: [php,mongo]
---

## 前言
使用 **PHP+MongoDB** 的用户很多，因为 **MongoDB** 对非结构化数据的存储很方便。在 **PHP5** 及以前，官方提供了两个扩展，`Mongo` 和 `MongoDB`，其中 `Mongo` 是对以 `MongoClient` 等几个核心类为基础的类群进行操作，封装得很方便，所以基本上都会选择 `Mongo` 扩展。

详情请见官方手册：http://php.net/manual/zh/book.mongo.php

但是随着 **PHP5** 升级到 **PHP7**，官方不再支持 **Mongo** 扩展，只支持 **MongoDB**，而 **PHP7** 的性能提升巨大，让人无法割舍，所以怎么把 **Mongo** 替换成 **MongoDB** 成为了一个亟待解决的问题。**MongoDB** 引入了命名空间，但是功能封装非常差，如果非要用原生的扩展，几乎意味着写原生的 *Mongo* 语句。这种想法很违背 *ORM* 简化 DB `IO` 操作带来的语法问题而专注逻辑优化的思路。

<!-- more -->

详情也可参见官方手册：[mongodb.php](http://php.net/manual/zh/set.mongodb.php)

在这种情况之下，MongoDB 官方忍不住了，为了方便使用，增加市场占有率，推出了基于MongoDB 扩展的库：[mongo-php-library](https://github.com/mongodb/mongo-php-library)

该库的详细文档见：[docs.mongodb.com](https://docs.mongodb.com/php-library/current/reference/)

composer 下载：
```ini
composer require mongodb/mongodb
```
## MongoDB 驱动
如果使用原驱动的话，大致语法如下：

```php
<?php

use MongoDB\Driver\Manager;
use MongoDB\Driver\BulkWrite;
use MongoDB\Driver\WriteConcern;
use MongoDB\Driver\Query;
use MongoDB\Driver\Command;

class MongoDb {

    protected $mongodb;
    protected $database;
    protected $collection;
    protected $bulk;
    protected $writeConcern;
    protected $defaultConfig
        = [
            'hostname' => 'localhost',
            'port' => '27017',
            'username' => '',
            'password' => '',
            'database' => 'test'
        ];

    public function __construct($config) {
        $config = array_merge($this->defaultConfig, $config);
        $mongoServer = "mongodb://";
        if ($config['username']) {
            $mongoServer .= $config['username'] . ':' . $config['password'] . '@';
        }
        $mongoServer .= $config['hostname'];
        if ($config['port']) {
            $mongoServer .= ':' . $config['port'];
        }
        $mongoServer .= '/' . $config['database'];

        $this->mongodb = new Manager($mongoServer);
        $this->database = $config['database'];
        $this->collection = $config['collection'];
        $this->bulk = new BulkWrite();
        $this->writeConcern = new WriteConcern(WriteConcern::MAJORITY, 100);
    }

    public function query($where = [], $option = []) {
        $query = new Query($where, $option);
        $result = $this->mongodb->executeQuery("$this->database.$this->collection", $query);

        return json_encode($result);
    }

    public function count($where = []) {
        $command = new Command(['count' => $this->collection, 'query' => $where]);
        $result = $this->mongodb->executeCommand($this->database, $command);
        $res = $result->toArray();
        $count = 0;
        if ($res) {
            $count = $res[0]->n;
        }

        return $count;
    }

    public function update($where = [], $update = [], $upsert = false) {
        $this->bulk->update($where, ['$set' => $update], ['multi' => true, 'upsert' => $upsert]);
        $result = $this->mongodb->executeBulkWrite("$this->database.$this->collection", $this->bulk, $this->writeConcern);

        return $result->getModifiedCount();
    }

    public function insert($data = []) {
        $this->bulk->insert($data);
        $result = $this->mongodb->executeBulkWrite("$this->database.$this->collection", $this->bulk, $this->writeConcern);

        return $result->getInsertedCount();
    }

    public function delete($where = [], $limit = 1) {
        $this->bulk->delete($where, ['limit' => $limit]);
        $result = $this->mongodb->executeBulkWrite("$this->database.$this->collection", $this->bulk, $this->writeConcern);

        return $result->getDeletedCount();
    }
}
```
这样的语法和之前差异太大，改动不方便，换 *PHP MongoDB* 库

## MongoDB 库
#### 1.连接
- 原
```php
new MongoClient();
```
- 新
```php
new MongoDB\Client();
```
#### 2.新增
- 原
```php
$collention->insert($array, $options);
```
- 新
```php
$resultOne = $collention->insertOne($array, $options);//单
$lastId = $resultOne->getInsertedId();
$resultMany = $collention->insertMany($array, $options);//多
$count = $resultMany->getInsertedCount();
```
#### 3.修改
- 原
```php
$collention->update($condition, [
    '$set' => $values
,[
    'multiple' => true//多条，单条false
]);
```
- 新
```php
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
#### 4.查询
- 原
```php
$cursor = $collection->find($condition, [
    'name' => true//指定字段
]);
$cursor->skip(5);
$cursor->limit(5);
$cursor->sort([
    'time' => -1
]);
```
- 新
```php
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
#### 5.删除
- 原
```php
$collention->remove($condition, [
    'justOne' => false//删单条
]);
$collention->remove([]);//删所有
```
- 新
```php
$result = $collention->deleteOne($condition, $options);
$collention->deleteMany($condition, $options);

$result->getDeletedCount();
```

## 补充
有些人可能习惯以类似 **MySQL** 的自增 *ID* 来处理数据，以前可能使用 `findAndModify()` 方法来查询并修改：
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
类似的还有 `findOneAndDelete()` `findOneAndReplace()`，更多内容可见[findOneAndUpdate文档](https://docs.mongodb.com/php-library/current/reference/method/MongoDBCollection-findOneAndUpdate/)