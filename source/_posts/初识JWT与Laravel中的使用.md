---
title: 初识JWT与Laravel中的使用
urlname: what-is-jwt-and-use-in-laravel
date: 2018-02-09 10:37:19
category: PHP框架
tags: laravel
photos: images/jwt-laravel.png
---

[JWT](https://jwt.io/introduction/) (Json web token)，是为了在网络应用环境间传递声明而执行的一种基于 *JSON* 格式的开放标准 ([RFC 7519](https://tools.ietf.org/html/rfc7519))，它一般被用来做身份认证。

<!-- more -->

我们来对比一下基于 Token 的认证和传统的 SESSION 认证

## 传统的 SESSION 认证

HTTP 协议本身是一种无状态的协议，意味着用户每次请求时都需要进行身份认证。为了能识别是哪个用户发出的请求，需要在服务器存储一份用户登录的信息，这份登录信息会在响应时传递给浏览器，告诉其保存为 `COOKIE`，以便下次请求时发送给我们的应用。

但是这种基于 SESSION 的认证随着不同客户端用户的增加，独立的服务器已无法承载更多的用户，暴露出来如下问题：

- 开销大
每个用户经过认证后，都要在服务端做一次记录，以方便用户下次请求。通常而言 SESSION 都是保存在内存中，而随着认证用户的增多，服务端的开销会明显增大。

- 扩展性差
用户认证之后，意味着下次必须是同个服务器才能避免再次认证，这样在分布式的应用上，限制了负载均衡的能力，也意味着限制了应用的扩展。

- 易被CSRF攻击
因为是基于 COOKIE 来进行用户识别的，如果被截获，用户就会很容易受到跨站请求伪造的攻击。

## 基于 Token 的鉴权机制

类似于 HTTP 协议，它也是无状态的，不需要在服务端去保留用户的认证信息或者会话信息。

流程上是这样的：

1. 用户使用账号密码来请求服务器
2. 服务器验证用户
3. 服务器通过验证发送给用户一个 Token
4. 客户端存储 Token，并在每次请求时附上它
5. 服务端验证 Token，并返回数据

Token 一般放在请求头里

## JWT 的格式

JWT 是由三段信息构成的，将这三段用 `"."` 连接在一起就构成了 JWT 字符串

![JWT格式](/images/jwt.png)

第一部分我们称它为**头部（Header)**，第二部分我们称其为**载荷（Payload）**，第三部分是**签证（Signature)**

### 头部 Header

JWT 的头部承载两部分信息：

1. 声明类型，这里是 JWT
2. 声明加密的算法 通常直接使用 HMAC SHA256

然后将头部 JSON 进行 *base64* 编码，构成了第一部分

### 载荷 Playload

载荷就是存放有效信息的地方，这些有效信息包含三个部分

1. 标准中注册的声明
2. 公共的声明
公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息
但不建议添加敏感信息，因为该部分在客户端可解密
3. 私有的声明
私有声明是提供者和消费者所共同定义的声明，一般不建议存放敏感信息，
因为 *base64* 是对称解密的，意味着该部分信息可以归类为明文信息

标准中注册的声明 (建议但不强制使用) ：

|字段|全程|含义|
|-|-|-|
|iss|Issuer|JWT 签发者|
|sub|Subject|JWT 面向的用户|
|aud|Audience|接收 JWT 的一方|
|exp|Expiration Time|JWT 的过期时间，这个过期时间必须要大于签发时间|
|nbf|Not Before|定义在什么时间之前，该 JWT 都是不可用的|
|iat|Issued At|JWT 的签发时间|
|jti|JWT ID|JWT 的唯一身份标识，主要用来作为一次性 Token ，从而回避重放攻击|

同样将这个 JSON 进行 *base64* 编码，得到 JWT 的第二部分

对于已签名的令牌，此信息虽然不受篡改，但任何人都可读

**不要**在 JWT 的有效负载或头元素中放入秘密信息，除非它是加密的

### 签证 Signature

JWT 的第三部分是一个签证信息，这个签证信息由三部分组成：

1. *base64* 后的 header
2. *base64* 后的 payload
3. secret 盐值

把前面 2 个字符串连接起来，通过 header 中声明的加密方式进行加盐 `secret` 组合加密，就构成了 JWT 的第三部分

```js
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
var signature = HMACSHA256(encodedString, 'secret');
```

secret 是保存在服务端的，用来进行 JWT 的签发和验证，它就是你服务端的私钥，在任何场景都**不应该泄露出去**。

### 如何应用

一般是在请求头里加入 `Authorization`，并加上 `Bearer` 标注：

```js
fetch('api/user/1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

服务端会验证 Token，如果验证通过就会返回相应的资源:

![客户端与服务端的交互](/images/jwt-http.png)

## 优点总结

- 因为 JSON 的通用性，所以 JWT 是跨语言支持的
- 因为有 payload 部分，所以 JWT 可以在自身存储一些其他业务逻辑所必要的非敏感信息
- 便于传输，JWT 的构成非常简单，字节占用很小
- 它不需要在服务端保存会话信息，易于扩展

## Laravel 中使用

```bash
composer require tymon/jwt-auth
# 生成密钥
php artisan jwt:secret
# 发布
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"
```

注册中间件：

```php app\Http\Kernel.php
protected $routeMiddleware = [
    //...
    'auth.jwt' => \Tymon\JWTAuth\Http\Middleware\Authenticate::class,
];
```

修改 User 模型，实现 JWTSubject 接口与两个必要方法：

```php User.php
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
```

修改配置：

```php config/auth.php
'guards' => [
    //...
    'api' => [
        'driver' => 'jwt',//默认token
        'provider' => 'users',
    ],
],
```

新的登录方法如下：

```php ApiController.php
public function login()
{
    $credentials = request(['email', 'password']);

    if (!$token = auth('api')->attempt($credentials)) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    return response()->json([
        'token' => $token,
        'expires' => auth('api')->factory()->getTTL() * 60,
    ]);
}
```

增加对应路由，并且添加中间件：

```php routes/api.php
Route::post('login', 'ApiController@login');

Route::middleware('jwt.auth')->get('users', function () {
    return auth('api')->user();
});
```

想了解更多可以阅读 [JWT 扩展具体实现详解](https://learnku.com/articles/10889/detailed-implementation-of-jwt-extensions)
