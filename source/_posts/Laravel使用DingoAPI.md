---
title: 使用DingoAPI
urlname: laravel-use-dingo-api
date: 2018-05-28 11:52:27
category: laravel
tags: laravel
---
通过 Composer 安装：
```json
"require": {
    "dingo/api": "2.0.0-alpha1"
}
```
发布配置文件：
```bash
php artisan vendor:publish --provider="Dingo\Api\Provider\LaravelServiceProvider"
```
#### 端点（路由）
```php
$api = app('Dingo\Api\Routing\Router');
$api->version('v1', function ($api) {
    $api->get('users/{id}', 'App\Api\V1\Controllers\UserController@show');
});

$api->version('v2', function ($api) {
    $api->get('users/{id}', 'App\Api\V2\Controllers\UserController@show');
});
```
> 提醒，你需要为控制器添加说明完整的命名空间，比如， `App\Http\Controllers`.

<!-- more -->
分组：
```php
$api->version('v1', function ($api) {
    $api->group(['middleware' => 'foo'], function ($api) {
        $api->get('users/{id}', 'App\Api\Controllers\UserController@show');
    });
});
```
#### 响应
控制器需要使用 `Dingo\Api\Routing\Helpers` Trait：
```php
use Dingo\Api\Routing\Helpers;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    use Helpers;
}
```
- 响应一个数组
```php
public function show($id)
{
    $user = User::findOrFail($id);

    return $this->response->array($user->toArray());
}
```
- 响应一个元素
```php
$user = User::findOrFail($id);

return $this->response->item($user, new UserTransformer);
```
- 分页响应
```php
$users = User::paginate(25);
return $this->response->paginator($users, new UserTransformer);
```
- 空响应
```php
return $this->response->noContent();
```
- 错误响应
```php
// 一个自定义消息和状态码的普通错误。
return $this->response->error('This is an error.', 404);

// 一个没有找到资源的错误，第一个参数可以传递自定义消息。
return $this->response->errorNotFound();

// 一个 bad request 错误，第一个参数可以传递自定义消息。
return $this->response->errorBadRequest();

// 一个服务器拒绝错误，第一个参数可以传递自定义消息。
return $this->response->errorForbidden();

// 一个内部错误，第一个参数可以传递自定义消息。
return $this->response->errorInternal();

// 一个未认证错误，第一个参数可以传递自定义消息。
return $this->response->errorUnauthorized();
```
- 设置响应状态码
```php
return $this->response->item($user, new UserTransformer)->setStatusCode(200);
```
- 添加额外的头信息
```php
return $this->response->item($user, new UserTransformer)->withHeader('X-Foo', 'Bar');
```
- 添加 Meta 信息
```php
return $this->response->item($user, new UserTransformer)->addMeta('foo', 'bar');
return $this->response->item($user, new UserTransformer)->setMeta($meta);
```
#### 自定义转换层
```php
use Dingo\Api\Http\Request;
use Dingo\Api\Transformer\Binding;
use Dingo\Api\Contract\Transformer\Adapter;

class MyCustomTransformer implements Adapter
{
    public function transform($response, $transformer, Binding $binding, Request $request)
    {
        // 在这里可以使用你的转换层转换给出的响应
    }
}
```
`transform` 方法是唯一必需的，除此之外你可以随意添加其他方法。`transform` 方法的目的就是获取 `$response` ，然后把它和 `$transformer` 一起发到转换层。转换层这里应该由 `transform` 方法返回一个数组。当然，如果转换非常简单，可直接在类内部实现转换。

`$binding` 参数可以让转换层具有更高级的特性，比方，增加元数据或者允许其他开发者通过回调方法和你的转换层进行交互。

`$request` 参数是指当前正在进行的 HTTP 请求，当你需要请求中的相关数据，这个可以派上用场。