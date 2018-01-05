---
title: Laravel的辅助函数
urlname: laravel-helpers
date: 2018-05-11 14:27:09
category: laravel
tags: laravel
---
在 `composer.json` 中定义了自动加载的文件：
```json
{
    //...
    "autoload": {
        //...
        "files": [
            "app/helpers.php"
        ]
    }
}
```
在 `app/helpers.php` 中自定义辅助函数：
```php
if (!function_exists('changeShowMoneyFormat')) {
    /**
     * 转换金额格式
     *
     * @param float $money 金额
     * @param int $length 保留位数
     *
     * @return string|bool 转换结果
     */
    function changeShowMoneyFormat($money, $length = 2) {
        return sprintf("%.{$length}f", $money);
    }
}
```
Packagist包：https://packagist.org/packages/sebastiaanluca/laravel-helpers

常用函数如：`dd()` `app()` `env()` `config()` `public_path()` `array_pluck()`

更多Laravel辅助函数见[Helpers](https://laravel.com/docs/5.6/helpers)