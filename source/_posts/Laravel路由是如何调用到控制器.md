---
title: 路由如何调用到控制器
urlname: laravel-route-to-controller
date: 2018-03-13 10:37:19
category: laravel
tags: laravel
---
原文链接：[https://juejin.im/post/595f2ed76fb9a06bbe7dc4ed](https://juejin.im/post/595f2ed76fb9a06bbe7dc4ed)

### 概述 

laravel 的路由相比其他PHP框架非常灵活和优雅，它也能做的在url不变的情况下改变调用的控制器和方法。

那么这到底在 laravel 里是怎么完成的呢

### 路由到底是如何获取的？ 

这没什么神秘的，回忆一下我们写一个单页过程化 PHP 脚本时我们是如何接收 HTML 页面传输的参数的？

是的，也许你想起来了我们会使用 PHP 的超全局变量 `$_SERVER`、`$_GET`、`$_POST` 等等，是的框架的底层同样是使用它们的，只是框架进行了更详尽的封装。

laravel 对 Symfony 框架提供的 HttpFoundation 组件，这个组件对 HTTP 进行了面向对象封装，laravel在其基础上又进行了封装，以适合 laravel 框架自身的需求。

HttpFoundation 组件将 `$_GET`、`$_POST`、`$_FILES`、`$_COOKIE` 等一些超全局变量进行封装，不仅将超全局变量调用转变为面向对象的方式，而且也简化了操作。比如 `Symfony\Component\HttpFoundation\Request::createFromGlobals()` 的返回值就是所有超全局组成的一个集合。

如果你对这个组件感兴趣可以查看其文档 [HttpFoundation](https://symfony.com/doc/current/components/http_foundation.html)
<!-- more -->
### 路由是如何启动的？ 

路由启动我们要从原点找起，那么原点就是 laravel 框架的入口文件 `public/index.php`。

index.php 里首先把 bootstrap/autoload.php 引入，这个文件引入的是 composer 的 autoload 文件，将所有的包加载到脚本里，这个脚本文件还定义了一个常量 LARAVEL\_START 记录了框架启动的微秒时间戳。

然后引入了 bootstrap/app.php 脚本，这个脚本加载了 laravl 框架的核心文件，返回了一个应用实例。

随后就是后续步骤

```php
// 得到应用核心实例
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// 对请求处理后获得响应
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture() // 获得请求参数
);

// 发送响应
$response->send();

// 终止
$kernel->terminate($request, $response);
```

我们想知道路由在哪分配调用就在 `$kernel->handle()` 这里，其中调用了 `$this-sendRequestThroughRouter()`，这里就将请求发送给了中间件和路由。

`$this->dispatchToRouter()` 中 `$this->router->dispatch($request)` 就将请求传入到 Router 类中了。

然后再 Router 类的 `dispatch()` 的方法中调用了 Router 类的 `dispatchToRoute()` 方法将请求向下传递。

在`dispatchToRoute()`中你会发现 `$route = $this->findRoute($request);`的调用。  
`findRoute()` 中调用 RouteCollection 类中的 `match()` 方法去匹配在初始化框架时读取到内存中的开发者在路由定义文件里定义的路由，如果未匹配到就抛出 `NotFoundHttpException` 异常。如匹配到就返回了 Route 类的实例。

然后这个实例在 Router 类的 `dispatchToRoute()` 方法中实例有被传入到 `runRouteWithinStack()` 方法。这个方法中又调用多个方法将匹配到的开发者定义的 URL 的映射的控制器实例化，去调用控制器的 `callAction()` 方法，`callAction()` 写在控制器的基类中，就是我们写一个控制器都要继承的那个 `Conreoller` 类中。

方法很简单，就是讲传入的方法名和参数用 PHP 函数 `call_user_func_array()` 进行调用。

以上是我们的最佳实践。但是在你初始化 laravel 框架的时候他的首页是以下这样调用的。

```php
Route::get('/', function () {
    return view('welcome');
});
```

路由中使用匿名函数，在调用控制器的实例前框架先会判断是否是一个控制器动作，如何不是就获取路由中的匿名函数进行调用。判断的依据就是开发者定义的路由的第二个参数是否是一个字符串。

这是 laravel 路由的主流程，其他中间件调用，Request 验证等等都在主流程的各个步骤中附加分发调用了。

