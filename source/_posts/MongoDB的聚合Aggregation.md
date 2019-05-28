---
title: MongoDB的聚合Aggregation
url-name: mongodb-aggregation
date: 2019-05-28 10:15:54
tags: mongo
---

这里分享的是管道方式，Map-Reduce和单用途聚合可以查看[官方文档](https://docs.mongodb.com/manual/aggregation/)
![Map-Reduce方式](https://docs.mongodb.com/manual/_images/map-reduce.bakedsvg.svg)

## 引子
在做一个统计功能的时候，需要对Mongo里的集合进行求和。在查出来想循环求和时，数据量太大导致内存溢出，需要换一种实现方式。

<!-- more -->

## 数据格式
每个销售每天一条记录，有个大数组存放了每个产品的成交数量，暂时忽略其中数据
```php
[
    'si_id' => xxx,
    'date' => '2019-05-28',
    'data' => [
        0 => [
            'product_name' => '产品A',
            'product_id' => 1,
            'num' => 123
        ],
        //...
    ]
]
```
需要统计一个销售或部门（包含很多销售），在一段时间内（包含很多天）的成交数据

## 第一阶段
首先使用 `$match` 查询条件内的记录
```php
[
    '$match' => [
        'si_id' => [
            '$in' => [1,2,3,4]
        ],
        'date' => [
            '$gte' => '2019-05-01',
            '$lte' => '2019-05-30'
        ]
    ]
]
```

## 第二阶段
如果需要，使用 `$project` 指定查询列
```php
[
    '$project' => [
        'data' => [
            '$filter' => [
                'input' => '$data',
                'as' => 'temp',
                'cond' => [
                    '$eq' => [
                        '$$temp.product_id', 1
                    ]//只查询产品ID为1的记录
                ]
            ]
        ]
    ]
]
```

由于需要处理数组，所以要加上 `$unwind`
```php
[
    '$unwind' => '$data'
]
```

## 第三阶段
使用 `$group` 进行求和
```php
[
    '$group' => [
        '_id' => '$data.product_id',
        'num' => [
            '$sum' => '$data.num'
        ]//对num字段进行求和
    ]
]
```

## 结束
```php
see MongoDB\Collection::aggregate()
```
