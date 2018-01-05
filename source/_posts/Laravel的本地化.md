---
title: Laravel的本地化
urlname: laravel-localization
date: 2018-05-12 15:11:14
category: laravel
tags: laravel
---
**i18n**（其来源是英文单词 internationalization 的首末字符i和n，18为中间的字符数）是“国际化”的简称。
在资讯领域，国际化(i18n)指让产品（出版物，软件，硬件等）无需做大的改变就能够适应不同的语言和地区的需要。对程序来说，在不修改内部代码的情况下，能根据不同语言及地区显示相应的界面。
对应的有**l10n**（ localization 的缩写形式，意即在 l 和 n 之间有 10 个字母），本意是指软件的“本地化”。

<!-- more -->

`config/app.php` 中的区域（语言）设置：
```php
/*
|--------------------------------------------------------------------------
| Application Locale Configuration
|--------------------------------------------------------------------------
|
| The application locale determines the default locale that will be used
| by the translation service provider. You are free to set this value
| to any of the locales which will be supported by the application.
|
*/

'locale' => 'zh-CN',

/*
|--------------------------------------------------------------------------
| Application Fallback Locale
|--------------------------------------------------------------------------
|
| The fallback locale determines the locale to use when the current one
| is not available. You may change the value to correspond to any of
| the language folders that are provided through your application.
|
*/

'fallback_locale' => 'en',
```
可以使用 `App Facade` 的 `setLocale()` 方法动态地更改当前语言：
```php
Route::get('welcome/{locale}', function ($locale) {
    App::setLocale($locale);
    //...
});
```
还有 `getLocale()` 及 `isLocale()` 方法确定当前的区域设置或者检查语言环境是否为给定值

例如Element文档：
- http://element-cn.eleme.io/#/zh-CN
- http://element-cn.eleme.io/#/en-US
- http://element-cn.eleme.io/#/es/

**zh** 为中文大类，其中还分为许多小类：
- zh-CN 简体中文，中华人民共和国
- zh-HK 繁体中文，香港特别行政区
- zh-MO 繁体中文，澳门特别行政区
- zh-SG 简体中文，新加坡
- zh-TW 繁体中文，中国台湾

语言目录为`resources/lang/`：
```
/resources
    /lang
        /en
            auth.php
            pagination.php
            passwords.php
            validation.php
        /zh-CN
            messages.php
            pagination.php
            passwords.php
            validation.php
```
`resources/lang/zh-CN/validation.php` 设置语言后会翻译表单验证的规则、标签等：
```php
<?php
return [
    'accepted'             => ':attribute 必须接受。',
    'active_url'           => ':attribute 不是一个有效的网址。',
    'after'                => ':attribute 必须要晚于 :date。',
    'after_or_equal'       => ':attribute 必须要等于 :date 或更晚。',
    'alpha'                => ':attribute 只能由字母组成。',
    //more...

    'attributes'           => [
        'name'                  => '名称',
        'username'              => '用户名',
        'email'                 => '邮箱',
        //more...
    ],
];
```
在应用中还可以使用 `__()` `trans()` `trans_choice()` 辅助方法来翻译
