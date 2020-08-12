---
title: Yii2与Laravel5的单元测试
urlname: yii-codeception-and-laravel-phpunit
date: 2019-08-02 17:03:53
category: PHP框架
tags: [yii,laravel]
photos: /images/codeception.png
---

最近一个老项目前端机所在的服务器之一宕机了，在更换新服务器后发现这个项目没有单元测试，在验证时比较麻烦

现在需要一步步为这个 Yii2.0.12 项目引入单元测试

<!-- more -->

## Yii2 Codeception

Yii 的单元测试框架 [Codeception](https://codeception.com/for/yii) 基于 PHPUnit，使用方式几乎一模一样

首先看是否已安装了本包，在 Yii 项目中使用 Composer 可能会提示如下错误：

> yiisoft/yii2 * requires bower-asset/jquery *@stable -> no matching package found.

这时需要安装这个 Composer 管理前端依赖的包，在下载中需要配置一个 GitHub 的 Token：

```
composer global require "fxp/composer-asset-plugin"
```

全部安装好后，在 *vendor/bin* 下能找到一个可执行文件 `codecept`

在项目根目录需要有一个配置文件，默认配置了 3 个测试模块：

```yml codeception.yml
# global codeception file to run tests from all apps
include:
    - common
    - frontend
    - backend
paths:
    log: console/runtime/logs
settings:
    colors: true
```

如果是项目是完整的，里面已经包含了单元测试的例子，部分结果如下：

```
$ vendor/bin/codecept run
Codeception PHP Testing Framework v2.5.6
Powered by PHPUnit 7.5.18 by Sebastian Bergmann and contributors.
Running with seed:

[common\tests]: tests from D:\WWW\yii2-app-advanced-2.0.11\common

Common\tests.unit Tests (3) ----------------------------------------------------
E LoginFormTest: Login no user (2.89s)
E LoginFormTest: Login wrong password (2.01s)
E LoginFormTest: Login correct (2.00s)
```

#### 启动引导

但是像我的项目经过了各种删减，原用例和配置都不在了，需要重新生成：

```
vendor\bin\codecept bootstrap
```

这个命令会在当前目录中生成配置文件和一个 *tests/* 目录

#### 添加套件

如果是刚安装好的，在 *tests/* 下已经有了 `functional` 和 `unit` 两个套件。自己想添加新的套件，使用 *generate:suite* 命令：

```
vendor\bin\codecept generate:suite api
```

这将在 *tests/* 目录下创建 *api.suite.yml* 配置文件和 *api/* 目录，现在使用 *generate:cest* 命令生成具体测试用例

```
vendor\bin\codecept generate:cest api GetChatLog
```

然后使用 *build* 命令构建测试

#### 运行测试

在写好你的 GetChatLog 用例后：

```php
public function tryToTest(ApiTester $I)
{
    $I->sendPOST('index/get-chat-log', ['from_id' => 1, 'to_id' => 1]);
    $I->seeResponseCodeIs(Codeception\Util\HttpCode::OK);
    $I->seeResponseIsJson();
    $I->seeResponseContainsJson(['code' => 0]);
}
```

运行测试查看结果

```
vendor\bin\codecept run api
```

## Laravel5 PHPUnit

回顾一下以前用 Laravel 5.5 时使用单元测试的方式

如果是使用 Laravel 安装器创建的项目，则已经安装好了 PHPUnit

#### 快速创建用例

```bash
php artisan make:test UserTest
```

该命令会创建一个基础的测试类

```php tests/Feature/UserTest.php
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

#### Web测试

断言某 GET 请求的响应码为 200 的示例方法 ExampleTest 如下：

```php
public function testBasicTest()
{
    $response = $this->get('/');

    $response->assertStatus(200);
}
```

#### 接口测试

下面的测试是断言 `/user` 这个 POST 接口会返回给定数组的 JSON 格式：

```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJson([
        'created' => true,
    ]) ;
```

`seeJson` 方法会转换给定的数组为 JSON，并且会验证应用响应的完整 JSON 中是否会出现相应的片段

所以，如果响应中还含有其他 JSON 属性，那么这个测试依然会被通过

#### 验证完全匹配的 JSON

如果希望验证完整的 JSON 响应，你可以使用 `seeJsonEquals()` 方法，JSON 与所给定的数组完全匹配：

```php
$this->json('POST', '/user', ['name' => 'Sally'])
    ->seeJsonEquals([
        'created' => true,
    ]);
```

#### 验证匹配 JSON 结构

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

在上面的例子中表明了期望获取一个含有 name 和 pet 属性的 JSON，并且 pet 键是一个含有 name 和 age 属性的对象

如果含有额外的键，`seeJsonStructure` 方法并不会失败。比如，如果 pet 还含有 weight 属性，那么测试依然会被通过

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
