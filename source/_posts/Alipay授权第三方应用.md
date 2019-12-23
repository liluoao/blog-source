---
title: Alipay授权第三方应用
urlname: alipay-authorize-3rd-app
date: 2018-04-08 10:41:33
category: 支付宝开发
tags: alipay
---
>1、商户对开发者进行应用授权后，开发者可以帮助商户完成相应的业务逻辑，例如代替商户发起当面付的收单请求。
2、授权采用标准的OAuth 2.0流程。

💻[API文档](https://docs.open.alipay.com/api_9/alipay.open.auth.token.app)

![第三方应用授权](
https://raw.githubusercontent.com/liluoao/simple/master/images/alipay.jpg)
<!-- more -->
#### 生成二维码
先生成一个用来获取关键参数的二维码开始授权

**请求地址**：
- 正式环境：https://openauth.alipay.com/oauth2/appToAppAuth.htm
- 沙箱环境：https://openauth.alipaydev.com/oauth2/appToAppAuth.htm

**请求方式**： `GET`

**参数说明**

|参数|类型|必须|说明|
|-|-|-|-|
|app_id|string|是|开发者应用的AppId|
|redirect_uri|string|是|回调页面|

可添加其它自定义参数

>注：授权链接中配置的redirect_uri内容需要与应用中配置的授权回调地址完全一样，否则无法正常授权。

#### 处理回调
用户扫码后获取回调的 `app_auth_code`

示例代码：
```php
$appAuthCode = Input::get('app_auth_code');
//AopClient参数同条码支付，略
$request = new AlipayOpenAuthTokenAppRequest();
$bizContent = [
    'grant_type' => 'authorization_code',
    'code' => $appAuthCode
];
//如果是刷新令牌
$bizContent = [
    'grant_type' => 'refresh_token',
    'refresh_token' => $appAuthCode
];
```

成功返回结果：
```json
{
    "alipay_open_auth_token_app_response": {
        "code": "10000",
        "msg": "Success",
        "user_id": "2088102150527498",
        "auth_app_id": "2013121100055554",
        "app_auth_token": "201509BBeff9351ad1874306903e96b91d248A36",
        "app_refresh_token": "201509BBdcba1e3347de4e75ba3fed2c9abebE36",
        "expires_in": "123456",
        "re_expires_in": "123456"
    },
    "sign": "ERITJKEIJKJHKKKKKKKHJEREEEEEEEEEEE"
}
```

`app_auth_token` 是之后绑定的关键，有效期为 `一年` ，
`app_refresh_token` 是用来刷新AUTH_TOKEN用的，两者需要妥善保存。