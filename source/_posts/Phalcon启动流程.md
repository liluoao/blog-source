---
title: Phalcon启动流程
urlname: phalcon-installation-and-startup-process
date: 2018-03-17 10:37:19
category: PHP框架
tags: phalcon
---

![](https://cdn.jsdelivr.net/gh/liluoao/cdn@0.0.3/image/phalcon.png)

Phalcon 是一个使用 C 编写、高性能的 PHP 框架

<!-- more -->

Windows 用户下载 *.dll* 文件，加入 *php.ini* ：

```ini
extension = php_phalcon.dll
```

Linux 安装方法见：[Linux/Unix/Mac](https://phalcon.io/zh-cn/download/linux)

## 安装 Phalcon-devtool

[phalcon-devtools](https://github.com/phalcon/phalcon-devtools) 是 Phalcon 开发者工具，可以自动生成代码，为 IDE 创建 Phalcon 语法提示。

clone 下来后将 *~/phalcon-devtools* 目录加入环境变量，方便使用

```bash
phalcon --help
```

成功返回如下信息：

```bash
Phalcon DevTools (3.2.12)

Help:
  Lists the commands available
in
 Phalcon devtools

Available commands:
  info             (alias of: i)
  commands         (alias of: list, enumerate)
  controller       (alias of: create-controller)
  module           (alias of: create-module)
  model            (alias of: create-model)
  all-models       (alias of: create-all-models)
  project          (alias of: create-project)
  scaffold         (alias of: create-scaffold)
  migration        (alias of: create-migration)
  webtools         (alias of: create-webtools)
  serve            (alias of: server)
  console          (alias of: shell, psysh)
```

## 为 IDE 创建语法提示

进入 *~/phalcon-devtools/ide* 文件夹，运行命令：

```bash
php gen-stubs.php
```

它会在本文件夹中生成相应版本语法目录，在你的 PHPStorm 中配置 `Configure PHP Include Paths` 即可。

## 框架文件

Phalcon 对于结构要求不固定，单模块例子如下：

```
    app/
        controllers/
        models/
        views/
    public/
        css/
        img/
        js/
```

多模块例子：

```
  apps/
    frontend/
       controllers/
       models/
       views/
       Module.php
    backend/
       controllers/
       models/
       views/
       Module.php
  public/
    css/
    img/
    js/
```

## 启动流程

入口文件简化后一共5行，包含了整个 Phalcon 的启动流程，以下将按顺序说明

### DI 注册阶段

Phalcon的所有组件服务都是通过 [DI（依赖注入）](https://docs.phalcon.io/4.0/zh-cn/api/phalcon_di)进行组织的，这也是目前大部分主流框架所使用的方法

通过 DI，可以灵活的控制框架中的服务：哪些需要启用，哪些不启用，组件的内部细节等等，因此 Phalcon 是一个松耦合可替换的框架，完全可以通过 DI 替换 MVC 中任何一个组件

```php public/index.php line 1
require  __DIR__ . '/../config/services.php';
```

这个文件中默认注册了`Phalcon\Mvc\Router`（路由）、`Phalcon\Mvc\Url`（Url）、`Phalcon\Session\Adapter\Files`（Session）三个最基本的组件

同时当MVC启动后，DI中默认注册的服务还有很多，可以通过DI得到所有当前已经注册的服务：

```php
$services = $application->getDI()->getServices();
foreach ($services as $key => $service) {
   var_dump($key);
   var_dump(get_class($application->getDI()->get($key)));
}
```

打印看到 Phalcon 还注册了以下服务：

* dispatcher：`Phalcon\Mvc\Dispatcher` 分发服务，将路由命中的结果分发到对应的Controller
* modelsManager：`Phalcon\Mvc\Model\Manager` Model管理
* modelsMetadata：`Phalcon\Mvc\Model\MetaData\Memory` ORM表结构
* response：`Phalcon\Http\Response` 响应
* cookies：`Phalcon\Http\Response\Cookies` Cookies
* request：`Phalcon\Http\Request` 请求
* filter：`Phalcon\Filter` 可对用户提交数据进行过滤
* escaper：`Phalcon\Escaper` 转义工具
* security：`Phalcon\Security` 密码Hash、防止CSRF等
* crypt：`Phalcon\Crypt` 加密算法
* annotations：`Phalcon\Annotations\Adapter\Memory` 注解分析
* flash：`Phalcon\Flash\Direct` 提示信息输出
* flashSession：`Phalcon\Flash\Session` 提示信息通过Session延迟输出
* tag：`Phalcon\Tag` View的常用Helper

而每一个服务都可以通过 DI 进行替换。接下来实例化一个标准的 MVC 应用，然后将我们定义好的 DI 注入进去

```php public/index.php line 2-3
$application = new Phalcon\Mvc\Application();
$application->setDI($di);
```

### 模块注册阶段

与 DI 一样，Phalcon 建议通过引入一个独立文件的方式注册所有需要的模块：

```php public/index.php line 4
require __DIR__ . '/../config/modules.php';
```

这个文件的内容如下

```php config/modules.php
$application->registerModules(array(    
   'frontend' => array(
        'className' =>'Eva\Frontend\Module',
        'path' => __DIR__ . '/../apps/frontend/Module.php'
    )
));
```

可以看到 Phalcon 的模块注册其实只是告诉框架 MVC 模块的引导文件 `Module.php` 所在位置及类名是什么

### MVC阶段

`$application->handle()` 是整个MVC的核心，这个函数中处理了路由、模块、分发等MVC的全部流程

处理过程中在关键位置会通过事件驱动触发一系列事件，方便外部注入逻辑，最终返回一个`Phalcon\Http\Response`

整个 handle 方法的过程并不复杂，下面按顺序介绍：

#### 基础检查

首先检查 DI，如果没有任何注入，会抛出错误

> A dependency injection object is required to access internal services

然后从 DI 启动 EventsManager，并且通过 EventsManager 触发事件 `application:boot`

#### 路由阶段

接下来进入路由阶段，从 DI 中获得路由服务，将 uri 传入路由并调用路由的 `handle()` 方法

路由的 handle 方法负责将一个 uri 根据路由配置，转换为相应的 Module、Controller、Action 等

这一阶段接下来会检查路由是否命中了某个模块，并通过 `Router->getModuleName()` 获得模块名，如果模块存在，则进入模块启动阶段，否则直接进入分发阶段

#### 模块启动

模块启动时首先会触发 `application:beforeStartModule` 事件

事件触发后检查模块的正确性，根据 *modules.php* 中定义的 `className`、`path` 等，将模块引导文件加载进来，并调用模块引导文件中必须存在的方法

模块启动完成后触发 `application:afterStartModule`事件，进入分发阶段

#### 分发阶段（Dispatch）

分发过程由 `Phalcon\Mvc\Dispatcher`（分发器）来完成

所谓分发，在 Phalcon 里本质上是分发器根据路由命中的结果，调用对应的 Controller/Action，最终获得 Action 返回的结果

分发开始前首先会准备 View，虽然 View 位于 MVC 的最后一环，但是如果在分发过程中出现任何问题，通常都需要将问题显示出来，因此View必须在这个环节就提前启动

Phalcon 没有准备默认的 View 服务，需要从外部注入，如果始终没有 View 注入，会抛出错误，导致分发过程直接中断

> Service 'view' was not found in the dependency injection container

分发开始前还会触发事件 `application:beforeHandleRequest`，正式开始分发会调用`Phalcon\Mvc\Dispatcher->dispatch()`

#### 渲染阶段（View Render）

分发结束后会触发 `application:afterHandleRequest`

接下来通过 `Phalcon\Mvc\Dispatcher->getReturnedValue()` 取得分发过程返回的结果并进行处理

由于 Action 的逻辑在框架外，Action 的返回值是无法预期的，因此这里根据返回值是否实现 `Phalcon\Http\ResponseInterface` 接口进行区分处理

1. 当 Action 返回一个**非**此接口类型
此时认为返回值无效，由 View 自己重新调度 Render 过程，会触发 `application:viewRender` 事件，完毕后调用 `Phalcon\Mvc\View->finish()` 结束缓冲区的接收
接下来从 DI 获得 Response 服务，将 `Phalcon\Mvc\View->getContent()` 获得的内容置入 Response
2. 当 Action 返回一个此接口类型
此时会将 Action 返回的 Response 作为最终的响应

#### 返回响应

通过前面的流程，无论中间经历了多少分支，最终都会汇总为唯一的响应

此时会触发 `application:beforeSendResponse`，并调用 `Phalcon\Http\Response` 里的 `sendHeaders()` 和 `sendCookies()`，将头部信息先行发送

至此，`Application->handle()` 对于请求的处理过程全部结束，对外返回一个 `Phalcon\Http\Response` 响应

#### 发送响应

HTTP 头部发送后一般把响应的内容也发送出去：

```php public/index.php line 5
echo $application->handle()->getContent();
```
