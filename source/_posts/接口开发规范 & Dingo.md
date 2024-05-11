---
title: 接口开发规范 & Dingo
urlname: use-dingo-api-and-interface-development
date: 2018-10-10 10:42:37
category: Laravel
---

网络应用程序，分为前端和后端两个部分。当前的发展趋势，就是前端设备层出不穷（手机、平板、桌面电脑、其他专用设备......）。

因此，必须有一种统一的机制，方便不同的前端设备与后端进行通信。这导致 API 构架的流行，甚至出现 "API First" 的设计思想

RESTful API 是目前比较成熟的一套互联网应用程序的 API 设计理论。

![dingo](https://i.imgtg.com/2022/08/09/At5pG.png)

<!-- more -->

## RESTful

REST，即Representational State Transfer的缩写

如果一个架构符合 REST 原则，就称它为 RESTful 架构

### 资源（Resources）

REST 的名称"表现层状态转化"中，省略了主语

"表现层"其实指的是"资源"（Resources）的"表现层"

所谓"资源"，就是网络上的一个实体，或者说是网络上的一个具体信息。它可以是一段文本、一张图片、一首歌曲、一种服务，总之就是一个具体的实在

你可以用一个 URI（统一资源定位符）指向它，每种资源对应一个特定的 URI 。要获取这个资源，访问它的 URI 就可以，因此 URI 就成了每一个资源的地址或独一无二的识别符

所谓"上网"，就是与互联网上一系列的"资源"互动，调用它的 URI

### 表现层（Representation）

"资源"是一种信息实体，它可以有多种外在表现形式。我们把"资源"具体呈现出来的形式，叫做它的"表现层"（Representation）

比如，文本可以用 txt 格式表现，也可以用 HTML 格式、XML 格式、JSON 格式表现，甚至可以采用二进制格式；图片可以用 JPG 格式表现，也可以用 PNG 格式表现

URI 只代表资源的实体，不代表它的形式。严格地说，有些网址最后的".html"后缀名是不必要的，因为这个后缀名表示格式，属于"表现层"范畴，而 URI 应该只代表"资源"的位置

它的具体表现形式，应该在 HTTP 请求的头信息中用 Accept 和 Content-Type 字段指定，这两个字段才是对"表现层"的描述

### 状态转化（State Transfer）

访问一个网站，就代表了客户端和服务器的一个互动过程。在这个过程中，势必涉及到数据和状态的变化

互联网通信协议 HTTP 协议，是一个无状态协议。这意味着，所有的状态都保存在服务器端

因此，如果客户端想要操作服务器，必须通过某种手段，让服务器端发生"状态转化"（State Transfer）。而这种转化是建立在表现层之上的，所以就是"表现层状态转化"

客户端用到的手段，只能是 HTTP 协议。具体来说，就是 HTTP 协议里面，四个表示操作方式的动词：GET、POST、PUT、DELETE

它们分别对应四种基本操作：GET 用来获取资源，POST 用来新建资源（也可以用于更新资源），PUT 用来更新资源，DELETE 用来删除资源

## RESTful API 的设计细节

### 协议

API 与用户的通信协议，总是使用 HTTPs 协议

### 域名

尽量将API部署在专用域名之下

> <https://api.example.com>

如果确定API很简单，不会有进一步扩展，可以考虑放在主域名下

> <https://example.org/api/>

### 版本（Versioning）

应该将 API 的版本号放入 URL

> <https://api.example.com/v1/>

另一种做法是，将版本号放在 HTTP 头信息中

    Accept: vnd.example-com.foo+json; version=1.0
    Accept: vnd.example-com.foo+json; version=1.1
    Accept: vnd.example-com.foo+json; version=2.0

[Dingo](https://github.com/dingo/api) 的一个特色就是支持 API Versioning

通过 Composer 安装后发布配置文件：

```bash
php artisan vendor:publish --provider="Dingo\Api\Provider\LaravelServiceProvider"
```

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

### 路径（Endpoint）

路径又称"终点"（endpoint），表示API的具体网址。

在 RESTful 架构中，每个网址代表一种资源（resource），所以网址中不能有动词，只能有名词，而且所用的名词往往与数据库的表格名对应。一般来说，数据库中的表都是同种记录的"集合"（collection），所以API中的名词也应该使用复数

举例来说，有一个 API 提供动物园（zoo）的信息，还包括各种动物和雇员的信息，则它的路径应该设计成下面这样

    https://api.example.com/v1/zoos
    https://api.example.com/v1/animals
    https://api.example.com/v1/employees

### HTTP动词

    GET /zoos：列出所有动物园
    POST /zoos：新建一个动物园
    GET /zoos/ID：获取某个指定动物园的信息
    PUT /zoos/ID：更新某个指定动物园的信息（提供该动物园的全部信息）
    PATCH /zoos/ID：更新某个指定动物园的信息（提供该动物园的部分信息）
    DELETE /zoos/ID：删除某个动物园
    GET /zoos/ID/animals：列出某个指定动物园的所有动物
    DELETE /zoos/ID/animals/ID：删除某个指定动物园的指定动物

### 过滤信息（Filtering）

如果记录数量很多，服务器不可能都将它们返回给用户。API应该提供参数，过滤返回结果

    ?limit=10：指定返回记录的数量
    ?offset=10：指定返回记录的开始位置。
    ?page=2&per_page=100：指定第几页，以及每页的记录数。
    ?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
    ?animal_type_id=1：指定筛选条件

### 状态码（Status Codes）

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

### 错误处理（Error handling）

如果状态码是 4xx，就应该向用户返回出错信息。一般来说，返回的信息中将 error 作为键名，出错信息作为键值即可

```json
{
    error: "Invalid API key"
}
```

### 返回结果

针对不同操作，服务器向用户返回的结果应该符合以下规范

GET /collection：返回资源对象的列表（数组）
GET /collection/resource：返回单个资源对象
POST /collection：返回新生成的资源对象
PUT /collection/resource：返回完整的资源对象
PATCH /collection/resource：返回完整的资源对象
DELETE /collection/resource：返回一个空文档

控制器需要使用 `Dingo\Api\Routing\Helpers` Trait：

```php
use Dingo\Api\Routing\Helpers;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    use Helpers;
}
```

#### 响应一个数组

```php
public function show($id)
{
    $user = User::findOrFail($id);

    return $this->response->array($user->toArray());
}
```

#### 响应一个元素

```php
$user = User::findOrFail($id);

return $this->response->item($user, new UserTransformer);
```

#### 空响应

```php
return $this->response->noContent();
```

#### 错误响应

```php
return $this->response->error('This is an error.', 404);
return $this->response->errorNotFound();
return $this->response->errorBadRequest();
return $this->response->errorForbidden();
return $this->response->errorInternal();
return $this->response->errorUnauthorized();
```

#### 设置响应状态码

```php
return $this->response->item($user, new UserTransformer)->setStatusCode(200);
```

## 接口参数定义

接口设计中可以抽象出一些公共的参数，常见参数如下：

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

接口的设计肯定绕不开安全，我们需要尽可能的增加被攻击的难度，下面举几个例子：

### 过期验证

```php
if (microtime(true)*1000 - $params['timestamp'] > 5000) {
    throw new Exception(401, 'Expired request');
}
```

### 签名验证

```php
//公钥校验省略
$sign = md5(sha1(implode('-', $params) . $params['app_key']));
if ($sign !== $params['sign']) {
    throw new Exception(401, 'Invalid sign');
}
```

### 重放攻击

```php
//$noise：随机字符串或随机正整数，用于防止重放攻击
$key = md5("{$requestUri}-{$params['timestamp']}-{$params['noise']}");
if ($redis->exists($key)) {
    throw new Exception(401, 'Repeated request');
}
```

### 限流

```php
$key = md5("{$requestUri}-{$remoteAddr}-{$params['did']}");
if ($redis->get($key) > 60) {
    throw new Exception(401, 'Request limit');
}
$redis->incre($key);
```
