---
title: 使用PHPUnit
urlname: laravel-phpunit
date: 2018-05-27 10:44:40
category: laravel
tags: laravel
---
如果是使用 Laravel 安装器创建的项目，则已经安装好了 PHPUnit
```json
"require-dev": {
    //...
    "phpunit/phpunit": "^7.0"
},
"autoload-dev": {
    "psr-4": {
        "Tests\\": "tests/"
    }
},
```
根目录有 `phpunit.xml` 配置文件
#### 创建用例
```bash
php artisan make:test UserTest
```
该命令会在 `tests/Feature` 目录中创建一个新的 `UserTest` 类
<!-- more -->
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testExample()
    {
        $this->assertTrue(true);
    }
}
```
#### 应用测试
看看示例方法 `ExampleTest`：
```php
public function testBasicTest()
{
    $response = $this->get('/');

    $response->assertStatus(200);
}
```
本方法断言这个 `GET` 请求的响应码为 `200`
#### 测试 JSON APIs
一个 `POST` 请求的测试来断言 `/user` 会返回给定数组的 JSON 格式：
```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJson([
        'created' => true,
    ]) ;
```
`seeJson` 方法会转换给定的数组为 JSON，并且会验证应用响应的完整 JSON 中是否会出现相应的片段。所以，如果响应中还含有其他 JSON 属性，那么这个测试依然会被通过。
- 验证完全匹配的 JSON
如果你希望验证完整的 JSON 响应，你可以使用 seeJsonEquals 方法，除非 JSON 相应于所给定的数组完全匹配，否则该测试不会被通过：
```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJsonEquals([
        'created' => true,
    ]);
```
- 验证匹配 JSON 结构
验证 JSON 响应是否采取给定的结构也是可以的。你可以使用 seeJsonStructure 方法并传递嵌套的键列表：
```php
$this->get('/user/1')
    ->seeJsonStructure([
        'name',
        'pet' => [
          'name', 'age'
        ]
    ]);
```
在上面的例子中表明了期望获取一个含有 name 和 pet 属性的 JSON，并且 pet 键是一个含有 name 和 age 属性的对象。如果含有额外的键，`seeJsonStructure` 方法并不会失败。比如，如果 pet 还含有 weight 属性，那么测试依然会被通过。

你可以使用 * 来断言所返回的 JSON 结构中的每一项都应该包含所列出的这些属性：
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