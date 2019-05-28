---
title: Laravel的路由
urlname: laravel-route
date: 2018-05-04 10:55:55
category: laravel
tags: laravel
---
#### 新增路由文件
在 `app/Providers/RouteServiceProvider` 中：
```php
protected function mapWebRoutes()
{
    Route::group([
        'middleware' => 'web', 
        'namespace' => $this->namespace
        ], function () {
        require base_path('routes/web.php');
        require base_path('routes/test.php');
    });
}
```
#### 分配其他中间件组
```php
protected function mapApiRoutes()
{
    Route::prefix('api')
         ->middleware('restful-api')
         ->namespace($this->namespace)
         ->group(base_path('routes/api.php'));
}
```
#### 当前路由
```php
$route = Route::current();

$name = Route::currentRouteName();

$action = Route::currentRouteAction();
```
