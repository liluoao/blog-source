---
title: Laravel的中间件
urlname: laravel-middleware
date: 2018-05-22 14:58:37
category: laravel
tags: laravel
---
#### 创建中间件
Artisan命令，在 `app/Http/Middleware` 目录创建类：
```bash
php artisan make:middleware CheckLogin
```

由处理逻辑的位置决定是前置还是后置：
```php
public function handle($request, Closure $next)
{
    // 这里就是前置

    return $next($request);
}
//or
public function handle($request, Closure $next)
{
    $response = $next($request);

    // 这里就是后置

    return $response;
}
```
<!-- more -->
#### 注册中间件
打开 `app/Http/Kernel` 内核：
```php
/**
 * 全局中间件
 */
protected $middleware = [
    //...
];

/**
 * 路由组
 */
protected $middlewareGroups = [
    'web' => [
        //
    ],
    'api' => [
        //
    ],
];

/**
 * 自定义
 */
protected $routeMiddleware = [
    'checkLogin' => \App\Http\Middleware\CheckLogin::class,
];
```
`RouteServiceProvider` 将 web 中间组自动应用到 `routes/web.php`
将 api 中间组自动应用到 `routes/api.php`

#### 使用中间件
参数使用 `:` 隔开，多个参数使用 `,` 分隔
```php
//为整个路由组分配中间件
Route::group([
        'prefix' => 'customer', 
        'namespace' => 'Crm', 
        'middleware' => 'checkLogin'
    ], function () {
    //为单个路由分配中间件
    Route::get('customer-list', 'CustomerController@getCustomerList')->middleware('checkAction:9');
}
```
接收参数：
```php
class CheckAction {
    public function handle($request, Closure $next, $actionId) {
        //校验是否有权限
        Action::checkAction($actionId);

        return $next($request);
    }
}
```
在控制器中使用：
```php
class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');

        $this->middleware('log')->only('index');

        $this->middleware('subscribed')->except('store');
    }
}
```
