---
title: Laravel操作JSON字段
date: 2020-05-20 19:10:34
urlname: mysql-json-column-in-laravel
category: PHP框架
tags: [laravel, mysql]
---

MySQL 5.7.8 开始支持 JSON 类型

Laravel 从 5.3 开始加入了 JSON 类型支持

下面用一个示例表来学习本类型的 CURD

<!-- more -->

表结构：

```sql
create table product
(
    id            int unsigned auto_increment     primary key,
    attribute     json                            null comment '属性'
);
```

Laravel 中定义此 Model：

```php
class Product extends Model
{
    protected $table = 'product';

    protected $guarded = ['id'];

    protected $casts = [
        'attribute' => 'json',
    ];
}
```

需要在 `$casts` 属性中声明 JSON 格式字段

## 新增

原生 SQL

```sql
INSERT INTO product VALUES (1, '{"color": "黑色", "size": "XXL"}');
INSERT INTO product VALUES (2, '{"color": "白色", "size": "XL"}');
```

Model 新增

```php
$product = new Product();
$product->attribute = [
    'color' => '黑色',
    'size' => 'XXL',
]
$product->saveOrFail();
```

## 修改

原生 SQL

```sql
UPDATE product SET attribute = JSON_SET(attribute, '$.color', '黑') WHERE id = 1
```

- `JSON_SET()` 替换已经存在的值，增加不存在的值
- `JSON_INSERT()` 新增不存在的值
- `JSON_REPLACE()` 替换/修改已经存在的值

Model 修改

```php
Product::find(2)->update([
    'attribute->size' => 'XXL'
]);
```

## 查询

原生 SQL

```sql
SELECT * FROM product WHERE `attribute`->'$.color'= '黑色'
```

Model 查询

```php
Product::where('attribute->color', '黑色')->get();
```

## 删除

原生 SQL

```sql
UPDATE product SET attribute = JSON_REMOVE(`attribute`, '$."color"') WHERE id = 1;
```

[JSON_REMOVE() – Remove Data from a JSON Document in MySQL](https://database.guide/json_remove-remove-data-from-a-json-document-in-mysql/)

Model 删除

```php
Product::find(1)->update([
    'attribute' => \DB::raw('JSON_REMOVE(attribute, \'$."color"\')'),
]);
```
