---
title: Laravel单元测试
urlname: laravel-phpunit
date: 2018-05-27 10:44:40
category: PHP框架
tags: laravel
---

PHP 的单元测试 PHPUnit 使用非常普遍，在 Laravel 中是否一样使用呢，或者提供了更方便的方法？让我们一起了解一下吧。

<!-- more -->

如果是使用 Laravel 安装器创建的项目，则已经安装好了 PHPUnit。不是的话通过 Composer 手动安装也一样方便。
安装后的 *composer.json* 配置示例：

```json
"require-dev": {
    "phpunit/phpunit": "^7.0"
},
"autoload-dev": {
    "psr-4": {
        "Tests\\": "tests/"
    }
},
```

单元测试的配置文件 *phpunit.xml* 和平常一样使用，详细参见[附录 C. XML 配置文件](www.phpunit.cn/manual/6.5/zh_cn/appendixes.configuration.html)

## 快速创建用例

```bash
php artisan make:test UserTest
```

该命令会在 *tests/Feature* 目录中创建一个 UserTest 测试类

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    public function testExample()
    {
        $this->assertTrue(true);
    }
}
```

## Web测试

断言某 GET 请求的响应码为 200 的示例方法 ExampleTest 如下：

```php
public function testBasicTest()
{
    $response = $this->get('/');

    $response->assertStatus(200);
}
```

## 接口测试

下面的测试是断言 `/user` 这个 POST 接口会返回给定数组的 JSON 格式：

```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJson([
        'created' => true,
    ]) ;
```

`seeJson` 方法会转换给定的数组为 JSON，并且会验证应用响应的完整 JSON 中是否会出现相应的片段。
所以，如果响应中还含有其他 JSON 属性，那么这个测试依然会被通过。

### 验证完全匹配的 JSON

如果希望验证完整的 JSON 响应，你可以使用 `seeJsonEquals()` 方法，JSON 与所给定的数组完全匹配：

```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJsonEquals([
        'created' => true,
    ]);
```

### 验证匹配 JSON 结构

使用 `seeJsonStructure()` 方法并传递嵌套的键列表：

```php
$this->get('/user/1')
    ->seeJsonStructure([
        'name',
        'pet' => [
          'name', 'age'
        ]
    ]);
```

在上面的例子中表明了期望获取一个含有 name 和 pet 属性的 JSON，并且 pet 键是一个含有 name 和 age 属性的对象。
如果含有额外的键，`seeJsonStructure` 方法并不会失败。比如，如果 pet 还含有 weight 属性，那么测试依然会被通过。

你可以使用 `*` 来断言所返回的 JSON 结构中的每一项都应该包含所列出的这些属性：

```php
$this->get('/users')
    ->seeJsonStructure([
        '*' => [
          'id', 'name', 'email'
        ]
    ]);
```

你也可以嵌套使用 *，下面的例子中，我们断言 JSON 响应返回的每一个用户都应该包含所列出的属性，并且 pet 属性应该也包含所给定的属性：

```php
$this->get('/users')
    ->seeJsonStructure([
        '*' => [
            'id', 'name', 'email', 'pets' => [
                '*' => [
                    'name', 'age'
                ]
            ]
        ]
    ]);
```
