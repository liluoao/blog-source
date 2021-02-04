---
title: Dingo与接口开发
urlname: use-dingo-api-and-interface-development
date: 2018-10-10 10:42:37
category: PHP框架
tags: [laravel, api]
---

![](https://cdn.jsdelivr.net/gh/liluoao/cdn@0.0.4/image/dingo.png)

<!-- more -->

接口版本化算是历史难题，大致规则如下：

- 大版本

 - 原则：大版本的数量最多控制到 5 个以内，超过版本限制的版本提示升级到新版本
 - 方案
   1. URI 携带版本号，例如：*v1/user/get*
   2. 请求参数，例如：_user/get?v=1.0_

- 小版本

 - 原则：自己把控
 - 方案
   1. URI 携带版本号，例如：_v1/user/get_01_
   2. 请求参数，小数点右边就是小版本，例如：_user/get?v=1.1_

[Dingo](https://github.com/dingo/api) 的一个特色就是支持 `API Versioning`

通过 Composer 安装后发布配置文件：

```bash
php artisan vendor:publish --provider="Dingo\Api\Provider\LaravelServiceProvider"
```

## 路由

```php
$api = app('Dingo\Api\Routing\Router');
$api->version('v1', function ($api) {
    $api->get('users/{id}', 'App\Api\V1\Controllers\UserController@show');
});

$api->version('v2', function ($api) {
    $api->get('users/{id}', 'App\Api\V2\Controllers\UserController@show');
});

//分组
$api->version('v3', function ($api) {
    $api->group(['middleware' => 'foo'], function ($api) {
        $api->get('users/{id}', 'App\Api\Controllers\UserController@show');
    });
});
```

## 响应

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
return $this->response->error('This is an error.', 404);
return $this->response->errorNotFound();
return $this->response->errorBadRequest();
return $this->response->errorForbidden();
return $this->response->errorInternal();
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

## 接口参数定义

接口设计中往可以抽象出一些新的公共参数，常见的公共接口参数如下：

- timestamp 毫秒级时间戳

 1. 客户端的请求时间标识
 2. 后端可以做请求过期验证
 3. 增加签名的唯一性

- app_key 签名公钥

 签名算法的公钥，后端通过公钥可以得到对应的私钥

- sign 接口签名

 通过请求的参数和定义好的签名算法生成接口签名，防止中间人篡改请求

- did 设备 ID

 设备的唯一标识，如 Android MAC 地址的 MD5
 1. 数据收集
 2. 便于问题追踪
 3. 消息推送标示

## 安全性

接口的设计肯定绕不开安全，我们需要尽可能的增加被攻击的难度，以下是常见手段：

- 过期验证

```php
if (microtime(true)*1000 - $_REQUEST['timestamp'] > 5000) {
    throw new Exception(401, 'Expired request');
}
```

- 签名验证

```php
//公钥校验省略
$params = ksort($_REQUEST);
unset($params['sign']);
$sign = md5(sha1(implode('-', $params) . $_REQUEST['app_key']));
if ($sign !== $_REQUEST['sign']) {
    throw new Exception(401, 'Invalid sign');
}
```

- 重放攻击

```php
//noise：随机字符串或随机正整数，用于防止重放攻击
$key = md5("{$_REQUEST['REQUEST_URI']}-{$_REQUEST['timestamp']}-{$_REQUEST['noise']}-{$_REQUEST['did']}");
if ($redisInstance->exists($key)) {
    throw new Exception(401, 'Repeated request');
}
```

- 限流

```php
$key = md5("{$_REQUEST['REQUEST_URI']}-{$_REQUEST['REMOTE_ADDR']}-{$_REQUEST['did']}");
if ($redisInstance->get($key) > 60) {
    throw new Exception(401, 'Request limit');
}
$redisInstance->incre($key);
```

- 转义

```php
$username = htmlspecialchars($_REQUEST['username']);
```

## 可读性

接口可读性核心就是 RESTful

1. 每一个 URI 代表 1 种资源

2. 客户端使用 `GET`、`POST`、`PUT`、`DELETE` 4 个表示操作方式的动词对服务端资源进行操作
 `GET` 用来获取资源，`POST` 用来新建资源（也可以用于更新资源），`PUT` 用来更新资源，`DELETE` 用来删除资源
 需要配置服务器使支持 PUT 与 DELETE，否则会返回 405 Not Allowed

3. 通过操作资源的表现形式来操作资源

例如 GET _/content/article/1_ ：获取内容资源下文章 ID 为 1 的文章资源

HTTP 的响应代码可用于应付不同场合，正确使用这些状态代码意味着客户端与服务器可以在一个具备较丰富语义的层次上进行沟通

例如，201（Created）响应代码表明已经创建了一个新的资源，其 URI 在 Location 响应报头里

假如不利用 HTTP 状态代码丰富的应用语义，将错失提高重用性、增强互操作性和提升松耦合性的机会

200（OK） - 表示已在响应中发出
201（Created）- 如果新资源被创建
202（Accepted）- 已接受处理请求但尚未完成（异步处理）
204（No Content） - 无响应体
301（Moved Permanently） - 资源的 URI 已被更新
303（See Other） - 其他（如，负载均衡）
304（Not Modified）- 资源未更改（缓存）
400（Bad Request）- 坏请求（如参数错误）
404（Not Found）- 资源不存在
406（Not Acceptable）- 服务端不支持所需
409（Conflict）- 通用冲突
412（Precondition Failed）- 前置条件失败（如执行条件更新时的冲突）
415（Unsupported Media Type）- 接受到的不受支持
500（Internal Server Error）- 通用错误
503（Service Unavailable）- 服务端当前无法处理请求
