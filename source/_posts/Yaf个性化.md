---
title: Yaf个性化
urlname: yaf-individualization
date: 2019-09-21 14:14:44
tags: [php,yaf]
---

## 执行流程

由于 Yaf 只提供一个 MVC 的基本骨架，所以我们有很大的开发自由度，来实现一个最适合自己的项目。

![Yaf执行流程](/images/yaf-life-cycle.png)

## 实现Laravel结构

可以通过修改配置来变更代码结构，例如在 `public/index.php` 入口修改配置文件夹

```php
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

在 `application.ini` 中修改应用目录和启动文件位置

```ini
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

```php
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
