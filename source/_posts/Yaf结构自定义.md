---
title: Yaf结构自定义
urlname: yaf-individualization
date: 2019-09-21 14:14:44
category: PHP框架
tags: yaf
---

## Yaf 介绍

1. 用 C 语言开发的 PHP 框架，相比原生的 PHP 几乎不会带来额外的性能开销
2. 所有的框架类不需要编译，在 PHP 启动的时候加载并常驻内存
3. 更短的内存周转周期，提高内存利用率，降低内存占用率
4. 灵巧的自动加载。支持全局和同部两种加载规则，方便类库共享
5. 高性能的视图引擎
6. 高度灵活可扩展的框架，支持自定义视图引擎、插件、自定义路由等等
7. 内建多种路由，可以兼容目前常见的各种路由协议
8. 强大而又高度灵活的配置文件支持，并支持缓存配置文件，避免复杂的配置结构带来的性能损失
9. 在框架本身，对危险的操作习惯做了禁止
10. 更快的执行速度，更少的内存占用

<!-- more -->

由于 Yaf 只提供一个 MVC 的基本骨架，所以我们有很大的开发自由度，可以实现一个自己最习惯的项目

## 执行流程

![Yaf生命流程](https://i.imgtg.com/2022/08/09/ADmYx.png)

## 实现Laravel结构

可以通过修改配置来变更代码结构，例如在入口修改配置文件夹

```php public/index.php
define('APP_ROOT', dirname(__DIR__));

$app = new Yaf\Application(APP_ROOT.'/config/application.ini');
try {
    $app->bootstrap()->run();
} catch (Yaf\Exception\LoadFailed\Action $e) {
    echo '方法输入错误';
    exit();
} catch (Yaf\Exception\LoadFailed\Controller $e) {
    echo '控制器输入错误';
    exit();
}
```

修改应用目录和启动文件位置

```ini application.ini
application.directory = APP_ROOT "/app/"
application.bootstrap = APP_ROOT "/bootstrap/app.php"
application.library = APP_ROOT "/app/Library"
```

这样就有了基础的结构，你可以加入 `Laravel Mix` 支持前端，或者是引入 `Symfony 命令行`

```php
use Symfony\Component\Console\Application;
$application = new Application();
// ... register commands
$application->run();
```

## 启动文件

启动文件经常实现的方法有几个，例如

```php
    /**
     * composer autoload.
     */
    public function _initAutoload()
    {
        $autoload = APP_ROOT . '/vendor/autoload.php';
        if (file_exists($autoload)) {
            Yaf\Loader::import($autoload);
        }
    }

    /**
     * disable view.
     *
     * @param Yaf\Dispatcher $dispatcher
     */
    public function _initView(Dispatcher $dispatcher)
    {
        $dispatcher->disableView();
    }
```

你可以选择把很多验证放在这里，如白名单、参数处理、路由重新分发等。我选择在这里把常量放入 Registry

```php
    public function _initConfig()
    {
        $const = new \Yaf\Config\Ini(APP_ROOT . '/config/const.ini');
        Yaf\Registry::set('const_config', $const);
    }
```

在项目中使用常量时可以直接获取

```php
$foo = Yaf\Registry::get('const_config')->bar;
```

## 单元测试

由于 Yaf 只能同时存在一个应用，所以我们需要一个基类实现单例

如果是测试接口的返回值，需要测试用例，可以使用 Simple 请求

```php
public function testQueryMobile()
{
    ob_start();

    $request = new Yaf\Request\Simple('CLI', 'index', 'querymobile', 'exec', [
        'ascode' => 'xxxxx',
        //...
    ]);
    self::getInstance()->getDispatch()->dispatch($request);

    $result = ob_get_contents();
    ob_end_clean();
    $this->assertEquals(0, $result);
}
```

如果是单元测试，直接常规操作就行了

```php
const TEST_MOBILE = '156XXXXXXXX';

public function testInsertMobile()
{
    $model = new \MobileModel();
    $result = $model->insertMobile(self::TEST_MOBILE);
    $this->assertArrayHasKey('mobile', $result);
}
```

## 命令行脚本

如果想自己实现命令行脚本，可以使用控制器的抽象方法实现

先创建一个脚本统一入口 `yaf`

```php yaf
#!/usr/bin/env php
<?php

$env = get_cfg_var('env');

define('APPLICATION_ENV', $env);

define('APP_ROOT', dirname(__FILE__));

$action = $argv[1] ?? '';
if (empty($action) || !is_string($action)) {
    echo '请输入命令' . PHP_EOL;
    exit();
}

$origin_params = array_slice($argv, 2);
$params = [];

foreach ($origin_params as $origin_param) {
    $temp = explode('=', $origin_param);
    $params[$temp[0]] = $temp[1];
}

$app = new Yaf\Application(APP_ROOT . '/config/application.ini', APPLICATION_ENV);
$app->bootstrap();

try {
    $app->getDispatcher()->dispatch(new Yaf\Request\Simple('CLI', 'index', 'console', $action, $params));
} catch (Yaf\Exception\LoadFailed\Action $e) {
    echo '未识别的命令' . PHP_EOL;
    exit();
}
```

这样就能在命令行统一访问 console 控制器了

```bash
php yaf 脚本名
```

下一步就是创建 `ConsoleController`

```php
class ConsoleController extends BaseController
{
    /**
     * 命令定义.
     *
     * @var array 虚拟方法名 映射命令文件
     */
    public $actions = [
        'test' => 'Consoles/Test.php',
    ];
}
```

最后就是具体的脚本，统一放在 `app/Consoles` 下

```php
class TestAction extends \Yaf\Action_Abstract
{
    public function execute()
    {
        $controller = $this->getController();
        //...
    }
}
```

`execute()` 是控制器实际调用的方法
