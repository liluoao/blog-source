---
title: Alipay条码支付及查询
urlname: alipay-barpay-and-query
date: 2018-04-07 16:05:52
category: 支付宝开发
tags: alipay
---

> 收银员使用扫码设备读取用户手机支付宝“付款码”/声波获取设备（如麦克风）读取用户手机支付宝的声波信息后，将二维码或条码信息/声波信息通过本接口上送至支付宝发起支付。

💻[API文档](https://docs.open.alipay.com/api_1/alipay.trade.pay)
💻[SDK下载](https://docs.open.alipay.com/54/103419)

下载SDK后，本接口需要使用 `AopClient` 与 `AlipayTradePayRequest` 类
先新建一个统一处理Alipay的类

<!-- more -->
```php
class Alipay {
    /**
     * 支付宝网关
     */
    private $gatewayUrl = 'https://openapi.alipay.com/gateway.do';

    /**
     * 应用ID
     */
    private $appId = '';

    /**
     * 商户私钥
     */
    private $privateKey = '';

    /**
     * 支付宝公钥
     */
    private $publicKey = '';

    /**
     * API版本
     */
    private $version = '1.0';

    /**
     * 签名方式
     */
    private $signType = 'RSA2';

    /**
     * 编码格式
     */
    private $charset = 'UTF-8';

    /**
     * 格式
     */
    private $format = 'json';

    /**
     * 场景
     */
    private $scene = 'bar_code';
}
```

为 `$appId` `$privateKey` `$publicKey` 设置 `getter` 和 `setter` 函数，在实例化时从配置读取。
如果使用沙箱测试，也可以将 `$gatewayUrl` 设为配置。

```php
public function __construct() {
    $this->setAppId(config('alipay.appid'));
    $this->setPrivateKey(config('alipay.privatekey'));
    $this->setPublicKey(config('alipay.publickey'));
}
```

本接口需要付款人的**条码**、商家自定义的**订单号**、自定义**消费内容**、**总金额**：
```php
/**
 * 条码支付
 *
 * @param string $orderNumber 自定义的订单号
 * @param string $authCode 付款人条码
 * @param string $subject 消费内容
 * @param float $totalMoney 总金额  需要转成%.2f格式
 */
public function barPay(string $orderNumber, string $authCode, string $subject, float $totalMoney) {
    $aop = new AopClient ();
    $aop->gatewayUrl = $this->gatewayUrl;
    $aop->appId = $this->getAppId();
    $aop->rsaPrivateKey = $this->getPrivateKey();
    $aop->alipayrsaPublicKey = $this->getPublicKey();
    $aop->apiVersion = $this->version;
    $aop->signType = $this->signType;
    $aop->postCharset = $this->charset;
    $aop->format = $this->format;

    $request = new AlipayTradePayRequest();

    $bizContent = [
        'out_trade_no' => $orderNumber,
        'scene' => $this->scene,
        'auth_code' => $authCode,
        'product_code' => 'FACE_TO_FACE_PAYMENT',
        'subject' => $subject,
        'total_amount' => $totalMoney,
        'body' => '',
    ];
    $request->setBizContent(json_encode($bizContent, JSON_UNESCAPED_UNICODE));

    $result = $aop->execute($request);

    $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
    $resultCode = $result->$responseNode->code;
}
```

`$resultCode` 为**10000**为正常，其它错误码含义见文档

支付没有直接完成时（可能由多种情况导致），需要查询订单支付结果：
```php
//AopClient参数同上，略
$request = new AlipayTradeQueryRequest();
$bizContent = [
    'out_trade_no' => $orderNumber,//支付时的商户订单号
    'trade_no' => $tradeNumber//支付宝交易号
];
```
两者不能同时为空，如果同时存在时优先取 `trade_no` 